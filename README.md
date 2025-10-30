# Chinese Freelance Marketplace Platform

A comprehensive backend system for a Chinese freelance marketplace similar to Fiverr, built with Django, PostgreSQL, and Redis.

## 🏗️ Project Overview

This project provides a complete backend architecture for a freelance marketplace platform specifically designed for the Chinese market. It supports both Chinese and English languages, integrates with local payment systems (Alipay, WeChat Pay), and follows Chinese regulatory requirements.

## 📋 Features

### Core Features
- **User Management**: Multi-role system (freelancers, clients, admins)
- **Service Marketplace**: Create, browse, and manage freelance services
- **Order Management**: Complete order lifecycle from creation to completion
- **Payment Processing**: Integration with Alipay and WeChat Pay
- **Communication**: Real-time messaging and notifications
- **Reviews & Ratings**: Trust and reputation system
- **Search & Discovery**: Advanced search with Elasticsearch
- **File Management**: Secure file upload and storage

### Technical Features
- **RESTful API**: Comprehensive API with OpenAPI documentation
- **Real-time Features**: WebSocket support for live messaging
- **Background Tasks**: Asynchronous processing with Celery
- **Multi-level Caching**: Redis-based caching strategy
- **Security**: JWT authentication, rate limiting, data encryption
- **Scalability**: Microservices-ready architecture
- **Monitoring**: Comprehensive logging and error tracking

## 🛠️ Technology Stack

### Core Technologies
- **Backend**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL 15+ with read replicas
- **Cache**: Redis 7+ for caching and message queuing
- **Search**: Elasticsearch 8+ for advanced search
- **Background Tasks**: Celery with Redis broker

### Additional Services
- **Authentication**: JWT-based authentication
- **File Storage**: AWS S3 / Alibaba Cloud OSS
- **Payment**: Alipay SDK, WeChat Pay SDK
- **Email**: SendGrid / Aliyun DirectMail
- **SMS**: Twilio / Aliyun SMS
- **Monitoring**: Sentry for error tracking

### Development Tools
- **Containerization**: Docker & Docker Compose
- **Code Quality**: Black, isort, flake8, mypy
- **Testing**: pytest with pytest-django
- **Documentation**: drf-spectacular for API docs

## 📁 Project Structure

```
all_web/
├── ARCHITECTURE.md          # Detailed system architecture
├── DEPLOYMENT.md            # Production deployment guide
├── TECH_STACK.md           # Technology stack details
├── DIAGRAMS.md             # System architecture diagrams
├── README.md               # This file
└── .git/                  # Git repository
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd all_web
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the development environment**
```bash
docker-compose up -d
```

4. **Run migrations**
```bash
docker-compose exec web python manage.py migrate
```

5. **Create superuser**
```bash
docker-compose exec web python manage.py createsuperuser
```

6. **Collect static files**
```bash
docker-compose exec web python manage.py collectstatic
```

7. **Access the application**
- API: http://localhost:8000/api/v1/
- Admin: http://localhost:8000/admin/
- API Documentation: http://localhost:8000/api/docs/

## 📚 Documentation

### Architecture Documents
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture with database schema, API design, and security considerations
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide with Docker, Nginx, and monitoring setup
- **[TECH_STACK.md](./TECH_STACK.md)** - Detailed technology stack and recommended versions
- **[DIAGRAMS.md](./DIAGRAMS.md)** - Visual architecture diagrams and system flows

### API Documentation
Once running, access the interactive API documentation at:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## 🔧 Configuration

### Environment Variables
Key environment variables to configure:

```bash
# Django settings
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379/0
CELERY_BROKER_URL=redis://host:6379/1

# Payment gateways
ALIPAY_APP_ID=your-alipay-app-id
WECHAT_PAY_APP_ID=your-wechat-app-id

# File storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
```

## 🔐 Security Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based permissions
- **Rate Limiting**: Multiple levels of rate limiting
- **Data Encryption**: Sensitive data encryption at rest
- **Input Validation**: Comprehensive data validation
- **CSRF Protection**: Built-in Django CSRF protection
- **Security Headers**: OWASP recommended security headers

## 📊 Monitoring & Logging

- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Custom performance metrics
- **Structured Logging**: JSON-formatted logs
- **Health Checks**: Comprehensive health check endpoints
- **Database Monitoring**: Query performance tracking

## 🚀 Deployment

### Production Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions including:

- Docker configuration
- Nginx setup with SSL
- Database optimization
- Caching strategies
- Backup procedures
- CI/CD pipeline setup

### Scaling Considerations
- Horizontal scaling with multiple web servers
- Database read replicas for scaling reads
- Redis clustering for high availability
- Elasticsearch cluster for search
- CDN integration for static assets

## 🧪 Testing

### Running Tests
```bash
# Run all tests
docker-compose exec web python manage.py test

# Run with coverage
docker-compose exec web coverage run --source='.' manage.py test
docker-compose exec web coverage report
```

### Test Coverage
- Unit tests for models and services
- Integration tests for API endpoints
- Performance tests for critical paths
- Security tests for authentication flows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use Black for code formatting
- Follow PEP 8 style guide
- Write comprehensive tests
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the docs directory
- Review the architecture diagrams for system understanding

## 🌟 Acknowledgments

- Django REST Framework for excellent API toolkit
- Celery for reliable background task processing
- Redis for fast caching and queuing
- Elasticsearch for powerful search capabilities
- The open-source community for inspiration and tools

---

**Note**: This is the backend documentation. Frontend applications should be developed separately to consume this API. The API is designed to support web, mobile, and third-party integrations.