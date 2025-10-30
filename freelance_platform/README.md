# Chinese Freelance Platform

A Django-based Chinese version of Fiverr platform for freelance services.

## Features

- User authentication with JWT
- Multi-role users (Clients, Freelancers, Admins)
- Service/Gig management
- Order processing system
- Payment integration (Alipay, WeChat Pay)
- Real-time messaging
- Review and rating system
- Advanced search and filtering

## Tech Stack

- **Backend**: Django 5.2.7 + Django REST Framework
- **Database**: PostgreSQL
- **Cache**: Redis
- **Task Queue**: Celery
- **Authentication**: JWT (Simple JWT)

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Redis 6+

### Installation

1. **Setup environment**
```bash
# Install dependencies with uv
uv sync

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env file with your database and other settings
```

3. **Database setup**
```bash
# Create database
createdb freelance_platform

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

4. **Start services**
```bash
# Start Django server
python manage.py runserver

# Start Celery Worker (new terminal)
celery -A config worker -l info

# Start Celery Beat (new terminal)
celery -A config beat -l info
```

## Project Structure

```
freelance_platform/
├── config/                 # Project configuration
├── apps/                  # Application modules
│   ├── accounts/          # User accounts
│   ├── gigs/             # Service management
│   ├── orders/           # Order management
│   ├── payments/         # Payment system
│   ├── messaging/        # Messaging system
│   ├── reviews/          # Review system
│   └── common/           # Common modules
├── static/               # Static files
├── .env                  # Environment variables
└── manage.py            # Django manage script
```

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Get JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Users
- `GET /api/accounts/profile/` - Get user profile
- `PUT /api/accounts/profile/` - Update user profile

### Gigs
- `GET /api/gigs/` - List gigs
- `POST /api/gigs/` - Create gig
- `GET /api/gigs/{id}/` - Get gig details

### Orders
- `GET /api/orders/` - List orders
- `POST /api/orders/` - Create order

## Development

### Database migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Testing
```bash
python manage.py test
```

## License

MIT License