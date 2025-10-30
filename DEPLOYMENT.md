# Deployment Guide for Chinese Freelance Marketplace

## Infrastructure Architecture

### High-Level Architecture
```
Internet → Load Balancer → Web Servers (Django) → Database (PostgreSQL)
                              ↓                         ↑
                           Redis Cache           Read Replicas
                              ↓                         ↑
                        Elasticsearch          Search Cluster
                              ↓
                        Celery Workers → Message Queue
```

### Production Environment Setup

## 1. Server Requirements

### Minimum Production Configuration
- **Web Servers**: 3x EC2 instances (t3.medium or equivalent)
- **Database**: 1x RDS PostgreSQL (db.r5.large) with 2 read replicas
- **Cache**: 1x ElastiCache Redis (cache.r5.large)
- **Load Balancer**: Application Load Balancer
- **File Storage**: S3 or Alibaba Cloud OSS
- **CDN**: CloudFront or Alibaba Cloud CDN

### Recommended Configuration
- **Web Servers**: 5x EC2 instances (c5.large)
- **Database**: Aurora PostgreSQL cluster (db.r5.2xlarge)
- **Cache**: Redis Cluster (3 nodes)
- **Search**: Elasticsearch cluster (3 nodes)
- **Message Queue**: SQS or RabbitMQ cluster

## 2. Docker Configuration

### Dockerfile
```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "freelance.wsgi:application"]
```

### Docker Compose (Production)
```yaml
version: '3.8'

services:
  web:
    build: .
    env_file:
      - .env.production
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - static_volume:/static
      - media_volume:/media
    depends_on:
      - web

  db:
    image: postgres:15
    env_file:
      - .env.production
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  celery:
    build: .
    command: celery -A freelance worker -l info
    env_file:
      - .env.production
    depends_on:
      - db
      - redis

  celery-beat:
    build: .
    command: celery -A freelance beat -l info
    env_file:
      - .env.production
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
```

## 3. Nginx Configuration

### nginx.conf
```nginx
upstream django {
    least_conn;
    server web1:8000 weight=5 max_fails=3 fail_timeout=30s;
    server web2:8000 weight=5 max_fails=3 fail_timeout=30s;
    server web3:8000 weight=5 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name freelance-platform.cn www.freelance-platform.cn;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name freelance-platform.cn www.freelance-platform.cn;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    client_max_body_size 50M;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Static files
    location /static/ {
        alias /static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API endpoints
    location /api/ {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://django;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    location /api/v1/auth/login/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://django;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://django;
    }
}
```

## 4. Database Configuration

### PostgreSQL Optimization
```sql
-- postgresql.conf optimizations for high-traffic application

# Memory settings
shared_buffers = 256MB                  # 25% of RAM
effective_cache_size = 1GB              # 75% of RAM
work_mem = 4MB                          # Per connection
maintenance_work_mem = 64MB

# Connection settings
max_connections = 200
listen_addresses = '*'

# Performance settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Logging
log_min_duration_statement = 1000       # Log slow queries
log_checkpoints = on
log_connections = on
log_disconnections = on
```

### Database Migration Script
```bash
#!/bin/bash
# migrate.sh

set -e

echo "Starting database migration..."

# Create backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Update search indexes
python manage.py update_index

# Create superuser if doesn't exist
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
EOF

echo "Migration completed successfully!"
```

## 5. Environment Configuration

### Production Environment Variables
```bash
# .env.production

# Django settings
DEBUG=False
SECRET_KEY=your-very-secret-key-here
ALLOWED_HOSTS=freelance-platform.cn,www.freelance-platform.cn

# Database
DATABASE_URL=postgresql://username:password@db-host:5432/freelance_db
DATABASE_READ_REPLICA_URLS=postgresql://username:password@replica1-host:5432/freelance_db,postgresql://username:password@replica2-host:5432/freelance_db

# Redis
REDIS_URL=redis://redis-host:6379/0
REDIS_CACHE_URL=redis://redis-host:6379/1
CELERY_BROKER_URL=redis://redis-host:6379/2

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@freelance-platform.cn
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@freelance-platform.cn

# File storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=freelance-platform-media
AWS_S3_REGION_NAME=ap-east-1

# Payment gateways
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key

WECHAT_PAY_APP_ID=your-wechat-app-id
WECHAT_PAY_MCH_ID=your-wechat-mch-id
WECHAT_PAY_API_KEY=your-wechat-api-key

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
PAYMENT_SECRET_KEY=your-payment-secret-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO

# Search
ELASTICSEARCH_URL=http://elasticsearch-host:9200

# CDN
CDN_URL=https://cdn.freelance-platform.cn
```

## 6. CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt

    - name: Run tests
      run: |
        python manage.py test
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
        REDIS_URL: redis://localhost:6379/0

    - name: Run linting
      run: |
        flake8 .
        black --check .
        isort --check-only .

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/freelance-platform
          git pull origin main
          docker-compose down
          docker-compose build
          docker-compose up -d
          docker-compose exec web python manage.py migrate
          docker-compose exec web python manage.py collectstatic --noinput
```

## 7. Monitoring and Logging

### Health Check Endpoint
```python
# health/views.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import redis

def health_check(request):
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
    except:
        db_status = "unhealthy"

    try:
        # Check Redis connection
        cache.set('health_check', 'ok', 10)
        cache.get('health_check')
        redis_status = "healthy"
    except:
        redis_status = "unhealthy"

    status_code = 200 if db_status == "healthy" and redis_status == "healthy" else 503

    return JsonResponse({
        "status": "healthy" if status_code == 200 else "unhealthy",
        "database": db_status,
        "redis": redis_status,
        "version": "1.0.0"
    }, status=status_code)
```

### Logging Configuration
```python
# settings/production.py

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            'format': '{"level": "{levelname}", "time": "{asctime}", "module": "{module}", "message": "{message}"}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/freelance.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'json',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/freelance_errors.log',
            'maxBytes': 1024*1024*15,
            'backupCount': 10,
            'formatter': 'json',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file', 'error_file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'freelance': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

## 8. Backup and Recovery

### Database Backup Script
```bash
#!/bin/bash
# backup_db.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="freelance_db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://freelance-platform-backups/database/

# Remove local backups older than 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

### Media Backup Script
```bash
#!/bin/bash
# backup_media.sh

BACKUP_DIR="/backups/media"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Sync media files to backup
aws s3 sync s3://freelance-platform-media/ $BACKUP_DIR/media_$DATE/

# Create archive
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz -C $BACKUP_DIR media_$DATE/

# Upload archive to backup bucket
aws s3 cp $BACKUP_DIR/media_backup_$DATE.tar.gz s3://freelance-platform-backups/media/

# Clean up
rm -rf $BACKUP_DIR/media_$DATE

echo "Media backup completed: media_backup_$DATE.tar.gz"
```

This deployment guide provides comprehensive instructions for deploying the Chinese freelance marketplace platform in a production environment with proper security, scalability, and monitoring considerations.