"""
Database optimization configurations and utilities for the freelance platform.
"""

# PostgreSQL configuration for optimal performance
POSTGRESQL_SETTINGS = {
    # Connection pool settings
    'ENGINE': 'django.db.backends.postgresql',
    'OPTIONS': {
        # Connection settings
        'MAX_CONNS': 100,
        'MIN_CONNS': 5,

        # Query optimization
        'DEFAULT_ROW_LIMIT': 1000,

        # Index optimization
        'CREATE_INDEX_CONCURRENTLY': True,

        # Performance tuning
        'AUTOCOMMIT': True,
        'CONN_MAX_AGE': 60,
    }
}

# Index optimization strategy
INDEX_OPTIMIZATIONS = {
    # Primary indexes for fast lookups
    'primary_indexes': [
        'accounts_user.id',
        'gigs_gig.id',
        'orders_order.id',
        'payments_transaction.id',
        'messaging_conversation.id',
        'reviews_review.id',
    ],

    # Composite indexes for common query patterns
    'composite_indexes': [
        # User and status filtering
        ('accounts_user', ['user_type', 'user_status', 'is_active']),
        ('accounts_user', ['user_type', 'profile_completion_percentage']),

        # Gig search and filtering
        ('gigs_gig', ['category', 'status', 'is_featured']),
        ('gigs_gig', ['freelancer', 'status']),
        ('gigs_gig', ['status', 'average_rating', 'review_count']),

        # Order management
        ('orders_order', ['client', 'status', 'created_at']),
        ('orders_order', ['freelancer', 'status', 'created_at']),
        ('orders_order', ['status', 'delivery_deadline']),

        # Payment processing
        ('payments_transaction', ['user', 'status', 'created_at']),
        ('payments_transaction', ['status', 'provider']),
        ('payments_wallet', ['user', 'balance']),

        # Messaging
        ('messaging_conversation', ['participant1', 'is_active', 'last_message_at']),
        ('messaging_message', ['conversation', 'created_at']),
        ('messaging_message', ['recipient', 'is_read', 'created_at']),

        # Reviews
        ('reviews_review', ['reviewee', 'status', 'is_visible']),
        ('reviews_review', ['rating', 'created_at']),
        ('reviews_user_rating', ['user', 'overall_rating', 'total_reviews']),
    ],

    # Full-text search indexes
    'fulltext_indexes': [
        ('gigs_gig', ['title', 'description', 'searchable_text']),
        ('accounts_userprofile', ['bio']),
        ('reviews_review', ['title', 'content']),
    ],

    # Partial indexes for better performance
    'partial_indexes': [
        # Active users only
        ('accounts_user', ['email'], {'user_type': 'freelancer', 'user_status': 'active'}),
        ('accounts_user', ['email'], {'user_type': 'client', 'user_status': 'active'}),

        # Active gigs only
        ('gigs_gig', ['category', 'created_at'], {'status': 'active'}),
        ('gigs_gig', ['freelancer', 'average_rating'], {'status': 'active', 'average_rating__gt': 4.0}),

        # Recent orders
        ('orders_order', ['client', 'created_at'], {'created_at__gte': '2024-01-01'}),
        ('orders_order', ['freelancer', 'created_at'], {'created_at__gte': '2024-01-01'}),

        # Unread messages
        ('messaging_message', ['recipient', 'created_at'], {'is_read': False}),
    ]
}

# Query optimization patterns
OPTIMIZED_QUERIES = {
    # N+1 query prevention
    'select_related': [
        # Always select related for single relationships
        'gigs_gig__freelancer',
        'gigs_gig__category',
        'orders_order__client',
        'orders_order__freelancer',
        'orders_order__gig',
        'reviews_review__reviewer',
        'reviews_review__reviewee',
        'payments_transaction__user',
        'messaging_conversation__participant1',
        'messaging_conversation__participant2',
    ],

    'prefetch_related': [
        # Always prefetch for multiple relationships
        'gigs_gig__packages',
        'gigs_gig__requirements',
        'gigs_gig__faqs',
        'gigs_gig__extras',
        'accounts_user__user_skills__skill',
        'accounts_user__educations',
        'accounts_user__work_experiences',
        'accounts_user__portfolios',
        'orders_order__order_extras',
        'orders_order__requirements',
        'reviews_review__helpful_votes',
    ],

    # Optimized querysets for common patterns
    'gigs_list': """
        SELECT g.*, f.username as freelancer_name,
               p.first_name, p.last_name, p.avatar,
               c.name as category_name
        FROM gigs_gig g
        JOIN accounts_user f ON g.freelancer_id = f.id
        LEFT JOIN accounts_userprofile p ON f.id = p.user_id
        JOIN gigs_category c ON g.category_id = c.id
        WHERE g.status = 'active'
        AND f.user_status = 'active'
        ORDER BY g.is_featured DESC, g.average_rating DESC
        LIMIT 50
    """,

    'user_statistics': """
        SELECT
            u.id,
            u.username,
            u.user_type,
            p.profile_completion_percentage,
            COALESCE(ur.overall_rating, 0) as rating,
            COALESCE(ur.total_reviews, 0) as review_count,
            COALESCE(gig_stats.gig_count, 0) as gig_count,
            COALESCE(order_stats.order_count, 0) as order_count
        FROM accounts_user u
        LEFT JOIN accounts_userprofile p ON u.id = p.user_id
        LEFT JOIN reviews_user_rating ur ON u.id = ur.user_id
        LEFT JOIN (
            SELECT freelancer_id, COUNT(*) as gig_count
            FROM gigs_gig
            WHERE status = 'active'
            GROUP BY freelancer_id
        ) gig_stats ON u.id = gig_stats.freelancer_id
        LEFT JOIN (
            SELECT freelancer_id, COUNT(*) as order_count
            FROM orders_order
            WHERE status IN ('completed', 'delivered')
            GROUP BY freelancer_id
        ) order_stats ON u.id = order_stats.freelancer_id
        WHERE u.user_type = 'freelancer'
        AND u.user_status = 'active'
    """,

    'order_analytics': """
        SELECT
            DATE(created_at) as date,
            status,
            COUNT(*) as order_count,
            SUM(total_price) as total_revenue,
            AVG(total_price) as avg_order_value
        FROM orders_order
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at), status
        ORDER BY date DESC, status
    """
}

# Caching strategy
CACHE_STRATEGY = {
    # Cache TTL in seconds
    'user_profile': 3600,  # 1 hour
    'gig_details': 1800,   # 30 minutes
    'category_list': 7200, # 2 hours
    'user_ratings': 1800,  # 30 minutes
    'search_results': 300, # 5 minutes
    'statistics': 600,     # 10 minutes

    # Cache keys patterns
    'key_patterns': {
        'user_profile': 'user_profile:{user_id}',
        'gig_details': 'gig:{gig_id}',
        'user_gigs': 'user_gigs:{user_id}:{page}',
        'category_gigs': 'category_gigs:{category_id}:{page}',
        'user_ratings': 'user_ratings:{user_id}',
        'search_results': 'search:{query_hash}:{page}',
    }
}

# Database monitoring queries
MONITORING_QUERIES = {
    'slow_queries': """
        SELECT query, mean_time, calls, total_time
        FROM pg_stat_statements
        WHERE mean_time > 1000
        ORDER BY mean_time DESC
        LIMIT 20
    """,

    'index_usage': """
        SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC
        LIMIT 50
    """,

    'table_sizes': """
        SELECT
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
            pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY size_bytes DESC
        LIMIT 20
    """,

    'active_connections': """
        SELECT
            datname,
            numbackends,
            xact_commit,
            xact_rollback,
            blks_read,
            blks_hit,
            tup_returned,
            tup_fetched,
            tup_inserted,
            tup_updated,
            tup_deleted
        FROM pg_stat_database
        WHERE datname = current_database()
    """,

    'lock_status': """
        SELECT
            t.relname as table_name,
            l.locktype,
            l.mode,
            l.granted,
            a.query
        FROM pg_locks l
        JOIN pg_class t ON l.relation = t.oid
        JOIN pg_stat_activity a ON l.pid = a.pid
        WHERE NOT l.granted
        ORDER BY t.relname
    """
}

# Performance optimization recommendations
OPTIMIZATION_RECOMMENDATIONS = {
    'index_suggestions': [
        'Add composite index on (freelancer, status, average_rating) for gig sorting',
        'Add partial index on active users for faster authentication',
        'Add full-text search index on gig title and description',
        'Add index on conversation last_message_at for messaging performance',
        'Add index on transaction status and created_at for payment analytics',
    ],

    'query_optimizations': [
        'Use select_related for foreign key relationships',
        'Use prefetch_related for many-to-many relationships',
        'Implement pagination for large result sets',
        'Use database-level filtering instead of Python filtering',
        'Optimize search queries with proper indexing',
    ],

    'caching_strategies': [
        'Cache user profiles and ratings',
        'Cache gig details and categories',
        'Cache search results for popular queries',
        'Implement session-based caching for user preferences',
        'Use Redis for real-time features like messaging',
    ],

    'scaling_strategies': [
        'Implement read replicas for reporting queries',
        'Use database partitioning for large tables',
        'Implement connection pooling',
        'Use database sharding for horizontal scaling',
        'Optimize query performance with proper indexing',
    ]
}