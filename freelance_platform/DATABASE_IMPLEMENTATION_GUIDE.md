# Database Implementation Guide
## Chinese Freelance Marketplace Platform

This guide provides comprehensive documentation for implementing and optimizing the PostgreSQL database for the Chinese freelance marketplace platform.

## Table of Contents
1. [Database Schema Overview](#database-schema-overview)
2. [Implementation Steps](#implementation-steps)
3. [Optimization Strategies](#optimization-strategies)
4. [Performance Monitoring](#performance-monitoring)
5. [Scaling Considerations](#scaling-considerations)
6. [Backup and Recovery](#backup-and-recovery)
7. [Security Considerations](#security-considerations)

## Database Schema Overview

### Core Applications and Tables

#### Accounts App (`apps/accounts/`)
- **User** - Extended user model with Chinese market support
- **UserProfile** - Detailed user profile information
- **Skill** - Freelancer skills catalog
- **UserSkill** - Many-to-many relationship between users and skills
- **Education** - User educational background
- **WorkExperience** - Professional experience
- **Portfolio** - Portfolio items and work samples
- **UserVerification** - Identity verification documents
- **UserActivityLog** - User activity tracking

#### Gigs App (`apps/gigs/`)
- **Category** - Service categories and subcategories
- **Gig** - Main service/gig listings
- **GigPackage** - Gig pricing packages (Basic, Standard, Premium)
- **GigRequirement** - Client requirements for gigs
- **GigFAQ** - Frequently asked questions
- **GigExtra** - Additional services/extras
- **GigFavorite** - User favorites
- **GigView** - View tracking for analytics
- **GigStat** - Daily statistics
- **GigSearchHistory** - Search analytics
- **GigReport** - Content moderation

#### Orders App (`apps/orders/`)
- **Order** - Main order management
- **OrderStatusHistory** - Order status tracking
- **OrderExtra** - Additional services in orders
- **OrderRequirement** - Client order requirements
- **Delivery** - File deliveries
- **OrderMessage** - Order-related communications
- **OrderReview** - Review requests
- **OrderDispute** - Dispute resolution
- **OrderStat** - Daily order statistics
- **OrderCancellation** - Cancellation details

#### Payments App (`apps/payments/`)
- **Wallet** - User digital wallets
- **PaymentMethod** - Payment methods (Alipay, WeChat, etc.)
- **Transaction** - Financial transactions
- **Escrow** - Escrow account management
- **Withdrawal** - Withdrawal requests
- **PaymentRefund** - Refund processing
- **PaymentStat** - Daily payment statistics
- **PayoutBatch** - Batch payout processing

#### Messaging App (`apps/messaging/`)
- **Conversation** - User conversations
- **Message** - Individual messages
- **MessageAttachment** - File attachments
- **MessageTemplate** - Predefined templates
- **MessageReaction** - Emoji reactions
- **BlockedUser** - User blocking
- **MessageReport** - Content moderation
- **MessagingStat** - Daily messaging statistics

#### Reviews App (`apps/reviews/`)
- **Review** - User reviews and ratings
- **ReviewHelpful** - Helpful votes
- **ReviewReport** - Review moderation
- **UserRating** - Aggregated user ratings
- **ReviewInvitation** - Review invitations
- **ReviewTemplate** - Review templates
- **ReviewStat** - Daily review statistics

## Implementation Steps

### 1. Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres createdb freelance_platform

# Create user with appropriate permissions
sudo -u postgres createuser freelance_user
sudo -u postgres psql -c "ALTER USER freelance_user PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE freelance_platform TO freelance_user;"
```

### 2. Environment Configuration

Update `.env` file:
```env
DB_NAME=freelance_platform
DB_USER=freelance_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
```

### 3. Run Initial Migrations

```bash
# Create and apply migrations
python manage.py makemigrations accounts gigs orders payments messaging reviews common
python manage.py migrate

# Apply database optimizations
psql -d freelance_platform -f migrations/initial_optimization.sql
```

### 4. Create Superuser and Initial Data

```bash
# Create superuser
python manage.py createsuperuser

# Load initial data (create data fixtures for categories, skills, etc.)
python manage.py loaddata fixtures/initial_data.json
```

## Optimization Strategies

### 1. Index Optimization

The database includes comprehensive indexing strategy:

#### Primary Indexes
- All primary keys use UUID for better performance
- Foreign keys are properly indexed for fast joins

#### Composite Indexes
- User status and type combinations
- Gig category and status filtering
- Order status and date combinations
- Messaging conversation and message lookups

#### Partial Indexes
- Active users only
- Recent messages only
- High-rated gigs only
- Unread messages only

#### Full-Text Search
- Gig titles and descriptions
- User profiles and bios
- Review content

### 2. Query Optimization

#### N+1 Query Prevention
```python
# Optimized queryset examples
gigs = Gig.objects.select_related(
    'freelancer', 'category'
).prefetch_related(
    'packages', 'requirements', 'faqs'
)

orders = Order.objects.select_related(
    'client', 'freelancer', 'gig'
).prefetch_related(
    'order_extras', 'requirements'
)
```

#### Efficient Pagination
```python
# Use cursor-based pagination for large datasets
def get_gigs_pagination(last_id=None):
    queryset = Gig.objects.filter(status='active')
    if last_id:
        queryset = queryset.filter(id__gt=last_id)
    return queryset.order_by('id')[:20]
```

### 3. Caching Strategy

#### Redis Caching
- User profiles: 1 hour TTL
- Gig details: 30 minutes TTL
- Search results: 5 minutes TTL
- Statistics: 10 minutes TTL

#### Database-level Caching
- Materialized views for statistics
- Query result caching
- Session caching

### 4. Connection Pooling

```python
# In settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'MAX_CONNS': 100,
            'MIN_CONNS': 5,
        },
        'CONN_MAX_AGE': 60,
    }
}
```

## Performance Monitoring

### 1. Built-in Monitoring Tools

The platform includes comprehensive monitoring:

```python
# Run performance audit
from config.monitoring import run_performance_audit
report = run_performance_audit()

# Get slow queries
from config.monitoring import DatabaseMonitor
slow_queries = DatabaseMonitor.get_slow_queries()

# Check database health
from config.monitoring import HealthChecker
health = HealthChecker.check_database_health()
```

### 2. Key Performance Indicators

- **Query Response Time**: < 100ms for simple queries, < 500ms for complex queries
- **Cache Hit Ratio**: > 95%
- **Connection Pool Usage**: < 80%
- **Disk I/O**: < 70% utilization
- **Index Usage**: Monitor unused indexes

### 3. Monitoring Queries

```sql
-- Slow queries
SELECT query, mean_time, calls FROM pg_stat_statements WHERE mean_time > 100 ORDER BY mean_time DESC;

-- Index usage
SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_stat_user_tables ORDER BY pg_total_relation_size DESC;
```

## Scaling Considerations

### 1. Vertical Scaling

#### Hardware Recommendations
- **CPU**: 8+ cores for production
- **RAM**: 32GB+ (25% for PostgreSQL, 75% for OS cache)
- **Storage**: SSD with high IOPS
- **Network**: 1Gbps+ for database connections

#### PostgreSQL Configuration
```ini
# postgresql.conf
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 2GB
checkpoint_completion_target = 0.9
wal_buffers = 64MB
default_statistics_target = 100
random_page_cost = 1.1  # For SSD
```

### 2. Horizontal Scaling

#### Read Replicas
```python
# Database configuration for read replicas
DATABASES = {
    'default': {  # Master
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'freelance_platform',
        # ... master config
    },
    'replica': {  # Read replica
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'freelance_platform_replica',
        # ... replica config
    }
}

# Use database router for read queries
class ReplicationRouter:
    def db_for_read(self, model, **hints):
        return 'replica'

    def db_for_write(self, model, **hints):
        return 'default'
```

#### Database Sharding
- Consider sharding by user_id for large user bases
- Partition time-series data (logs, statistics) by date
- Use foreign data wrapper for cross-shard queries

### 3. Connection Management

#### Connection Pooling with PgBouncer
```ini
# pgbouncer.ini
[databases]
freelance_platform = host=localhost port=5432 dbname=freelance_platform

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
logfile = /var/log/pgbouncer/pgbouncer.log
admin_users = postgres
stats_users = stats, postgres
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 5
max_db_connections = 50
max_user_connections = 50
server_reset_query = DISCARD ALL
ignore_startup_parameters = extra_float_digits
```

## Backup and Recovery

### 1. Backup Strategy

#### Automated Backups
```bash
#!/bin/bash
# backup_database.sh

# Set variables
DB_NAME="freelance_platform"
DB_USER="freelance_user"
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Full backup
pg_dump -U $DB_USER -h localhost -d $DB_NAME -F c -b -v -f "$BACKUP_DIR/full_backup_$DATE.dump"

# Compress old backups (7 days)
find $BACKUP_DIR -name "full_backup_*.dump" -mtime +7 -exec gzip {} \;

# Delete backups older than 30 days
find $BACKUP_DIR -name "full_backup_*.dump.gz" -mtime +30 -delete

# Backup schema only
pg_dump -U $DB_USER -h localhost -d $DB_NAME -s -f "$BACKUP_DIR/schema_$DATE.sql"
```

#### Point-in-Time Recovery (PITR)
```bash
# Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'
archive_timeout = 300

# Create base backup
pg_basebackup -U $DB_USER -h localhost -D /var/lib/postgresql/base_backup -Ft -z -P -W
```

### 2. Recovery Procedures

#### Full Database Recovery
```bash
# Stop PostgreSQL
sudo systemctl stop postgresql

# Drop existing database
sudo -u postgres dropdb freelance_platform

# Create new database
sudo -u postgres createdb freelance_platform

# Restore from backup
pg_restore -U $DB_USER -h localhost -d freelance_platform -v /path/to/backup.dump

# Start PostgreSQL
sudo systemctl start postgresql
```

#### Point-in-Time Recovery
```bash
# Restore base backup
pg_restore -U $DB_USER -h localhost -d freelance_platform_temp /path/to/base_backup.tar

# Apply WAL logs for point-in-time recovery
pg_ctl start -D /var/lib/postgresql/data -o "-c recovery_target_time='2024-01-01 12:00:00'"
```

### 3. Testing Backup Integrity

```bash
#!/bin/bash
# test_backup.sh

BACKUP_FILE=$1
TEST_DB="freelance_platform_test"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Create test database
sudo -u postgres createdb $TEST_DB

# Restore backup to test database
pg_restore -U $DB_USER -h localhost -d $TEST_DB -v $BACKUP_FILE

# Run integrity checks
python manage.py check --database $TEST_DB

# Clean up test database
sudo -u postgres dropdb $TEST_DB

echo "Backup integrity test completed successfully"
```

## Security Considerations

### 1. Database Security

#### User Privileges
```sql
-- Create read-only user for reporting
CREATE USER reporting_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE freelance_platform TO reporting_user;
GRANT USAGE ON SCHEMA public TO reporting_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_user;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO reporting_user;

-- Create application user with limited privileges
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO freelance_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO freelance_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO freelance_user;
```

#### Row Level Security (RLS)
```sql
-- Enable RLS for sensitive tables
ALTER TABLE accounts_user ENABLE ROW LEVEL SECURITY;

-- Policy for users to only see their own data
CREATE POLICY user_data_policy ON accounts_user
    FOR ALL TO freelance_user
    USING (id = current_setting('app.current_user_id')::uuid);

-- Policy for freelancers to see their orders
CREATE POLICY freelancer_orders_policy ON orders_order
    FOR ALL TO freelance_user
    USING (freelancer_id = current_setting('app.current_user_id')::uuid);
```

### 2. Data Encryption

#### Encryption at Rest
```sql
-- Enable transparent data encryption (TDE) if available
-- Use encrypted file systems for sensitive data
-- Consider pgcrypto for column-level encryption

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive columns
UPDATE accounts_user SET
    phone_number = crypt(phone_number, gen_salt('bf')),
    wechat_id = crypt(wechat_id, gen_salt('bf'));
```

#### Encryption in Transit
```python
# Use SSL connections
DATABASES = {
    'default': {
        'OPTIONS': {
            'sslmode': 'require',
            'sslcert': '/path/to/client-cert.pem',
            'sslkey': '/path/to/client-key.pem',
            'sslrootcert': '/path/to/ca-cert.pem',
        },
    }
}
```

### 3. Audit Logging

```sql
-- Create audit log table
CREATE TABLE audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(255),
    operation VARCHAR(10),
    user_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, user_id, old_values, new_values)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        current_setting('app.current_user_id')::uuid,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON accounts_user
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

## Maintenance Procedures

### 1. Regular Maintenance Tasks

```bash
#!/bin/bash
# maintenance.sh

# Update statistics
psql -U $DB_USER -d $DB_NAME -c "ANALYZE;"

# Reindex fragmented indexes
psql -U $DB_USER -d $DB_NAME -c "REINDEX DATABASE $DB_NAME;"

# Vacuum old tables
psql -U $DB_USER -d $DB_NAME -c "VACUUM ANALYZE;"

# Clean up old logs (older than 90 days)
psql -U $DB_USER -d $DB_NAME -c "DELETE FROM accounts_useractivitylog WHERE created_at < NOW() - INTERVAL '90 days';"
```

### 2. Performance Tuning

```sql
-- Identify and optimize slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan < 100;

-- Update table statistics for better query planning
ANALYZE accounts_user;
ANALYZE gigs_gig;
ANALYZE orders_order;
```

### 3. Capacity Planning

Monitor these metrics monthly:
- Database size growth rate
- Query performance trends
- Connection pool utilization
- Disk space usage
- Memory consumption

This comprehensive database implementation provides a solid foundation for scaling the Chinese freelance marketplace platform to handle thousands of concurrent users while maintaining optimal performance and data integrity.