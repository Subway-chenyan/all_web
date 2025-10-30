# Django Project Structure for Chinese Freelance Marketplace

## Project Directory Structure

```
chinese_freelance_marketplace/
├── manage.py
├── requirements.txt
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── config/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── celery.py
├── apps/
│   ├── __init__.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── forms.py
│   │   ├── managers.py
│   │   ├── permissions.py
│   │   ├── tasks.py
│   │   ├── migrations/
│   │   └── tests/
│   ├── gigs/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── filters.py
│   │   ├── managers.py
│   │   ├── tasks.py
│   │   ├── migrations/
│   │   └── tests/
│   ├── orders/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── services.py
│   │   ├── tasks.py
│   │   ├── migrations/
│   │   └── tests/
│   ├── payments/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── gateways/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── alipay.py
│   │   │   └── wechat.py
│   │   ├── services.py
│   │   ├── tasks.py
│   │   ├── migrations/
│   │   └── tests/
│   ├── messaging/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── consumers.py
│   │   ├── routing.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── tasks.py
│   │   ├── migrations/
│   │   └── tests/
│   ├── reviews/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── services.py
│   │   ├── tasks.py
│   │   ├── migrations/
│   │   └── tests/
│   ├── notifications/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── services.py
│   │   ├── tasks.py
│   │   ├── migrations/
│   │   └── tests/
│   └── common/
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── models.py
│       ├── permissions.py
│       ├── pagination.py
│       ├── utils.py
│       ├── validators.py
│       ├── decorators.py
│       ├── exceptions.py
│       └── services.py
├── templates/
│   ├── base.html
│   ├── users/
│   │   ├── login.html
│   │   ├── register.html
│   │   └── profile.html
│   ├── gigs/
│   │   ├── list.html
│   │   ├── detail.html
│   │   └── create.html
│   └── emails/
│       ├── verification.html
│       ├── password_reset.html
│       └── order_notification.html
├── static/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
├── media/
│   ├── profiles/
│   ├── gigs/
│   ├── portfolios/
│   └── messages/
├── locale/
│   ├── zh_CN/
│   │   └── LC_MESSAGES/
│   │       ├── django.po
│   │       └── django.mo
│   └── en/
│       └── LC_MESSAGES/
│           ├── django.po
│           └── django.mo
├── docs/
│   ├── api.md
│   ├── database_schema.md
│   └── deployment.md
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── backup.sh
└── tests/
    ├── __init__.py
    ├── test_integration.py
    ├── test_performance.py
    └── fixtures/
```

## Key Configuration Files

### requirements.txt
```
Django==4.2.7
djangorestframework==3.14.0
django-allauth==0.57.0
django-cors-headers==4.3.1
django-filter==23.3
django-storages==1.14.2
django-crispy-forms==2.1
django-extensions==3.2.3
celery==5.3.4
redis==5.0.1
psycopg2-binary==2.9.9
Pillow==10.1.0
python-decouple==3.8
python-jose[cryptography]==3.3.0
daphne==4.0.0
channels==4.0.0
channels-redis==4.1.0
boto3==1.29.7
stripe==7.6.0
wechatpy==1.8.18
alipay-sdk-python==3.7.3
pytest==7.4.3
pytest-django==4.7.0
factory-boy==3.3.0
coverage==7.3.2
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: freelance_marketplace
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DEBUG=1
      - DATABASE_URL=postgresql://postgres:password@db:5432/freelance_marketplace
      - REDIS_URL=redis://redis:6379/0

  celery:
    build: .
    command: celery -A config worker -l info
    volumes:
      - .:/app
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/freelance_marketplace
      - REDIS_URL=redis://redis:6379/0

  celery-beat:
    build: .
    command: celery -A config beat -l info
    volumes:
      - .:/app
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/freelance_marketplace
      - REDIS_URL=redis://redis:6379/0

volumes:
  postgres_data:
  redis_data:
```

### .env.example
```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/freelance_marketplace

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name

# Payment Gateways
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key

WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
WECHAT_MCH_ID=your-wechat-mch-id
WECHAT_API_KEY=your-wechat-api-key

# Social Login
GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret

# Security
SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=0
SECURE_HSTS_INCLUDE_SUBDOMAINS=False
SECURE_HSTS_PRELOAD=False
```

## Django Settings Configuration

### config/settings/base.py
```python
import os
from decouple import config
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Security
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# Application Definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'corsheaders',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'channels',
    'crispy_forms',
    'django_extensions',
]

LOCAL_APPS = [
    'apps.users',
    'apps.gigs',
    'apps.orders',
    'apps.payments',
    'apps.messaging',
    'apps.reviews',
    'apps.notifications',
    'apps.common',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='freelance_marketplace'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://localhost:6379/0'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Internationalization
LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_TZ = True

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'apps.common.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# Django Allauth
SITE_ID = 1
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# Celery Configuration
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Channels
ASGI_APPLICATION = 'config.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [config('REDIS_URL', default='redis://localhost:6379/0')],
        },
    },
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# File Upload
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Security Settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

This comprehensive project structure provides a solid foundation for building the Chinese freelance marketplace with proper separation of concerns, scalability, and maintainability.