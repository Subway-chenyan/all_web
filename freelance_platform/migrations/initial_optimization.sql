-- PostgreSQL Database Optimization Script
-- Chinese Freelance Marketplace Platform
-- Run this after initial migrations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text similarity search
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- For composite indexes
CREATE EXTENSION IF NOT EXISTS "btree_gist";  -- For complex indexes

-- Performance tuning settings
-- Adjust these based on your server specifications
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Create optimized indexes for accounts app
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_user_type_status
ON accounts_user(user_type, user_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_user_completion
ON accounts_user(profile_completion_percentage) WHERE profile_completion_percentage > 50;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_user_active_freelancers
ON accounts_user(id) WHERE user_type = 'freelancer' AND user_status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_profile_location
ON accounts_userprofile(province, city) WHERE province IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_profile_hourly_rate
ON accounts_userprofile(hourly_rate) WHERE hourly_rate IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_skill_category
ON accounts_skill(category);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_user_skill_proficiency
ON accounts_user_skill(skill_id, proficiency_level);

-- Create optimized indexes for gigs app
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gigs_gig_active_featured
ON gigs_gig(status, is_featured, average_rating DESC) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gigs_gig_category_status
ON gigs_gig(category_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gigs_gig_freelancer_active
ON gigs_gig(freelancer_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gigs_gig_search
ON gigs_gig USING gin(searchable_text gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gigs_gig_price_range
ON gigs_gig_package(price, delivery_days);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gigs_view_daily
ON gigs_gig_view(gig_id, created_at::date);

-- Create optimized indexes for orders app
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_client_status
ON orders_order(client_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_freelancer_status
ON orders_order(freelancer_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_deadline
ON orders_order(status, delivery_deadline) WHERE status NOT IN ('completed', 'cancelled', 'refunded');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_priority_status
ON orders_order(priority, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_history
ON orders_order_status_history(order_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_delivery_status
ON orders_delivery(order_id, is_final_delivery, is_accepted);

-- Create optimized indexes for payments app
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_wallet_balance
ON payments_wallet(user_id, balance) WHERE balance > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_transaction_status
ON payments_transaction(user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_transaction_provider
ON payments_transaction(provider, status) WHERE status = 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_escrow_status
ON payments_escrow(client_id, status, funded_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_escrow_freelancer
ON payments_escrow(freelancer_id, status, funded_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_withdrawal_status
ON payments_withdrawal(user_id, status, created_at DESC);

-- Create optimized indexes for messaging app
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messaging_conversation_active
ON messaging_conversation(
    LEAST(participant1_id, participant2_id),
    GREATEST(participant1_id, participant2_id),
    is_active,
    last_message_at DESC
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messaging_message_unread
ON messaging_message(recipient_id, is_read, created_at DESC) WHERE is_read = FALSE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messaging_message_conversation
ON messaging_message(conversation_id, created_at ASC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messaging_conversation_unread
ON messaging_conversation(participant1_id, participant1_unread_count)
WHERE participant1_unread_count > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messaging_conversation_unread2
ON messaging_conversation(participant2_id, participant2_unread_count)
WHERE participant2_unread_count > 0;

-- Create optimized indexes for reviews app
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_review_visible
ON reviews_review(reviewee_id, is_visible, rating DESC) WHERE is_visible = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_review_rating
ON reviews_review(rating, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_rating
ON reviews_user_rating(overall_rating DESC, total_reviews DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_review_type
ON reviews_review(review_type, status) WHERE status = 'published';

-- Create full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gigs_gig_fulltext
ON gigs_gig USING gin(to_tsvector('english', title || ' ' || description || ' ' || searchable_text));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_profile_fulltext
ON accounts_userprofile USING gin(to_tsvector('english', bio));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_fulltext
ON reviews_review USING gin(to_tsvector('english', title || ' ' || content));

-- Create partial indexes for better performance on large tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_freelancer_rating
ON accounts_userprofile(hourly_rate)
WHERE hourly_rate > 0 AND user_id IN (
    SELECT id FROM accounts_user WHERE user_type = 'freelancer' AND user_status = 'active'
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gigs_high_rated
ON gigs_gig(freelancer_id, average_rating DESC)
WHERE status = 'active' AND average_rating >= 4.5;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_active
ON orders_order(id, created_at)
WHERE status NOT IN ('completed', 'cancelled', 'refunded');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recent
ON messaging_message(id, created_at)
WHERE created_at > CURRENT_DATE - INTERVAL '30 days';

-- Create composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gigs_search_filter
ON gigs_gig(category_id, status, average_rating DESC, price_min)
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_analytics
ON orders_order(created_at::date, status, total_price);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_daily_stats
ON payments_transaction(created_at::date, provider, status);

-- Create function for automatic statistics updates
CREATE OR REPLACE FUNCTION update_table_stats()
RETURNS void AS $$
BEGIN
    -- Update statistics for frequently changing tables
    ANALYZE accounts_user;
    ANALYZE gigs_gig;
    ANALYZE orders_order;
    ANALYZE payments_transaction;
    ANALYZE messaging_message;
    ANALYZE reviews_review;
END;
$$ LANGUAGE plpgsql;

-- Create view for user statistics (optimized for dashboard)
CREATE OR REPLACE VIEW user_statistics AS
SELECT
    u.id,
    u.username,
    u.user_type,
    u.created_at,
    p.profile_completion_percentage,
    COALESCE(ur.overall_rating, 0) as overall_rating,
    COALESCE(ur.total_reviews, 0) as total_reviews,
    COALESCE(gig_count, 0) as active_gigs,
    COALESCE(order_count, 0) as completed_orders,
    COALESCE(wallet_balance, 0) as wallet_balance
FROM accounts_user u
LEFT JOIN accounts_userprofile p ON u.id = p.user_id
LEFT JOIN reviews_user_rating ur ON u.id = ur.user_id
LEFT JOIN (
    SELECT freelancer_id, COUNT(*) as gig_count
    FROM gigs_gig
    WHERE status = 'active'
    GROUP BY freelancer_id
) gigs ON u.id = gigs.freelancer_id
LEFT JOIN (
    SELECT freelancer_id, COUNT(*) as order_count
    FROM orders_order
    WHERE status = 'completed'
    GROUP BY freelancer_id
) orders ON u.id = orders.freelancer_id
LEFT JOIN payments_wallet w ON u.id = w.user_id
WHERE u.user_status = 'active';

-- Create view for gig statistics
CREATE OR REPLACE VIEW gig_statistics AS
SELECT
    g.id,
    g.title,
    g.freelancer_id,
    g.category_id,
    g.status,
    g.average_rating,
    g.review_count,
    g.view_count,
    g.order_count,
    g.favorite_count,
    g.created_at,
    c.name as category_name,
    u.username as freelancer_username,
    MIN(gp.price) as min_price,
    MAX(gp.price) as max_price,
    AVG(gp.price) as avg_price
FROM gigs_gig g
LEFT JOIN gigs_category c ON g.category_id = c.id
LEFT JOIN accounts_user u ON g.freelancer_id = u.id
LEFT JOIN gigs_gig_package gp ON g.id = gp.gig_id
GROUP BY g.id, c.name, u.username;

-- Create trigger to update search text when gigs are modified
CREATE OR REPLACE FUNCTION update_gig_search_text()
RETURNS trigger AS $$
BEGIN
    NEW.searchable_text = COALESCE(NEW.title, '') || ' ' ||
                          COALESCE(NEW.description, '') || ' ' ||
                          COALESCE(NEW.tags, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gig_search_text
    BEFORE INSERT OR UPDATE ON gigs_gig
    FOR EACH ROW EXECUTE FUNCTION update_gig_search_text();

-- Create trigger to update user rating when reviews are added
CREATE OR REPLACE FUNCTION update_user_rating_trigger()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_ratings() FROM reviews_user_rating WHERE user_id = NEW.reviewee_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rating
    AFTER INSERT OR UPDATE ON reviews_review
    FOR EACH ROW EXECUTE FUNCTION update_user_rating_trigger();

-- Create materialized view for daily statistics (refresh every hour)
CREATE MATERIALIZED VIEW daily_platform_statistics AS
SELECT
    CURRENT_DATE - INTERVAL '1 day' as date,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE user_type = 'freelancer') as freelancers,
    COUNT(*) FILTER (WHERE user_type = 'client') as clients,
    (SELECT COUNT(*) FROM gigs_gig WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as new_gigs,
    (SELECT COUNT(*) FROM orders_order WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as new_orders,
    (SELECT COUNT(*) FROM payments_transaction WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND status = 'completed') as completed_transactions,
    (SELECT COALESCE(SUM(amount), 0) FROM payments_transaction WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND status = 'completed') as daily_revenue
FROM accounts_user
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day';

CREATE UNIQUE INDEX idx_daily_stats_date ON daily_platform_statistics(date);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_statistics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_platform_statistics;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job (requires pg_cron extension)
-- SELECT cron.schedule('refresh-stats', '0 1 * * *', 'SELECT refresh_daily_statistics();');

COMMIT;

-- Reload PostgreSQL configuration
SELECT pg_reload_conf();