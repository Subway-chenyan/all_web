# API Endpoints and Redis Integration Strategy

## RESTful API Endpoints Specification

### 1. Users API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register/                 # User registration
POST   /api/auth/login/                    # User login
POST   /api/auth/logout/                   # User logout
POST   /api/auth/refresh/                  # Token refresh
POST   /api/auth/password/reset/           # Password reset request
POST   /api/auth/password/reset/confirm/   # Password reset confirmation
POST   /api/auth/email/verify/             # Email verification
POST   /api/auth/social/{provider}/        # Social login (WeChat, QQ, etc.)
```

#### User Profile Endpoints
```
GET    /api/users/profile/                 # Get current user profile
PUT    /api/users/profile/                 # Update user profile
POST   /api/users/profile/image/           # Upload profile image
GET    /api/users/{id}/                    # Get public user profile
POST   /api/users/verify/                  # Submit verification documents
GET    /api/users/verification/status/     # Get verification status
```

#### Skills & Portfolio Endpoints
```
GET    /api/users/skills/                  # Get user skills
POST   /api/users/skills/                  # Add user skill
DELETE /api/users/skills/{id}/             # Remove user skill
GET    /api/users/portfolio/               # Get user portfolio
POST   /api/users/portfolio/               # Add portfolio item
PUT    /api/users/portfolio/{id}/          # Update portfolio item
DELETE /api/users/portfolio/{id}/          # Delete portfolio item
POST   /api/users/portfolio/{id}/feature/  # Feature portfolio item
```

### 2. Gigs API Endpoints

#### Gig Management Endpoints
```
GET    /api/gigs/                          # List gigs (with filtering)
POST   /api/gigs/                          # Create new gig
GET    /api/gigs/{id}/                     # Get gig details
PUT    /api/gigs/{id}/                     # Update gig
DELETE /api/gigs/{id}/                     # Delete gig
POST   /api/gigs/{id}/duplicate/           # Duplicate gig
POST   /api/gigs/{id}/publish/             # Publish gig
POST   /api/gigs/{id}/pause/               # Pause gig
POST   /api/gigs/{id}/archive/             # Archive gig
```

#### Gig Packages Endpoints
```
GET    /api/gigs/{id}/packages/            # Get gig packages
POST   /api/gigs/{id}/packages/            # Create package
PUT    /api/gigs/packages/{id}/            # Update package
DELETE /api/gigs/packages/{id}/            # Delete package
POST   /api/gigs/packages/{id}/set-main/   # Set as main package
```

#### Gig Media Endpoints
```
GET    /api/gigs/{id}/media/               # Get gig media
POST   /api/gigs/{id}/media/               # Upload media
PUT    /api/gigs/media/{id}/               # Update media info
DELETE /api/gigs/media/{id}/               # Delete media
POST   /api/gigs/media/reorder/            # Reorder media
```

#### Categories & Tags Endpoints
```
GET    /api/categories/                    # List categories (hierarchical)
GET    /api/categories/{id}/               # Get category details
GET    /api/categories/{id}/gigs/          # Get gigs in category
GET    /api/tags/                          # List popular tags
GET    /api/tags/{slug}/gigs/              # Get gigs with tag
```

### 3. Orders API Endpoints

#### Order Management Endpoints
```
GET    /api/orders/                        # List user orders (buyer/seller)
POST   /api/orders/                        # Create order
GET    /api/orders/{id}/                   # Get order details
PUT    /api/orders/{id}/                   # Update order (limited fields)
POST   /api/orders/{id}/accept/            # Accept order (seller)
POST   /api/orders/{id}/start/             # Start order
POST   /api/orders/{id}/cancel/            # Cancel order
POST   /api/orders/{id}/complete/          # Complete order
```

#### Delivery Endpoints
```
GET    /api/orders/{id}/deliveries/        # Get order deliveries
POST   /api/orders/{id}/deliveries/        # Submit delivery
GET    /api/deliveries/{id}/               # Get delivery details
PUT    /api/deliveries/{id}/               # Update delivery
POST   /api/deliveries/{id}/accept/        # Accept delivery (buyer)
POST   /api/deliveries/{id}/reject/        # Reject delivery
POST   /api/deliveries/{id}/request-revision/ # Request revision
```

#### Milestone Endpoints
```
GET    /api/orders/{id}/milestones/        # Get order milestones
POST   /api/orders/{id}/milestones/        # Create milestone
PUT    /api/milestones/{id}/               # Update milestone
POST   /api/milestones/{id}/complete/      # Complete milestone
```

#### Dispute Endpoints
```
GET    /api/orders/{id}/dispute/           # Get dispute details
POST   /api/orders/{id}/dispute/           # Create dispute
PUT    /api/disputes/{id}/                 # Update dispute
POST   /api/disputes/{id}/resolve/         # Resolve dispute (admin)
```

### 4. Payments API Endpoints

#### Wallet Endpoints
```
GET    /api/wallet/                        # Get wallet balance
GET    /api/wallet/transactions/           # Get transaction history
POST   /api/wallet/deposit/                # Deposit to wallet
POST   /api/wallet/withdraw/               # Withdraw from wallet
GET    /api/wallet/statements/             # Download statements
```

#### Payment Endpoints
```
POST   /api/payments/create/               # Create payment
POST   /api/payments/confirm/              # Confirm payment
GET    /api/payments/{id}/                 # Get payment details
POST   /api/payments/{id}/cancel/          # Cancel payment
POST   /api/payments/webhook/alipay/       # Alipay webhook
POST   /api/payments/webhook/wechat/       # WeChat Pay webhook
```

#### Payout Endpoints
```
GET    /api/payouts/                       # Get payout history
POST   /api/payouts/request/               # Request payout
GET    /api/payouts/{id}/                  # Get payout details
POST   /api/payouts/{id}/cancel/           # Cancel payout request
```

### 5. Messaging API Endpoints

#### Conversation Endpoints
```
GET    /api/conversations/                 # List conversations
POST   /api/conversations/                 # Start new conversation
GET    /api/conversations/{id}/            # Get conversation details
POST   /api/conversations/{id}/archive/    # Archive conversation
POST   /api/conversations/{id}/mute/       # Mute conversation
```

#### Message Endpoints
```
GET    /api/conversations/{id}/messages/   # Get conversation messages
POST   /api/conversations/{id}/messages/   # Send message
PUT    /api/messages/{id}/                 # Update message
DELETE /api/messages/{id}/                 # Delete message
POST   /api/messages/upload/               # Upload file attachment
GET    /api/messages/{id}/download/        # Download attachment
```

### 6. Reviews API Endpoints

```
GET    /api/reviews/gig/{gig_id}/          # Get gig reviews
GET    /api/reviews/user/{user_id}/        # Get user reviews
POST   /api/reviews/                       # Create review
GET    /api/reviews/{id}/                  # Get review details
PUT    /api/reviews/{id}/                  # Update review (author)
DELETE /api/reviews/{id}/                  # Delete review (admin)
GET    /api/users/{id}/reputation/         # Get user reputation
```

### 7. Search API Endpoints

```
GET    /api/search/gigs/                   # Search gigs
GET    /api/search/users/                  # Search users
GET    /api/search/suggestions/            # Get search suggestions
GET    /api/search/history/                # Get search history
POST   /api/search/history/                # Save search history
DELETE /api/search/history/                # Clear search history
```

### 8. Notifications API Endpoints

```
GET    /api/notifications/                 # Get notifications
PUT    /api/notifications/{id}/read/       # Mark notification as read
PUT    /api/notifications/read-all/        # Mark all as read
POST   /api/notifications/settings/        # Update notification settings
GET    /api/notifications/settings/        # Get notification settings
```

### 9. Admin API Endpoints

```
GET    /api/admin/dashboard/               # Admin dashboard stats
GET    /api/admin/users/                   # User management
PUT    /api/admin/users/{id}/              # Update user (admin)
POST   /api/admin/users/{id}/ban/          # Ban user
POST   /api/admin/users/{id}/verify/       # Verify user
GET    /api/admin/gigs/                    # Gig moderation
PUT    /api/admin/gigs/{id}/               # Update gig (admin)
POST   /api/admin/gigs/{id}/feature/       # Feature gig
GET    /api/admin/orders/                  # Order management
GET    /api/admin/disputes/                # Dispute management
PUT    /api/admin/disputes/{id}/           # Resolve dispute
GET    /api/admin/analytics/               # Platform analytics
```

---

## Redis Integration Strategy

### 1. Cache Implementation

#### Session Management
```python
# Redis keys for user sessions
SESSION_KEY_PATTERN = "session:user:{user_id}"
SESSION_EXPIRY = 86400  # 24 hours

# Store user session data
cache.set(
    f"session:user:{user_id}",
    {
        'user_id': user_id,
        'email': user.email,
        'user_type': user.user_type,
        'last_activity': timezone.now().isoformat(),
        'permissions': user_permissions
    },
    timeout=SESSION_EXPIRY
)
```

#### Gig Search Results Caching
```python
# Cache search results for 15 minutes
SEARCH_CACHE_KEY = "search:{query_hash}:{filters_hash}"
SEARCH_CACHE_EXPIRY = 900  # 15 minutes

def cache_search_results(query, filters, results):
    query_hash = hashlib.md5(query.encode()).hexdigest()
    filters_hash = hashlib.md5(json.dumps(filters, sort_keys=True).encode()).hexdigest()
    cache_key = f"search:{query_hash}:{filters_hash}"

    cache.set(cache_key, results, timeout=SEARCH_CACHE_EXPIRY)
    return cache_key
```

#### Popular Gigs Caching
```python
# Cache trending gigs by category
TRENDING_GIGS_KEY = "trending:gigs:{category_id}"
TRENDING_GIGS_EXPIRY = 3600  # 1 hour

def get_trending_gigs(category_id=None):
    cache_key = f"trending:gigs:{category_id or 'all'}"
    trending_gigs = cache.get(cache_key)

    if not trending_gigs:
        trending_gigs = calculate_trending_gigs(category_id)
        cache.set(cache_key, trending_gigs, timeout=TRENDING_GIGS_EXPIRY)

    return trending_gigs
```

### 2. Real-time Features with Redis

#### Online Users Tracking
```python
# Track online users
ONLINE_USERS_KEY = "online_users"
ONLINE_USER_EXPIRY = 300  # 5 minutes

def mark_user_online(user_id):
    cache.set(
        f"online_user:{user_id}",
        timezone.now().isoformat(),
        timeout=ONLINE_USER_EXPIRY
    )
    cache.sadd(ONLINE_USERS_KEY, user_id)

def get_online_users():
    online_users = cache.smembers(ONLINE_USERS_KEY)
    return User.objects.filter(id__in=online_users)
```

#### Real-time Notifications
```python
# Real-time notification queue
NOTIFICATION_QUEUE = "notifications:user:{user_id}"

def send_realtime_notification(user_id, notification_data):
    notification = {
        'id': str(uuid.uuid4()),
        'type': notification_data['type'],
        'title': notification_data['title'],
        'message': notification_data['message'],
        'timestamp': timezone.now().isoformat(),
        'read': False
    }

    # Add to user's notification queue
    cache.lpush(f"notifications:user:{user_id}", json.dumps(notification))

    # Keep only last 50 notifications
    cache.ltrim(f"notifications:user:{user_id}", 0, 49)

    # Trigger WebSocket notification
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            'type': 'notification',
            'notification': notification
        }
    )
```

#### Message Read Receipts
```python
# Track message read status
READ_RECEIPTS_KEY = "read_receipts:{conversation_id}"

def mark_messages_read(user_id, conversation_id, message_ids):
    for message_id in message_ids:
        cache.sadd(f"read_receipts:{conversation_id}:{message_id}", user_id)

    # Clean up old read receipts after 30 days
    cache.expire(f"read_receipts:{conversation_id}:{message_ids[0]}", 2592000)
```

### 3. Rate Limiting

#### API Rate Limiting
```python
# Rate limiting configuration
RATE_LIMITS = {
    'auth': {
        'login': '5/hour',
        'register': '3/hour',
        'password_reset': '5/hour'
    },
    'gigs': {
        'create': '10/hour',
        'update': '100/hour'
    },
    'messages': {
        'send': '60/minute',
        'upload': '10/minute'
    }
}

def check_rate_limit(user_id, action):
    limit = RATE_LIMITS.get(action)
    if not limit:
        return True

    count, period = limit.split('/')
    period_seconds = {
        'minute': 60,
        'hour': 3600,
        'day': 86400
    }[period]

    key = f"rate_limit:{user_id}:{action}"
    current_count = cache.get(key, 0)

    if current_count >= int(count):
        return False

    cache.incr(key)
    cache.expire(key, period_seconds)
    return True
```

### 4. Background Tasks with Celery + Redis

#### Email Sending Tasks
```python
# Celery tasks for email notifications
from celery import Celery
from django.core.mail import send_mail
from django.template.loader import render_to_string

@app.task
def send_verification_email(user_id):
    user = User.objects.get(id=user_id)
    subject = '验证您的邮箱地址'
    message = render_to_string('emails/verification.html', {
        'user': user,
        'verification_url': generate_verification_url(user)
    })
    send_mail(subject, '', settings.DEFAULT_FROM_EMAIL, [user.email], html_message=message)

@app.task
def send_order_notification(order_id, notification_type):
    order = Order.objects.select_related('buyer', 'seller', 'gig').get(id=order_id)

    if notification_type == 'order_created':
        # Notify seller
        send_mail(
            '新订单通知',
            render_to_string('emails/new_order.html', {'order': order}),
            settings.DEFAULT_FROM_EMAIL,
            [order.seller.email]
        )
    elif notification_type == 'order_completed':
        # Notify buyer and seller
        for user in [order.buyer, order.seller]:
            send_mail(
                '订单完成通知',
                render_to_string('emails/order_completed.html', {'order': order, 'user': user}),
                settings.DEFAULT_FROM_EMAIL,
                [user.email]
            )
```

#### Image Processing Tasks
```python
@app.task
def process_profile_image(user_id, image_path):
    """Process and optimize profile images"""
    from PIL import Image
    import os

    # Create different sizes
    sizes = [
        (100, 100),   # thumbnail
        (300, 300),   # medium
        (500, 500),   # large
    ]

    image = Image.open(image_path)

    for size in sizes:
        resized_image = image.copy()
        resized_image.thumbnail(size, Image.Resampling.LANCZOS)

        # Save resized image
        resized_path = f"{image_path.split('.')[0]}_{size[0]}x{size[1]}.{image_path.split('.')[-1]}"
        resized_image.save(resized_path, optimize=True, quality=85)

    # Update user profile with processed images
    user = User.objects.get(id=user_id)
    user.profile.image_processed = True
    user.profile.save(update_fields=['image_processed'])

@app.task
def process_gig_media(gig_id, media_id):
    """Process gig media files (images, videos)"""
    gig_media = GigMedia.objects.get(id=media_id)

    if gig_media.media_type == 'image':
        # Create thumbnails and optimize images
        process_profile_image.delay(gig_id, gig_media.file.path)
    elif gig_media.media_type == 'video':
        # Generate video thumbnails
        generate_video_thumbnail.delay(gig_id, gig_media.file.path)
```

#### Analytics Processing Tasks
```python
@app.task
def update_gig_statistics():
    """Update gig statistics periodically"""
    from django.db.models import Avg, Count

    gigs = Gig.objects.all()

    for gig in gigs:
        # Update average rating and review count
        reviews = Review.objects.filter(order__gig=gig)
        gig.review_count = reviews.count()

        if gig.review_count > 0:
            gig.average_rating = reviews.aggregate(
                avg_rating=Avg('rating')
            )['avg_rating']

        # Update click statistics
        gig.click_count = cache.get(f"gig_clicks:{gig.id}", 0)

        gig.save(update_fields=[
            'review_count', 'average_rating', 'click_count'
        ])

@app.task
def cleanup_expired_data():
    """Clean up expired data"""
    from django.utils import timezone
    import datetime

    # Delete expired sessions
    expired_sessions = Session.objects.filter(
        expire_date__lt=timezone.now()
    )
    expired_sessions.delete()

    # Archive old orders
    cutoff_date = timezone.now() - datetime.timedelta(days=365)
    old_orders = Order.objects.filter(
        created_at__lt=cutoff_date,
        status__in=['completed', 'cancelled']
    )
    for order in old_orders:
        order.status = 'archived'
        order.save(update_fields=['status'])
```

### 5. Search Optimization

#### Gig Search Index
```python
def build_search_index():
    """Build and maintain search index in Redis"""
    from redisearch import Client, TextField, NumericField

    # Create Redis Search client
    client = Client('gigs_search')

    # Drop existing index
    try:
        client.drop_index()
    except:
        pass

    # Create index definition
    client.create_index([
        TextField('title', weight=2.0),
        TextField('description', weight=1.0),
        TextField('category_name'),
        TextField('tags'),
        NumericField('price'),
        NumericField('average_rating'),
        NumericField('total_orders'),
        NumericField('delivery_days')
    ])

    # Index all active gigs
    gigs = Gig.objects.filter(status='active').select_related(
        'category', 'user'
    ).prefetch_related('tag_relations__tag', 'packages')

    for gig in gigs:
        doc = {
            'gig_id': str(gig.id),
            'title': gig.title,
            'description': gig.description,
            'category_name': gig.category.name,
            'tags': ' '.join([tag_rel.tag.name for tag_rel in gig.tag_relations.all()]),
            'price': float(gig.starting_price),
            'average_rating': float(gig.average_rating),
            'total_orders': gig.total_orders,
            'delivery_days': gig.main_package.delivery_days if gig.main_package else 0
        }
        client.add_document(f'gig_{gig.id}', **doc)
```

### 6. Performance Monitoring

#### Application Metrics
```python
def track_api_performance(endpoint, response_time, status_code):
    """Track API performance metrics"""
    timestamp = int(time.time())

    # Store response times
    cache.lpush(f"api_metrics:{endpoint}:{timestamp//60}", response_time)
    cache.ltrim(f"api_metrics:{endpoint}:{timestamp//60}", 0, 999)  # Keep last 1000

    # Store status codes
    cache.incr(f"api_status:{endpoint}:{status_code}")
    cache.expire(f"api_status:{endpoint}:{status_code}", 86400)  # 24 hours

def get_performance_metrics(endpoint, minutes=60):
    """Get performance metrics for an endpoint"""
    current_time = int(time.time())
    metrics = []

    for i in range(minutes):
        timestamp = current_time - (i * 60)
        response_times = cache.lrange(f"api_metrics:{endpoint}:{timestamp//60}", 0, -1)

        if response_times:
            response_times = [float(rt) for rt in response_times]
            metrics.append({
                'timestamp': timestamp,
                'avg_response_time': sum(response_times) / len(response_times),
                'max_response_time': max(response_times),
                'min_response_time': min(response_times),
                'request_count': len(response_times)
            })

    return sorted(metrics, key=lambda x: x['timestamp'])
```

This comprehensive API and Redis integration strategy provides:

1. **Complete RESTful API** covering all platform features
2. **Intelligent Caching** for performance optimization
3. **Real-time Features** using Redis pub/sub
4. **Background Task Processing** with Celery
5. **Rate Limiting** for API protection
6. **Search Optimization** with Redis Search
7. **Performance Monitoring** and analytics
8. **Scalable Architecture** for handling high traffic

The implementation follows Django best practices and provides a solid foundation for building a robust freelance marketplace platform.