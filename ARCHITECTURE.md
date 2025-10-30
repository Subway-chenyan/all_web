# Chinese Freelance Marketplace Platform - Backend Architecture

## Overview
A comprehensive backend system for a Chinese freelance marketplace similar to Fiverr, built with Django, PostgreSQL, and Redis.

## Technology Stack
- **Web Framework**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Background Tasks**: Celery with Redis broker
- **File Storage**: Django Storages (AWS S3/Alibaba Cloud OSS)
- **Search**: Elasticsearch 8+
- **Message Queue**: Redis
- **API Documentation**: drf-spectacular (OpenAPI 3.0)

## 1. Database Schema Design

### Core User Models

```python
# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    USER_TYPES = [
        ('freelancer', _('Freelancer')),
        ('client', _('Client')),
        ('admin', _('Admin')),
    ]

    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='client')
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verification_document = models.FileField(upload_to='verification/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class FreelancerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
    bio = models.TextField(max_length=2000)
    skills = models.ManyToManyField('categories.Skill', related_name='freelancers')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    portfolio_url = models.URLField(null=True, blank=True)
    linkedin_url = models.URLField(null=True, blank=True)
    wechat_id = models.CharField(max_length=50, null=True, blank=True)
    location = models.CharField(max_length=200)
    languages = models.JSONField(default=list)  # [{"language": "中文", "level": "native"}]
    education = models.JSONField(default=list)
    experience_years = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    response_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    response_time = models.IntegerField(default=0)  # in hours

class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    company_name = models.CharField(max_length=200, null=True, blank=True)
    company_size = models.CharField(max_length=50, null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    location = models.CharField(max_length=200)
    budget_range = models.CharField(max_length=100, null=True, blank=True)
```

### Category and Skill Models

```python
# categories/models.py
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_zh = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    description_zh = models.TextField(blank=True)
    icon = models.ImageField(upload_to='category_icons/', null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['sort_order', 'name']

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_zh = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='skills')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Service/Gig Models

```python
# services/models.py
class Service(models.Model):
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('active', _('Active')),
        ('paused', _('Paused')),
        ('rejected', _('Rejected')),
    ]

    TYPE_CHOICES = [
        ('fixed', _('Fixed Price')),
        ('hourly', _('Hourly')),
        ('package', _('Package')),
    ]

    freelancer = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='services')
    title = models.CharField(max_length=200)
    title_zh = models.CharField(max_length=200)
    description = models.TextField()
    description_zh = models.TextField()
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE)
    skills = models.ManyToManyField('categories.Skill', related_name='services')
    service_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='fixed')
    basic_price = models.DecimalField(max_digits=10, decimal_places=2)
    basic_description = models.TextField()
    basic_delivery_days = models.IntegerField()
    standard_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    standard_description = models.TextField(blank=True)
    standard_delivery_days = models.IntegerField(null=True, blank=True)
    premium_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    premium_description = models.TextField(blank=True)
    premium_delivery_days = models.IntegerField(null=True, blank=True)
    images = models.JSONField(default=list)  # List of image URLs
    video_url = models.URLField(null=True, blank=True)
    requirements = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    views_count = models.IntegerField(default=0)
    orders_count = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ServicePackage(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='packages')
    name = models.CharField(max_length=50)  # Basic, Standard, Premium
    name_zh = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    delivery_days = models.IntegerField()
    revisions = models.IntegerField(default=1)
    features = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
```

### Order and Transaction Models

```python
# orders/models.py
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('in_progress', _('In Progress')),
        ('delivered', _('Delivered')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
        ('disputed', _('Disputed')),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('paid', _('Paid')),
        ('refunded', _('Refunded')),
        ('partially_refunded', _('Partially Refunded')),
    ]

    order_number = models.CharField(max_length=20, unique=True)
    client = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='client_orders')
    freelancer = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='freelancer_orders')
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE)
    service_package = models.ForeignKey('services.ServicePackage', on_delete=models.CASCADE)
    requirements = models.TextField(blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2)
    freelancer_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    delivery_deadline = models.DateTimeField()
    delivered_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OrderDelivery(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='deliveries')
    freelancer = models.ForeignKey('users.User', on_delete=models.CASCADE)
    files = models.JSONField(default=list)  # List of file URLs
    message = models.TextField()
    is_final = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderRevision(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='revisions')
    client = models.ForeignKey('users.User', on_delete=models.CASCADE)
    freelancer = models.ForeignKey('users.User', on_delete=models.CASCADE)
    request_message = models.TextField()
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('payment', _('Payment')),
        ('refund', _('Refund')),
        ('withdrawal', _('Withdrawal')),
        ('bonus', _('Bonus')),
    ]

    transaction_id = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='transactions')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    gateway_transaction_id = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
```

### Review and Rating Models

```python
# reviews/models.py
class Review(models.Model):
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='review')
    client = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='client_reviews')
    freelancer = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='freelancer_reviews')
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    comment_zh = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ReviewResponse(models.Model):
    review = models.OneToOneField(Review, on_delete=models.CASCADE, related_name='response')
    freelancer = models.ForeignKey('users.User', on_delete=models.CASCADE)
    response = models.TextField()
    response_zh = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Communication Models

```python
# messaging/models.py
class Conversation(models.Model):
    participants = models.ManyToManyField('users.User', related_name='conversations')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, null=True, blank=True, related_name='conversation')
    last_message = models.ForeignKey('Message', on_delete=models.SET_NULL, null=True, blank=True, related_name='last_in_conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', _('Text')),
        ('file', _('File')),
        ('image', _('Image')),
        ('system', _('System')),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='sent_messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    content = models.TextField()
    file_url = models.URLField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    title_zh = models.CharField(max_length=200)
    message = models.TextField()
    message_zh = models.TextField(blank=True)
    notification_type = models.CharField(max_length=50)  # order_message, review, etc.
    related_id = models.IntegerField(null=True, blank=True)  # Order ID, Review ID, etc.
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Additional Support Models

```python
# marketplace/models.py
class Wallet(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    frozen_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SavedService(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='saved_services')
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'service']

class Report(models.Model):
    REPORT_TYPES = [
        ('service', _('Service')),
        ('user', _('User')),
        ('review', _('Review')),
        ('message', _('Message')),
    ]

    reporter = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reports_received', null=True, blank=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    related_id = models.IntegerField()  # Service ID, User ID, etc.
    reason = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('resolved', 'Resolved'), ('dismissed', 'Dismissed')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_reports')
```

## 2. API Architecture

### RESTful API Structure

```
/api/v1/
├── auth/
│   ├── login/
│   ├── logout/
│   ├── register/
│   ├── refresh-token/
│   ├── verify-email/
│   └── password-reset/
├── users/
│   ├── profile/
│   ├── {user_id}/
│   ├── {user_id}/services/
│   └── {user_id}/reviews/
├── services/
│   ├── categories/
│   ├── skills/
│   ├── featured/
│   ├── search/
│   ├── {service_id}/
│   ├── {service_id}/reviews/
│   └── {service_id}/order/
├── orders/
│   ├── {order_id}/
│   ├── {order_id}/deliveries/
│   ├── {order_id}/revisions/
│   └── {order_id}/messages/
├── messaging/
│   ├── conversations/
│   ├── conversations/{conversation_id}/messages/
│   └── notifications/
├── payments/
│   ├── methods/
│   ├── transactions/
│   └── wallet/
└── admin/
    ├── users/
    ├── services/
    ├── orders/
    └── reports/
```

### Authentication and Authorization

```python
# authentication/views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, permissions
from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
```

### API Versioning Strategy

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router_v1 = DefaultRouter()
router_v1.register(r'services', ServiceViewSet, basename='service-v1')
router_v1.register(r'orders', OrderViewSet, basename='order-v1')

urlpatterns = [
    path('api/v1/', include(router_v1.urls)),
    path('api/v2/', include('api.v2.urls')),  # Future version
]

# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}
```

### Response Formats and Error Handling

```python
# utils/responses.py
from rest_framework import status
from rest_framework.response import Response

class APIResponse:
    @staticmethod
    def success(data=None, message="Success", status_code=status.HTTP_200_OK):
        return Response({
            "success": True,
            "message": message,
            "data": data,
            "timestamp": timezone.now().isoformat()
        }, status=status_code)

    @staticmethod
    def error(message="Error", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        return Response({
            "success": False,
            "message": message,
            "errors": errors,
            "timestamp": timezone.now().isoformat()
        }, status=status_code)

# exceptions.py
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, ValidationError):
        custom_response_data = {
            'success': False,
            'message': 'Validation failed',
            'errors': exc.detail,
            'timestamp': timezone.now().isoformat()
        }
        response.data = custom_response_data

    return response
```

### Sample API Views

```python
# services/views.py
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Service, Category
from .serializers import ServiceSerializer, CategorySerializer
from utils.permissions import IsOwnerOrReadOnly
from utils.responses import APIResponse

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.filter(status='active').select_related('freelancer', 'category').prefetch_related('skills')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'service_type', 'skills']
    search_fields = ['title', 'title_zh', 'description', 'description_zh']
    ordering_fields = ['created_at', 'rating', 'basic_price', 'views_count']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Service.objects.filter(pk=instance.pk).update(views_count=models.F('views_count') + 1)
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data)

    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        service = self.get_object()
        SavedService.objects.get_or_create(user=request.user, service=service)
        return APIResponse.success(message="Service saved successfully")

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True, parent=None).prefetch_related('children', 'skills')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
```

## 3. System Architecture

### Service Layer Design

```python
# services/service_layer.py
from django.db import transaction
from .models import Service, Order, Wallet
from .serializers import OrderSerializer

class OrderService:
    @staticmethod
    @transaction.atomic
    def create_order(client, service, package, requirements):
        # Create order
        order = Order.objects.create(
            order_number=OrderService.generate_order_number(),
            client=client,
            freelancer=service.freelancer,
            service=service,
            service_package=package,
            requirements=requirements,
            total_amount=package.price,
            platform_fee=package.price * Decimal('0.20'),  # 20% platform fee
            freelancer_earnings=package.price * Decimal('0.80'),
            delivery_deadline=timezone.now() + timedelta(days=package.delivery_days)
        )

        # Freeze client's wallet balance
        WalletService.freeze_balance(client, order.total_amount)

        # Send notifications
        NotificationService.send_order_created(order)

        return order

    @staticmethod
    def generate_order_number():
        import random
        import string
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"ORD{timestamp}{random_str}"

class WalletService:
    @staticmethod
    @transaction.atomic
    def freeze_balance(user, amount):
        wallet = Wallet.objects.select_for_update().get(user=user)
        if wallet.balance < amount:
            raise InsufficientBalanceError("Insufficient balance")
        wallet.balance -= amount
        wallet.frozen_balance += amount
        wallet.save()

    @staticmethod
    @transaction.atomic
    def release_frozen_balance(user, amount):
        wallet = Wallet.objects.select_for_update().get(user=user)
        wallet.frozen_balance -= amount
        wallet.balance += amount
        wallet.save()

class NotificationService:
    @staticmethod
    def send_order_created(order):
        # Send to freelancer
        Notification.objects.create(
            user=order.freelancer,
            title="New Order Received",
            title_zh="收到新订单",
            message=f"You have received a new order for {order.service.title}",
            message_zh=f"您收到了一个关于 {order.service.title_zh} 的新订单",
            notification_type="order_created",
            related_id=order.id
        )

        # Send real-time notification via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{order.freelancer.id}",
            {
                'type': 'notification',
                'data': {
                    'type': 'order_created',
                    'order_id': order.id,
                    'title': 'New Order Received'
                }
            }
        )
```

### Caching Strategy with Redis

```python
# cache/redis_cache.py
from django.core.cache import cache
from django.conf import settings
import redis
import json

class RedisCacheService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )

    def cache_service_list(self, category_id, services_data, timeout=3600):
        key = f"services:category:{category_id}"
        self.redis_client.setex(key, timeout, json.dumps(services_data))

    def get_cached_service_list(self, category_id):
        key = f"services:category:{category_id}"
        data = self.redis_client.get(key)
        return json.loads(data) if data else None

    def cache_user_profile(self, user_id, profile_data, timeout=1800):
        key = f"user:profile:{user_id}"
        self.redis_client.setex(key, timeout, json.dumps(profile_data))

    def invalidate_user_cache(self, user_id):
        keys = self.redis_client.keys(f"user:*:{user_id}")
        if keys:
            self.redis_client.delete(*keys)

    def cache_search_results(self, query, results, timeout=1800):
        key = f"search:{hash(query)}"
        self.redis_client.setex(key, timeout, json.dumps(results))

    def increment_view_count(self, service_id):
        key = f"service:views:{service_id}"
        self.redis_client.incr(key)
        self.redis_client.expire(key, 86400)  # 24 hours

        # Batch update to database every 10 views
        views = int(self.redis_client.get(key))
        if views % 10 == 0:
            from services.models import Service
            Service.objects.filter(id=service_id).update(views_count=models.F('views_count') + views)
            self.redis_client.set(key, 0)

# middleware.py
class CacheMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.cache_service = RedisCacheService()

    def __call__(self, request):
        response = self.get_response(request)

        # Cache service list views
        if request.path.startswith('/api/v1/services/') and request.method == 'GET':
            category_id = request.GET.get('category')
            if category_id:
                self.cache_service.cache_service_list(
                    category_id,
                    response.data.get('results', [])
                )

        return response
```

### Background Task Processing

```python
# celery_tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Order, Service

@shared_task
def send_order_confirmation_email(order_id):
    try:
        order = Order.objects.get(id=order_id)
        send_mail(
            'Order Confirmation',
            f'Your order {order.order_number} has been confirmed.',
            settings.DEFAULT_FROM_EMAIL,
            [order.client.email],
            fail_silently=False,
        )
        return f"Email sent for order {order_id}"
    except Order.DoesNotExist:
        return f"Order {order_id} not found"

@shared_task
def update_service_rankings():
    """Update service rankings based on performance metrics"""
    from django.db.models import F, Count, Avg

    # Update service scores
    Service.objects.annotate(
        review_score=Avg('reviews__rating') * 0.4,
        order_score=Count('orders') * 0.3,
        view_score=F('views_count') * 0.2,
        response_score=F('freelancer__freelancer_profile__response_rate') * 0.1
    ).update(
        ranking_score=F('review_score') + F('order_score') + F('view_score') + F('response_score')
    )

@shared_task
def cleanup_expired_sessions():
    """Clean up expired user sessions and cache"""
    from django.core.management import call_command
    call_command('clearsessions')
    return "Expired sessions cleaned up"

@shared_task
def generate_monthly_report(user_id):
    """Generate monthly activity report for users"""
    from django.db.models import Sum, Count
    from .models import Order, Transaction

    user = User.objects.get(id=user_id)

    if user.user_type == 'freelancer':
        orders = Order.objects.filter(
            freelancer=user,
            created_at__month=timezone.now().month,
            status='completed'
        )

        report_data = {
            'total_orders': orders.count(),
            'total_earnings': orders.aggregate(Sum('freelancer_earnings'))['freelancer_earnings__sum'] or 0,
            'average_rating': user.freelancer_profile.rating,
            'response_rate': user.freelancer_profile.response_rate
        }
    else:
        orders = Order.objects.filter(
            client=user,
            created_at__month=timezone.now().month,
            status='completed'
        )

        report_data = {
            'total_orders': orders.count(),
            'total_spent': orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
        }

    # Send report via email or store in database
    return report_data
```

### File Upload and Media Handling

```python
# storage/custom_storage.py
from django.core.files.storage import default_storage
from storages.backends.s3boto3 import S3Boto3Storage
import uuid
import os

class CustomS3Storage(S3Boto3Storage):
    def _save(self, name, content):
        # Generate unique filename
        ext = os.path.splitext(name)[1]
        unique_name = f"{uuid.uuid4()}{ext}"
        return super()._save(unique_name, content)

    def url(self, name):
        # Generate signed URL for private files
        if 'private/' in name:
            return self.generate_presigned_url(name)
        return super().url(name)

# utils/file_handler.py
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image
import io

class FileHandler:
    @staticmethod
    def process_avatar_image(uploaded_file):
        # Validate file type
        if not uploaded_file.content_type.startswith('image/'):
            raise ValidationError("File must be an image")

        # Resize and optimize image
        img = Image.open(uploaded_file)

        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        # Resize to max 500x500
        max_size = (500, 500)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)

        # Save to memory
        img_io = io.BytesIO()
        img.save(img_io, format='JPEG', quality=85, optimize=True)
        img_io.seek(0)

        # Create new InMemoryUploadedFile
        return InMemoryUploadedFile(
            img_io, 'image', f"{uuid.uuid4()}.jpg",
            'image/jpeg', img_io.tell(), None
        )

    @staticmethod
    def validate_service_file(uploaded_file):
        # Check file size (max 10MB)
        if uploaded_file.size > 10 * 1024 * 1024:
            raise ValidationError("File size must be less than 10MB")

        # Check file type
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]

        if uploaded_file.content_type not in allowed_types:
            raise ValidationError("File type not allowed")

        return True
```

### Search Functionality

```python
# search/services.py
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q
from django.conf import settings

class SearchService:
    def __init__(self):
        self.es_client = Elasticsearch([settings.ELASTICSEARCH_URL])

    def index_service(self, service):
        doc = {
            'id': service.id,
            'title': service.title,
            'title_zh': service.title_zh,
            'description': service.description,
            'description_zh': service.description_zh,
            'category': service.category.name,
            'category_zh': service.category.name_zh,
            'skills': [skill.name for skill in service.skills.all()],
            'skills_zh': [skill.name_zh for skill in service.skills.all()],
            'price': float(service.basic_price),
            'rating': float(service.rating),
            'freelancer_name': service.freelancer.get_full_name(),
            'location': service.freelancer.freelancer_profile.location,
            'created_at': service.created_at
        }

        self.es_client.index(
            index='services',
            id=service.id,
            body=doc
        )

    def search_services(self, query, filters=None, sort_by='relevance', page=1, size=20):
        search = Search(index='services')

        # Build query
        should_queries = []
        if query:
            should_queries.extend([
                Q('multi_match', query=query, fields=['title^3', 'title_zh^3', 'description', 'description_zh']),
                Q('match', skills=query),
                Q('match', skills_zh=query),
            ])

        # Apply filters
        if filters:
            if filters.get('category'):
                search = search.filter('term', category=filters['category'])
            if filters.get('min_price'):
                search = search.filter('range', price={'gte': filters['min_price']})
            if filters.get('max_price'):
                search = search.filter('range', price={'lte': filters['max_price']})
            if filters.get('min_rating'):
                search = search.filter('range', rating={'gte': filters['min_rating']})

        # Apply query
        if should_queries:
            search = search.query('bool', should=should_queries)

        # Apply sorting
        if sort_by == 'price_low':
            search = search.sort('price')
        elif sort_by == 'price_high':
            search = search.sort('-price')
        elif sort_by == 'rating':
            search = search.sort('-rating')
        elif sort_by == 'newest':
            search = search.sort('-created_at')
        else:  # relevance
            search = search.sort('-_score')

        # Apply pagination
        start = (page - 1) * size
        search = search[start:start + size]

        response = search.execute()

        return {
            'results': [hit.to_dict() for hit in response],
            'total': response.hits.total.value,
            'page': page,
            'size': size
        }

# signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Service

@receiver(post_save, sender=Service)
def service_saved(sender, instance, **kwargs):
    if instance.status == 'active':
        search_service = SearchService()
        search_service.index_service(instance)

@receiver(post_delete, sender=Service)
def service_deleted(sender, instance, **kwargs):
    search_service = SearchService()
    search_service.es_client.delete(index='services', id=instance.id)
```

## 4. Security Considerations

### User Authentication

```python
# authentication/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.response import Response
from rest_framework import status

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except InvalidToken:
            return None

    def get_validated_token(self, raw_token):
        # Additional token validation logic
        token = super().get_validated_token(raw_token)

        # Check if user is still active
        user_id = token['user_id']
        if not User.objects.filter(id=user_id, is_active=True).exists():
            raise InvalidToken("User account is inactive")

        return token

# permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.freelancer == request.user or obj.client == request.user

class IsFreelancerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.user_type == 'freelancer'
```

### Payment Security

```python
# payments/security.py
import hmac
import hashlib
from django.conf import settings
from .exceptions import PaymentVerificationError

class PaymentSecurity:
    @staticmethod
    def generate_signature(data, secret_key=None):
        secret_key = secret_key or settings.PAYMENT_SECRET_KEY
        sorted_data = sorted(data.items(), key=lambda x: x[0])
        string_to_sign = '&'.join([f"{k}={v}" for k, v in sorted_data])
        return hmac.new(
            secret_key.encode(),
            string_to_sign.encode(),
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    def verify_signature(data, signature, secret_key=None):
        expected_signature = PaymentSecurity.generate_signature(data, secret_key)
        return hmac.compare_digest(expected_signature, signature)

    @staticmethod
    def encrypt_sensitive_data(data):
        from cryptography.fernet import Fernet
        key = settings.ENCRYPTION_KEY.encode()
        f = Fernet(key)
        return f.encrypt(data.encode()).decode()

    @staticmethod
    def decrypt_sensitive_data(encrypted_data):
        from cryptography.fernet import Fernet
        key = settings.ENCRYPTION_KEY.encode()
        f = Fernet(key)
        return f.decrypt(encrypted_data.encode()).decode()

# payment_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from .security import PaymentSecurity
from .services import PaymentService

class PaymentCallbackView(APIView):
    permission_classes = []  # No authentication required

    def post(self, request):
        try:
            # Verify callback signature
            signature = request.headers.get('X-Payment-Signature')
            if not PaymentSecurity.verify_signature(request.data, signature):
                raise PaymentVerificationError("Invalid signature")

            # Process payment
            payment_service = PaymentService()
            result = payment_service.process_callback(request.data)

            return Response({"status": "success", "transaction_id": result.transaction_id})

        except PaymentVerificationError as e:
            return Response({"status": "error", "message": str(e)}, status=400)
```

### Data Validation

```python
# validators.py
from django.core.exceptions import ValidationError
import re

def validate_phone_number(value):
    # Chinese phone number validation
    pattern = r'^1[3-9]\d{9}$'
    if not re.match(pattern, value):
        raise ValidationError('Invalid Chinese phone number')

def validate_wechat_id(value):
    # WeChat ID validation
    if len(value) < 6 or len(value) > 20:
        raise ValidationError('WeChat ID must be between 6 and 20 characters')

    if re.match(r'^[a-zA-Z0-9_-]+$', value) is None:
        raise ValidationError('WeChat ID can only contain letters, numbers, underscores, and hyphens')

def validate_service_title(value):
    # Service title validation
    if len(value) < 10 or len(value) > 100:
        raise ValidationError('Service title must be between 10 and 100 characters')

    # Check for prohibited words
    prohibited_words = ['illegal', 'prohibited', '违禁', '违法']
    for word in prohibited_words:
        if word.lower() in value.lower():
            raise ValidationError(f'Service title cannot contain prohibited word: {word}')

# serializers.py
from rest_framework import serializers
from .validators import validate_phone_number, validate_service_title

class ServiceSerializer(serializers.ModelSerializer):
    def validate_title(self, value):
        validate_service_title(value)
        return value

    def validate_basic_price(self, value):
        if value < 5:  # Minimum price
            raise ValidationError('Minimum price is 5 CNY')
        if value > 50000:  # Maximum price
            raise ValidationError('Maximum price is 50,000 CNY')
        return value

    def validate(self, data):
        # Cross-field validation
        if data.get('standard_price') and data.get('standard_price') <= data.get('basic_price'):
            raise ValidationError('Standard price must be greater than basic price')

        if data.get('premium_price') and data.get('premium_price') <= data.get('standard_price', data.get('basic_price')):
            raise ValidationError('Premium price must be greater than standard price')

        return data
```

### Rate Limiting and Abuse Prevention

```python
# ratelimit/ratelimiting.py
from django.core.cache import cache
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import status
import time

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get client IP
        ip = self.get_client_ip(request)

        # Rate limit login attempts
        if request.path == '/api/v1/auth/login/' and request.method == 'POST':
            if self.is_rate_limited(f"login:{ip}", limit=5, window=300):  # 5 attempts per 5 minutes
                return Response(
                    {"error": "Too many login attempts. Please try again later."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        # Rate limit service creation
        if request.path == '/api/v1/services/' and request.method == 'POST':
            user_id = getattr(request.user, 'id', None)
            if user_id and self.is_rate_limited(f"create_service:{user_id}", limit=3, window=3600):  # 3 services per hour
                return Response(
                    {"error": "Service creation rate limit exceeded. Please wait before creating more services."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        # Rate limit messaging
        if '/messages/' in request.path and request.method == 'POST':
            user_id = getattr(request.user, 'id', None)
            if user_id and self.is_rate_limited(f"message:{user_id}", limit=30, window=60):  # 30 messages per minute
                return Response(
                    {"error": "Message sending rate limit exceeded. Please wait before sending more messages."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        return self.get_response(request)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def is_rate_limited(self, key, limit, window):
        current_time = int(time.time())
        window_start = current_time - window

        # Get existing attempts from cache
        attempts = cache.get(key, [])

        # Remove old attempts
        attempts = [attempt for attempt in attempts if attempt > window_start]

        # Check if limit exceeded
        if len(attempts) >= limit:
            return True

        # Add current attempt
        attempts.append(current_time)
        cache.set(key, attempts, window)

        return False

# utils/abuse_detection.py
class AbuseDetection:
    @staticmethod
    def detect_suspicious_activity(user):
        # Check for multiple account creation from same IP
        recent_accounts = User.objects.filter(
            created_at__gte=timezone.now() - timedelta(hours=24),
            last_login_ip=user.last_login_ip
        ).count()

        if recent_accounts > 5:
            # Flag for review
            AbuseReport.objects.create(
                user=user,
                reason="Multiple accounts from same IP",
                severity="medium"
            )
            return True

        return False

    @staticmethod
    def check_spam_content(content, user):
        # Check for spam patterns
        spam_keywords = ['免费', 'free', 'urgent', '立即', 'click here', '点击']
        spam_count = sum(1 for keyword in spam_keywords if keyword.lower() in content.lower())

        if spam_count > 3:
            # Flag as spam
            user.is_active = False
            user.save()
            return True

        return False
```

## 5. Scalability Planning

### Database Optimization

```sql
-- Database indexes for optimal performance
-- Users table
CREATE INDEX CONCURRENTLY idx_users_user_type ON users(user_type);
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY idx_users_is_active ON users(is_active);

-- Services table
CREATE INDEX CONCURRENTLY idx_services_freelancer_id ON services(freelancer_id);
CREATE INDEX CONCURRENTLY idx_services_category_id ON services(category_id);
CREATE INDEX CONCURRENTLY idx_services_status ON services(status);
CREATE INDEX CONCURRENTLY idx_services_created_at ON services(created_at);
CREATE INDEX CONCURRENTLY idx_services_rating ON services(rating);
CREATE INDEX CONCURRENTLY idx_services_price ON services(basic_price);
CREATE INDEX CONCURRENTLY idx_services_featured ON services(is_featured);

-- Composite indexes
CREATE INDEX CONCURRENTLY idx_services_category_status ON services(category_id, status);
CREATE INDEX CONCURRENTLY idx_services_freelancer_status ON services(freelancer_id, status);

-- Orders table
CREATE INDEX CONCURRENTLY idx_orders_client_id ON orders(client_id);
CREATE INDEX CONCURRENTLY idx_orders_freelancer_id ON orders(freelancer_id);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at);
CREATE INDEX CONCURRENTLY idx_orders_payment_status ON orders(payment_status);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_orders_client_status ON orders(client_id, status);
CREATE INDEX CONCURRENTLY idx_orders_freelancer_status ON orders(freelancer_id, status);

-- Messages table
CREATE INDEX CONCURRENTLY idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY idx_messages_sender_id ON messages(sender_id);
CREATE INDEX CONCURRENTLY idx_messages_created_at ON messages(created_at);
CREATE INDEX CONCURRENTLY idx_messages_is_read ON messages(is_read);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY idx_services_search_gin ON services USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX CONCURRENTLY idx_services_search_gin_zh ON services USING gin(to_tsvector('chinese', title_zh || ' ' || description_zh));

-- Partitioning for large tables
-- Partition orders table by date
CREATE TABLE orders_y2024 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE orders_y2025 PARTITION OF orders
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### Caching Layers Strategy

```python
# cache/cache_strategy.py
from django.core.cache import cache
from django.conf import settings
import redis
import json

class MultiLevelCache:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_CACHE_DB,
            decode_responses=True
        )
        self.memory_cache = {}

    def get(self, key):
        # L1: Memory cache
        if key in self.memory_cache:
            return self.memory_cache[key]

        # L2: Redis cache
        value = self.redis_client.get(key)
        if value:
            try:
                decoded_value = json.loads(value)
                # Store in memory cache
                self.memory_cache[key] = decoded_value
                return decoded_value
            except json.JSONDecodeError:
                return value

        return None

    def set(self, key, value, timeout=3600):
        # Store in memory cache
        self.memory_cache[key] = value

        # Store in Redis cache
        self.redis_client.setex(key, timeout, json.dumps(value))

    def delete(self, key):
        # Remove from all cache levels
        if key in self.memory_cache:
            del self.memory_cache[key]
        self.redis_client.delete(key)

    def clear_pattern(self, pattern):
        # Clear cache entries matching pattern
        keys = self.redis_client.keys(pattern)
        if keys:
            self.redis_client.delete(*keys)

        # Clear from memory cache
        keys_to_remove = [key for key in self.memory_cache.keys() if pattern.replace('*', '') in key]
        for key in keys_to_remove:
            del self.memory_cache[key]

# cache/views_cache.py
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from functools import wraps

def smart_cache(timeout=3600, key_func=None):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if key_func:
                cache_key = key_func(request, *args, **kwargs)
            else:
                cache_key = f"view:{request.path}:{request.GET.urlencode()}"

            cached_response = cache.get(cache_key)
            if cached_response:
                return cached_response

            response = view_func(request, *args, **kwargs)
            cache.set(cache_key, response, timeout)
            return response
        return wrapper
    return decorator

# Usage example
@smart_cache(timeout=1800, key_func=lambda r, **kw: f"services:category:{r.GET.get('category')}")
def services_list_view(request):
    # View logic
    pass
```

### Load Balancing Considerations

```yaml
# docker-compose.yml for production
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web1
      - web2
      - web3

  web1:
    build: .
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/freelance_db
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

  web2:
    build: .
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/freelance_db
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

  web3:
    build: .
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/freelance_db
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

  celery1:
    build: .
    command: celery -A freelance worker -l info
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/freelance_db
      - CELERY_BROKER_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

  celery2:
    build: .
    command: celery -A freelance worker -l info
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/freelance_db
      - CELERY_BROKER_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  redis_cluster_1:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf

  redis_cluster_2:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf

  redis_cluster_3:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf

  db_master:
    image: postgres:15
    environment:
      POSTGRES_DB: freelance_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_master_data:/var/lib/postgresql/data
      - ./master.conf:/etc/postgresql/postgresql.conf

  db_slave1:
    image: postgres:15
    environment:
      POSTGRES_DB: freelance_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_slave1_data:/var/lib/postgresql/data

  db_slave2:
    image: postgres:15
    environment:
      POSTGRES_DB: freelance_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_slave2_data:/var/lib/postgresql/data

  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - es_data:/usr/share/elasticsearch/data

volumes:
  redis_data:
  postgres_master_data:
  postgres_slave1_data:
  postgres_slave2_data:
  es_data:
```

### Performance Monitoring and Scaling

```python
# monitoring/performance.py
import time
import psutil
from django.db import connection
from django.core.cache import cache
from django.http import JsonResponse
from functools import wraps

class PerformanceMonitor:
    @staticmethod
    def monitor_database_performance():
        # Monitor slow queries
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT query, mean_exec_time, calls, total_exec_time
                FROM pg_stat_statements
                WHERE mean_exec_time > 100  # queries taking more than 100ms
                ORDER BY mean_exec_time DESC
                LIMIT 10
            """)
            slow_queries = cursor.fetchall()

        return slow_queries

    @staticmethod
    def monitor_cache_performance():
        # Monitor cache hit/miss ratio
        cache_stats = cache.get_stats() if hasattr(cache, 'get_stats') else {}
        return cache_stats

    @staticmethod
    def monitor_system_resources():
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'active_connections': len(psutil.net_connections()),
        }

def monitor_performance(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        start_time = time.time()

        # Execute view
        response = view_func(request, *args, **kwargs)

        # Calculate execution time
        execution_time = time.time() - start_time

        # Log performance metrics
        if execution_time > 2.0:  # Log slow requests
            logger.warning(f"Slow request: {request.path} took {execution_time:.2f}s")

        # Add performance headers
        response['X-Response-Time'] = f"{execution_time:.3f}"
        response['X-DB-Queries'] = str(len(connection.queries))

        return response
    return wrapper

# scaling/auto_scaling.py
class AutoScaler:
    def __init__(self):
        self.min_workers = 2
        self.max_workers = 10
        self.scale_up_threshold = 70  # CPU usage percentage
        self.scale_down_threshold = 30

    def check_scaling_conditions(self):
        current_load = psutil.cpu_percent(interval=5)
        active_workers = self.get_active_celery_workers()

        if current_load > self.scale_up_threshold and active_workers < self.max_workers:
            self.scale_up()
        elif current_load < self.scale_down_threshold and active_workers > self.min_workers:
            self.scale_down()

    def scale_up(self):
        # Logic to spin up new workers (container orchestration)
        logger.info("Scaling up: adding new worker")
        # Implementation depends on container platform (Kubernetes, Docker Swarm, etc.)

    def scale_down(self):
        # Logic to remove workers
        logger.info("Scaling down: removing worker")
        # Implementation depends on container platform
```

This comprehensive backend architecture provides a solid foundation for a Chinese freelance marketplace platform. The design focuses on scalability, security, and performance while maintaining clean code organization and proper separation of concerns.

The system includes:
- **Robust database schema** with proper relationships and indexes
- **RESTful API** with proper authentication and versioning
- **Multi-layer caching** strategy using Redis
- **Background task processing** with Celery
- **Comprehensive security** measures
- **Scalability planning** with database optimization and load balancing considerations

The architecture supports Chinese language requirements, real-time features, and can handle high traffic volumes typical of marketplace platforms.