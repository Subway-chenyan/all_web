# Testing Strategy and Deployment Guide

## Comprehensive Testing Strategy

### 1. Unit Testing

#### Model Tests
```python
# apps/users/tests/test_models.py
import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.users.models import User, UserProfile, Skill, UserSkill, Portfolio

class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123',
            user_type='freelancer'
        )

    def test_user_creation(self):
        """Test user model creation"""
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.user_type, 'freelancer')
        self.assertFalse(self.user.is_verified)

    def test_user_properties(self):
        """Test user model properties"""
        self.assertTrue(self.user.is_freelancer)
        self.assertFalse(self.user.is_client)

    def test_full_name_property(self):
        """Test full name property"""
        self.user.first_name = '张'
        self.user.last_name = '三'
        self.user.save()
        self.assertEqual(self.user.full_name, '张 三')

class UserProfileTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)

    def test_profile_creation(self):
        """Test profile creation"""
        self.assertEqual(self.profile.user, self.user)
        self.assertEqual(self.profile.profile_completion, 0)

    def test_profile_completion_calculation(self):
        """Test profile completion calculation"""
        self.profile.profile_image = 'test.jpg'
        self.profile.location = '北京'
        self.profile.save()

        completion = self.profile.calculate_completion()
        self.assertGreater(completion, 0)

class PortfolioTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_portfolio_creation(self):
        """Test portfolio creation"""
        portfolio = Portfolio.objects.create(
            user=self.user,
            title='测试项目',
            description='这是一个测试项目',
            image='test.jpg'
        )
        self.assertEqual(portfolio.user, self.user)
        self.assertEqual(portfolio.title, '测试项目')
        self.assertFalse(portfolio.is_featured)
```

#### View/Serializer Tests
```python
# apps/users/tests/test_views.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()

class UserAuthenticationTest(APITestCase):
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'username': 'testuser'
        }

    def test_user_registration(self):
        """Test user registration endpoint"""
        url = reverse('user-register')
        response = self.client.post(url, self.user_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='test@example.com').exists())

    def test_user_login(self):
        """Test user login endpoint"""
        # Create user first
        User.objects.create_user(**self.user_data)

        url = reverse('token_obtain_pair')
        login_data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post(url, login_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        url = reverse('token_obtain_pair')
        login_data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, login_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserProfileTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        """Test getting user profile"""
        url = reverse('user-profile')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_update_profile(self):
        """Test updating user profile"""
        url = reverse('user-profile')
        update_data = {
            'first_name': '张',
            'last_name': '三',
            'bio': '这是一个测试用户'
        }
        response = self.client.patch(url, update_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, '张')
        self.assertEqual(self.user.bio, '这是一个测试用户')
```

#### Service/Business Logic Tests
```python
# apps/orders/tests/test_services.py
import pytest
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order
from apps.orders.services import OrderService, DeliveryService
from apps.gigs.models import Gig, GigPackage

class OrderServiceTest(TestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(
            email='buyer@example.com',
            password='testpass123',
            user_type='client'
        )
        self.seller = User.objects.create_user(
            email='seller@example.com',
            password='testpass123',
            user_type='freelancer'
        )

        self.gig = Gig.objects.create(
            user=self.seller,
            title='测试服务',
            description='这是一个测试服务'
        )

        self.package = GigPackage.objects.create(
            gig=self.gig,
            name='基础套餐',
            price=Decimal('100.00'),
            delivery_days=3
        )

    def test_create_order(self):
        """Test order creation"""
        order = OrderService.create_order(
            buyer=self.buyer,
            gig=self.gig,
            package=self.package,
            requirements={'message': '请尽快完成'}
        )

        self.assertIsInstance(order, Order)
        self.assertEqual(order.buyer, self.buyer)
        self.assertEqual(order.seller, self.seller)
        self.assertEqual(order.total_amount, Decimal('100.00'))
        self.assertEqual(order.status, 'pending')

    def test_order_acceptance(self):
        """Test order acceptance by seller"""
        order = OrderService.create_order(
            buyer=self.buyer,
            gig=self.gig,
            package=self.package
        )

        accepted_order = OrderService.accept_order(order.id, self.seller)
        self.assertEqual(accepted_order.status, 'in_progress')
        self.assertIsNotNone(accepted_order.accepted_at)

    def test_order_completion(self):
        """Test order completion"""
        order = OrderService.create_order(
            buyer=self.buyer,
            gig=self.gig,
            package=self.package
        )
        order = OrderService.accept_order(order.id, self.seller)

        completed_order = OrderService.complete_order(order.id)
        self.assertEqual(completed_order.status, 'completed')
        self.assertIsNotNone(completed_order.completed_at)

    def test_order_cancellation(self):
        """Test order cancellation"""
        order = OrderService.create_order(
            buyer=self.buyer,
            gig=self.gig,
            package=self.package
        )

        cancelled_order = OrderService.cancel_order(order.id, self.buyer, '改变主意了')
        self.assertEqual(cancelled_order.status, 'cancelled')
```

### 2. Integration Testing

#### API Integration Tests
```python
# tests/test_integration.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from decimal import Decimal

User = get_user_model()

class GigWorkflowIntegrationTest(APITestCase):
    def setUp(self):
        # Create users
        self.freelancer = User.objects.create_user(
            email='freelancer@example.com',
            password='testpass123',
            user_type='freelancer',
            first_name='李',
            last_name='四'
        )

        self.client_user = User.objects.create_user(
            email='client@example.com',
            password='testpass123',
            user_type='client',
            first_name='王',
            last_name='五'
        )

    def test_complete_gig_workflow(self):
        """Test complete gig creation to order workflow"""

        # 1. Create gig
        self.client.force_authenticate(user=self.freelancer)

        gig_data = {
            'title': 'Python开发服务',
            'description': '提供专业的Python开发服务',
            'category_id': 1  # Assuming category exists
        }

        response = self.client.post('/api/gigs/', gig_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        gig_id = response.data['id']

        # 2. Add package
        package_data = {
            'gig': gig_id,
            'name': '基础套餐',
            'package_type': 'basic',
            'description': '基础开发服务',
            'price': '500.00',
            'delivery_days': 5,
            'revisions': 2
        }

        response = self.client.post(f'/api/gigs/{gig_id}/packages/', package_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        package_id = response.data['id']

        # 3. Upload gig image
        image = SimpleUploadedFile(
            "test.jpg",
            b"file_content",
            content_type="image/jpeg"
        )

        response = self.client.post(f'/api/gigs/{gig_id}/media/', {
            'file': image,
            'media_type': 'image',
            'title': '示例图片'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 4. Publish gig
        response = self.client.post(f'/api/gigs/{gig_id}/publish/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 5. Search for gig as client
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get('/api/search/gigs/', {'q': 'Python开发'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)

        # 6. Create order
        order_data = {
            'gig_id': gig_id,
            'package_id': package_id,
            'requirements': {
                'message': '需要开发一个电商网站'
            }
        }

        response = self.client.post('/api/orders/', order_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order_id = response.data['id']

        # 7. Accept order as freelancer
        self.client.force_authenticate(user=self.freelancer)
        response = self.client.post(f'/api/orders/{order_id}/accept/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 8. Submit delivery
        delivery_data = {
            'title': '项目完成',
            'description': '电商网站开发完成，请验收',
            'files': [
                SimpleUploadedFile("project.zip", b"zip_content")
            ]
        }

        response = self.client.post(f'/api/orders/{order_id}/deliveries/', delivery_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 9. Accept delivery as client
        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(f'/api/deliveries/1/accept/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 10. Verify order completion
        response = self.client.get(f'/api/orders/{order_id}/')
        self.assertEqual(response.data['status'], 'completed')
```

#### Payment Integration Tests
```python
# tests/test_payment_integration.py
from unittest.mock import patch, MagicMock
from rest_framework.test import APITestCase
from apps.payments.gateways.alipay import AlipayGateway
from apps.payments.models import Payment, Transaction

class PaymentIntegrationTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    @patch('apps.payments.gateways.alipay.AlipayGateway.create_payment')
    def test_alipay_payment_creation(self, mock_create_payment):
        """Test Alipay payment creation"""
        # Mock Alipay response
        mock_create_payment.return_value = {
            'payment_url': 'https://openapi.alipay.com/gateway.do?...',
            'payment_id': 'test_payment_id'
        }

        payment_data = {
            'order_id': 'test_order_id',
            'amount': '100.00',
            'payment_method': 'alipay',
            'return_url': 'https://example.com/payment/return',
            'notify_url': 'https://example.com/payment/notify'
        }

        response = self.client.post('/api/payments/create/', payment_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('payment_url', response.data)
        self.assertIn('payment_id', response.data)

    @patch('apps.payments.gateways.alipay.AlipayGateway.verify_payment')
    def test_alipay_payment_verification(self, mock_verify_payment):
        """Test Alipay payment verification"""
        # Mock verification success
        mock_verify_payment.return_value = True

        # Create test payment
        payment = Payment.objects.create(
            order_id='test_order_id',
            user=self.user,
            amount=Decimal('100.00'),
            payment_method='alipay',
            status='pending'
        )

        response = self.client.post(f'/api/payments/{payment.id}/verify/', {
            'trade_no': 'test_trade_no',
            'out_trade_no': 'test_out_trade_no'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payment.refresh_from_db()
        self.assertEqual(payment.status, 'completed')
```

### 3. Performance Testing

#### Load Testing with Locust
```python
# tests/locustfile.py
from locust import HttpUser, task, between
import json
import random

class FreelanceMarketplaceUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Called when a user starts"""
        # Login user
        response = self.client.post("/api/auth/login/", json={
            "email": f"user{random.randint(1, 1000)}@example.com",
            "password": "testpass123"
        })

        if response.status_code == 200:
            self.token = response.json()["access"]
            self.client.headers.update({
                "Authorization": f"Bearer {self.token}"
            })

    @task(3)
    def search_gigs(self):
        """Search for gigs"""
        search_terms = ["Python开发", "UI设计", "内容写作", "数据录入"]
        self.client.get(f"/api/search/gigs/?q={random.choice(search_terms)}")

    @task(2)
    def browse_categories(self):
        """Browse gig categories"""
        self.client.get("/api/categories/")

    @task(2)
    def view_gig_details(self):
        """View gig details"""
        gig_id = random.randint(1, 1000)
        self.client.get(f"/api/gigs/{gig_id}/")

    @task(1)
    def get_user_profile(self):
        """Get user profile"""
        user_id = random.randint(1, 1000)
        self.client.get(f"/api/users/{user_id}/")

    @task(1)
    def check_notifications(self):
        """Check notifications"""
        self.client.get("/api/notifications/")

class HeavyUser(HttpUser):
    wait_time = between(0.5, 2)

    def on_start(self):
        # Login as power user
        response = self.client.post("/api/auth/login/", json={
            "email": "poweruser@example.com",
            "password": "testpass123"
        })

        if response.status_code == 200:
            self.token = response.json()["access"]
            self.client.headers.update({
                "Authorization": f"Bearer {self.token}"
            })

    @task
    def create_gig(self):
        """Create new gig"""
        gig_data = {
            "title": f"测试服务 {random.randint(1, 10000)}",
            "description": "这是一个测试服务描述",
            "category_id": random.randint(1, 10)
        }
        self.client.post("/api/gigs/", json=gig_data)

    @task
    def send_message(self):
        """Send messages"""
        conversation_data = {
            "recipient_id": random.randint(1, 1000),
            "message": f"测试消息 {random.randint(1, 10000)}"
        }
        self.client.post("/api/conversations/", json=conversation_data)
```

#### Database Performance Tests
```python
# tests/test_database_performance.py
import pytest
from django.test import TestCase
from django.test.utils import override_settings
from django.db import connection
from django.utils import timezone
from apps.gigs.models import Gig, GigCategory
from apps.users.models import User
from time import time

class DatabasePerformanceTest(TestCase):
    def setUp(self):
        # Create test data
        self.category = GigCategory.objects.create(
            name='测试分类',
            slug='test-category'
        )

        # Create multiple users and gigs for testing
        self.users = []
        for i in range(100):
            user = User.objects.create_user(
                email=f'user{i}@example.com',
                password='testpass123',
                user_type='freelancer'
            )
            self.users.append(user)

        self.gigs = []
        for user in self.users:
            for j in range(5):
                gig = Gig.objects.create(
                    user=user,
                    title=f'测试服务 {user.id}-{j}',
                    description='测试描述',
                    category=self.category,
                    status='active'
                )
                self.gigs.append(gig)

    @override_settings(DEBUG=True)
    def test_gig_list_query_performance(self):
        """Test gig list query performance"""
        start_time = time()

        # Test query without optimization
        with self.assertNumQueries(1):
            gigs = list(Gig.objects.filter(status='active'))

        query_time = time() - start_time
        self.assertLess(query_time, 0.1)  # Should complete in less than 100ms

    @override_settings(DEBUG=True)
    def test_gig_search_performance(self):
        """Test gig search performance"""
        start_time = time()

        # Test search query with filtering
        with self.assertNumQueries(1):
            gigs = list(Gig.objects.filter(
                status='active',
                category=self.category
            ).select_related('category', 'user').prefetch_related('packages'))

        query_time = time() - start_time
        self.assertLess(query_time, 0.2)  # Should complete in less than 200ms

    def test_database_index_usage(self):
        """Test that database indexes are being used"""
        # Reset query count
        connection.queries_log.clear()

        # Execute query that should use index
        list(Gig.objects.filter(status='active'))

        # Check if index was used (this would need database-specific implementation)
        # For PostgreSQL, you could use EXPLAIN ANALYZE to verify index usage
```

### 4. Security Testing

#### Security Test Suite
```python
# tests/test_security.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.test import Client
from django.urls import reverse

User = get_user_model()

class SecurityTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_sql_injection_protection(self):
        """Test SQL injection protection"""
        malicious_input = "'; DROP TABLE users; --"

        # Test in search parameter
        response = self.client.get(f'/api/search/gigs/?q={malicious_input}')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Verify table still exists
        self.assertTrue(User.objects.filter(email='test@example.com').exists())

    def test_xss_protection(self):
        """Test XSS protection"""
        xss_payload = '<script>alert("XSS")</script>'

        # Test in gig creation
        self.client.force_authenticate(user=self.user)
        gig_data = {
            'title': xss_payload,
            'description': xss_payload,
            'category_id': 1
        }

        response = self.client.post('/api/gigs/', gig_data, format='json')

        if response.status_code == status.HTTP_201_CREATED:
            # Verify script tags are not executed
            gig_response = self.client.get(f'/api/gigs/{response.data["id"]}/')
            self.assertNotIn('<script>', gig_response.data['title'])
            self.assertNotIn('<script>', gig_response.data['description'])

    def test_csrf_protection(self):
        """Test CSRF protection"""
        client = Client(enforce_csrf_checks=True)
        client.login(email='test@example.com', password='testpass123')

        # Test POST without CSRF token
        response = client.post('/api/gigs/', {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_rate_limiting(self):
        """Test API rate limiting"""
        # Attempt multiple rapid requests
        for i in range(100):  # Exceed rate limit
            response = self.client.post('/api/auth/login/', {
                'email': 'test@example.com',
                'password': 'wrongpassword'
            })

            if response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                break

        # Verify rate limiting is working
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_authorization_bypass(self):
        """Test authorization bypass protection"""
        # Create another user's gig
        other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )

        # Try to access/modify other user's data
        self.client.force_authenticate(user=self.user)

        # Should not be able to delete other user's gig
        response = self.client.delete(f'/api/gigs/999/')  # Assuming gig 999 belongs to other user
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
```

---

## Deployment Guide

### 1. Production Environment Setup

#### Docker Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M

  web:
    build:
      context: .
      dockerfile: Dockerfile.prod
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - static_volume:/var/www/static
      - media_volume:/var/www/media
    depends_on:
      - web
    restart: unless-stopped

  celery:
    build:
      context: .
      dockerfile: Dockerfile.prod
    command: celery -A config worker -l info --concurrency=4
    volumes:
      - media_volume:/app/media
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2

  celery-beat:
    build:
      context: .
      dockerfile: Dockerfile.prod
    command: celery -A config beat -l info
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped

  monitoring:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
```

#### Production Dockerfile
```dockerfile
# Dockerfile.prod
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        nginx \
        gettext \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create directories
RUN mkdir -p /app/staticfiles /app/media /app/logs

# Collect static files
RUN python manage.py collectstatic --noinput

# Set permissions
RUN chmod +x scripts/entrypoint.sh

# Expose port
EXPOSE 8000

# Entry point
ENTRYPOINT ["scripts/entrypoint.sh"]
```

#### Nginx Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream web {
        server web:8000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Static files
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Media files
        location /media/ {
            alias /var/www/media/;
            expires 1M;
            add_header Cache-Control "public";
        }

        # API endpoints with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            # Auth endpoints with stricter rate limiting
            location /api/auth/ {
                limit_req zone=auth burst=5 nodelay;
                proxy_pass http://web;
            }

            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket for Django Channels
        location /ws/ {
            proxy_pass http://web;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Default location
        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 2. Deployment Scripts

#### Entrypoint Script
```bash
#!/bin/bash
# scripts/entrypoint.sh

set -e

# Wait for database
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database is ready!"

# Wait for Redis
echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "Redis is ready!"

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='${SUPERUSER_EMAIL}').exists():
    User.objects.create_superuser('${SUPERUSER_EMAIL}', '${SUPERUSER_PASSWORD}')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the application
echo "Starting application..."
exec "$@"
```

#### Deployment Script
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

# Configuration
REPO_URL="https://github.com/yourusername/chinese-freelance-marketplace.git"
DEPLOY_DIR="/opt/freelance_marketplace"
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting deployment at $(date)"

# Create backup
echo "Creating database backup..."
docker-compose exec db pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Pull latest code
echo "Pulling latest code..."
cd $DEPLOY_DIR
git pull origin main

# Build and deploy
echo "Building and deploying containers..."
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Run health checks
echo "Running health checks..."
if curl -f http://localhost/api/health/; then
    echo "Health check passed!"
else
    echo "Health check failed! Rolling back..."
    # Rollback logic here
    exit 1
fi

# Cleanup old images
echo "Cleaning up old Docker images..."
docker image prune -f

echo "Deployment completed successfully at $(date)"
```

### 3. Monitoring and Logging

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'django'
    static_configs:
      - targets: ['web:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'postgres'
    static_configs:
      - targets: ['db:5432']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
```

#### Django Monitoring
```python
# apps/common/middleware.py
import time
import logging
from django.utils.deprecation import MiddlewareMixin
from prometheus_client import Counter, Histogram, generate_latest

# Metrics
REQUEST_COUNT = Counter('django_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('django_request_duration_seconds', 'Request duration')

logger = logging.getLogger(__name__)

class PrometheusMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()

    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time

            # Record metrics
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.path,
                status=response.status_code
            ).inc()

            REQUEST_DURATION.observe(duration)

            # Log slow requests
            if duration > 1.0:
                logger.warning(
                    f"Slow request: {request.method} {request.path} took {duration:.2f}s"
                )

        return response

def metrics_view(request):
    """Prometheus metrics endpoint"""
    return HttpResponse(generate_latest(), content_type='text/plain')
```

### 4. Backup and Recovery

#### Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Configuration
DB_NAME="freelance_marketplace"
DB_USER="postgres"
BACKUP_DIR="/opt/backups"
S3_BUCKET="your-backup-bucket"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting backup at $(date)"

# Database backup
echo "Creating database backup..."
docker-compose exec db pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Media files backup
echo "Creating media files backup..."
tar -czf "$BACKUP_DIR/media_backup_$DATE.tar.gz" media/

# Upload to S3
echo "Uploading backups to S3..."
aws s3 cp "$BACKUP_DIR/db_backup_$DATE.sql.gz" "s3://$S3_BUCKET/database/"
aws s3 cp "$BACKUP_DIR/media_backup_$DATE.tar.gz" "s3://$S3_BUCKET/media/"

# Cleanup old backups (keep last 30 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
aws s3 ls s3://$S3_BUCKET/database/ | while read -r line; do
    createDate=$(echo $line | awk '{print $1" "$2}')
    createDate=$(date -d"$createDate" +%s)
    olderThan=$(date -d"30 days ago" +%s)
    if [[ $createDate -lt $olderThan ]]; then
        fileName=$(echo $line | awk '{print $4}')
        aws s3 rm "s3://$S3_BUCKET/database/$fileName"
    fi
done

echo "Backup completed at $(date)"
```

This comprehensive testing and deployment guide provides:

1. **Complete Test Coverage**: Unit, integration, performance, and security tests
2. **Production-Ready Deployment**: Docker, Nginx, SSL, and monitoring
3. **Automated Workflows**: Scripts for deployment, backup, and monitoring
4. **Performance Optimization**: Load testing and database optimization
5. **Security Hardening**: CSRF, XSS, SQL injection protection
6. **Monitoring & Alerting**: Prometheus metrics and logging
7. **Backup & Recovery**: Automated backup and disaster recovery

The strategy ensures the platform is thoroughly tested, secure, performant, and production-ready for a Chinese freelance marketplace.