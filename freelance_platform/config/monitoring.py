"""
Database monitoring and performance analysis utilities for the freelance platform.
"""

import time
import logging
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from contextlib import contextmanager
import json

logger = logging.getLogger(__name__)


class DatabaseMonitor:
    """Database performance monitoring and analysis tools."""

    @staticmethod
    def execute_query_with_timing(query, params=None):
        """Execute a query and return results with timing information."""
        start_time = time.time()

        with connection.cursor() as cursor:
            cursor.execute(query, params or [])
            results = cursor.fetchall()

            # Get column names
            columns = [desc[0] for desc in cursor.description]

            # Convert to list of dicts
            results = [dict(zip(columns, row)) for row in results]

        execution_time = time.time() - start_time

        return {
            'results': results,
            'execution_time': execution_time,
            'row_count': len(results)
        }

    @staticmethod
    def get_slow_queries(limit=20):
        """Get slow queries from pg_stat_statements."""
        query = """
            SELECT
                query,
                calls,
                total_time,
                mean_time,
                rows,
                100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
            FROM pg_stat_statements
            WHERE mean_time > 100
            ORDER BY mean_time DESC
            LIMIT %s
        """
        return DatabaseMonitor.execute_query_with_timing(query, [limit])

    @staticmethod
    def get_index_usage_stats():
        """Get index usage statistics."""
        query = """
            SELECT
                schemaname,
                tablename,
                indexname,
                idx_scan,
                idx_tup_read,
                idx_tup_fetch,
                pg_size_pretty(pg_relation_size(indexrelid)) as index_size
            FROM pg_stat_user_indexes
            ORDER BY idx_scan DESC
        """
        return DatabaseMonitor.execute_query_with_timing(query)

    @staticmethod
    def get_table_sizes():
        """Get table size statistics."""
        query = """
            SELECT
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
                pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes,
                n_live_tup as live_tuples,
                n_dead_tup as dead_tuples
            FROM pg_stat_user_tables
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        """
        return DatabaseMonitor.execute_query_with_timing(query)

    @staticmethod
    def get_connection_stats():
        """Get database connection statistics."""
        query = """
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
                tup_deleted,
                stats_reset
            FROM pg_stat_database
            WHERE datname = current_database()
        """
        return DatabaseMonitor.execute_query_with_timing(query)

    @staticmethod
    def get_lock_status():
        """Get current lock status."""
        query = """
            SELECT
                t.relname as table_name,
                l.locktype,
                l.mode,
                l.granted,
                a.query,
                a.state,
                a.wait_event_type,
                a.wait_event,
                a.backend_start,
                a.query_start
            FROM pg_locks l
            JOIN pg_class t ON l.relation = t.oid
            LEFT JOIN pg_stat_activity a ON l.pid = a.pid
            WHERE NOT l.granted OR a.wait_event IS NOT NULL
            ORDER BY t.relname, l.mode
        """
        return DatabaseMonitor.execute_query_with_timing(query)

    @staticmethod
    def get_cache_hit_ratio():
        """Get database cache hit ratio."""
        query = """
            SELECT
                datname,
                blks_hit,
                blks_read,
                round(
                    CASE
                        WHEN blks_hit + blks_read = 0 THEN 0
                        ELSE (blks_hit::float / (blks_hit + blks_read)) * 100
                    END, 2
                ) as cache_hit_ratio
            FROM pg_stat_database
            WHERE datname = current_database()
        """
        return DatabaseMonitor.execute_query_with_timing(query)

    @staticmethod
    def get_vacuum_stats():
        """Get vacuum and analyze statistics."""
        query = """
            SELECT
                schemaname,
                tablename,
                last_vacuum,
                last_autovacuum,
                last_analyze,
                last_autoanalyze,
                vacuum_count,
                autovacuum_count,
                analyze_count,
                autoanalyze_count
            FROM pg_stat_user_tables
            ORDER BY last_autovacuum DESC NULLS LAST
        """
        return DatabaseMonitor.execute_query_with_timing(query)

    @staticmethod
    def analyze_query_performance(query, params=None):
        """Analyze query performance using EXPLAIN ANALYZE."""
        explain_query = f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {query}"

        start_time = time.time()
        result = DatabaseMonitor.execute_query_with_timing(explain_query, params)
        analysis_time = time.time() - start_time

        if result['results']:
            plan = result['results'][0]['QUERY PLAN'][0]

            return {
                'execution_plan': plan,
                'execution_time': plan.get('Execution Time', 0),
                'planning_time': plan.get('Planning Time', 0),
                'total_cost': plan.get('Total Cost', 0),
                'actual_rows': plan.get('Actual Rows', 0),
                'analysis_time': analysis_time
            }

        return None

    @staticmethod
    def get_bloating_tables():
        """Identify tables with high bloat."""
        query = """
            SELECT
                schemaname,
                tablename,
                pg_size_pretty(bs.bloat_size) AS bloat_size,
                pg_size_pretty(ws.relation_size) AS table_size,
                CASE
                    WHEN ws.relation_size > 0 THEN
                        round(100.0 * bs.bloat_size / ws.relation_size, 2)
                    ELSE 0
                END AS bloat_percentage
            FROM (
                SELECT
                    schemaname,
                    tablename,
                    cc.reltuples,
                    cc.relpages,
                    bs.bloat_size
                FROM pg_class cc
                JOIN pg_namespace nn ON cc.relnamespace = nn.oid
                JOIN pg_stat_all_tables ps ON cc.relname = ps.relname
                LEFT JOIN (
                    SELECT
                        schemaname,
                        tablename,
                        SUM(((bs.smlhdr + 24) * t.count)) AS bloat_size
                    FROM (
                        SELECT
                            schemaname,
                            tablename,
                            (SELECT count(*) FROM pg_attribute WHERE attrelid = t.oid AND attstattarget > 0) AS count,
                            (SELECT smlhdr FROM pg_statistic WHERE starelid = t.oid LIMIT 1) AS smlhdr
                        FROM pg_stat_all_tables t
                    ) bs
                    GROUP BY schemaname, tablename
                ) bs ON ps.schemaname = bs.schemaname AND ps.relname = bs.tablename
                WHERE nn.nspname = 'public'
            ) bs
            JOIN (
                SELECT
                    schemaname,
                    tablename,
                    pg_relation_size(schemaname||'.'||tablename) AS relation_size
                FROM pg_stat_all_tables
                WHERE schemaname = 'public'
            ) ws ON bs.schemaname = ws.schemaname AND bs.tablename = ws.tablename
            WHERE bs.bloat_size > 1048576  -- Only show tables with > 1MB bloat
            ORDER BY bloat_percentage DESC
        """
        return DatabaseMonitor.execute_query_with_timing(query)

    @staticmethod
    def check_missing_indexes():
        """Check for potentially missing indexes based on query patterns."""
        query = """
            SELECT
                schemaname,
                tablename,
                attname,
                n_distinct,
                correlation
            FROM pg_stats
            WHERE schemaname = 'public'
            AND n_distinct > 100
            AND correlation < 0.1
            ORDER BY n_distinct DESC
            LIMIT 20
        """
        return DatabaseMonitor.execute_query_with_timing(query)

    @staticmethod
    def get_replication_lag():
        """Get replication lag if replication is configured."""
        query = """
            SELECT
                application_name,
                client_addr,
                state,
                sync_priority,
                sync_state,
                pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), flush_lsn)) AS lag_bytes
            FROM pg_stat_replication
            ORDER BY sync_priority DESC, application_name
        """
        return DatabaseMonitor.execute_query_with_timing(query)


class QueryOptimizer:
    """Query optimization utilities."""

    @staticmethod
    @contextmanager
    def query_debugger():
        """Context manager to debug query performance."""
        start_time = time.time()
        initial_queries = len(connection.queries)

        yield

        end_time = time.time()
        total_time = end_time - start_time
        query_count = len(connection.queries) - initial_queries

        if query_count > 0:
            logger.info(f"Executed {query_count} queries in {total_time:.4f}s")
            for query in connection.queries[initial_queries:]:
                logger.debug(f"Query: {query['sql'][:200]}... Time: {query['time']:.4f}s")

    @staticmethod
    def optimize_n_plus_one(queryset, select_related=None, prefetch_related=None):
        """Optimize queryset to prevent N+1 queries."""
        if select_related:
            queryset = queryset.select_related(*select_related)
        if prefetch_related:
            queryset = queryset.prefetch_related(*prefetch_related)
        return queryset

    @staticmethod
    def get_query_plan(query, params=None):
        """Get query execution plan."""
        with connection.cursor() as cursor:
            cursor.execute(f"EXPLAIN (ANALYZE, BUFFERS) {query}", params or [])
            return cursor.fetchall()

    @staticmethod
    def benchmark_query(query, params=None, iterations=5):
        """Benchmark query performance."""
        times = []

        for _ in range(iterations):
            start_time = time.time()
            DatabaseMonitor.execute_query_with_timing(query, params)
            times.append(time.time() - start_time)

        return {
            'min_time': min(times),
            'max_time': max(times),
            'avg_time': sum(times) / len(times),
            'iterations': iterations
        }


class HealthChecker:
    """Database health checking utilities."""

    @staticmethod
    def check_database_health():
        """Perform comprehensive database health check."""
        health_status = {
            'overall_status': 'healthy',
            'checks': {},
            'recommendations': []
        }

        # Check connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health_status['checks']['connection'] = {'status': 'pass', 'message': 'Database connection OK'}
        except Exception as e:
            health_status['checks']['connection'] = {'status': 'fail', 'message': str(e)}
            health_status['overall_status'] = 'unhealthy'

        # Check cache hit ratio
        cache_result = DatabaseMonitor.get_cache_hit_ratio()
        if cache_result['results']:
            hit_ratio = cache_result['results'][0]['cache_hit_ratio']
            if hit_ratio < 90:
                health_status['checks']['cache_hit_ratio'] = {'status': 'warning', 'value': hit_ratio}
                health_status['recommendations'].append('Consider increasing shared_buffers for better cache performance')
            else:
                health_status['checks']['cache_hit_ratio'] = {'status': 'pass', 'value': hit_ratio}

        # Check for long-running queries
        lock_result = DatabaseMonitor.get_lock_status()
        if lock_result['results']:
            health_status['checks']['locks'] = {'status': 'warning', 'count': len(lock_result['results'])}
            health_status['recommendations'].append('There are blocked queries - investigate potential deadlocks')
        else:
            health_status['checks']['locks'] = {'status': 'pass', 'count': 0}

        # Check table bloat
        bloat_result = DatabaseMonitor.get_bloating_tables()
        if bloat_result['results']:
            high_bloat = [t for t in bloat_result['results'] if t['bloat_percentage'] > 20]
            if high_bloat:
                health_status['checks']['bloat'] = {'status': 'warning', 'count': len(high_bloat)}
                health_status['recommendations'].append('Some tables have high bloat - consider running VACUUM FULL')
            else:
                health_status['checks']['bloat'] = {'status': 'pass', 'count': 0}

        return health_status

    @staticmethod
    def generate_health_report():
        """Generate comprehensive health report."""
        report = {
            'timestamp': time.time(),
            'health_status': HealthChecker.check_database_health(),
            'performance_metrics': {
                'slow_queries': DatabaseMonitor.get_slow_queries(10),
                'table_sizes': DatabaseMonitor.get_table_sizes()[:10],
                'index_usage': DatabaseMonitor.get_index_usage_stats()[:10],
                'connection_stats': DatabaseMonitor.get_connection_stats(),
            },
            'optimization_recommendations': []
        }

        # Generate optimization recommendations
        slow_queries = report['performance_metrics']['slow_queries']['results']
        if slow_queries and slow_queries[0]['mean_time'] > 1000:
            report['optimization_recommendations'].append({
                'type': 'slow_queries',
                'message': f"Slowest query takes {slow_queries[0]['mean_time']:.2f}ms on average",
                'query': slow_queries[0]['query'][:100] + "..."
            })

        return report


# Example usage in management commands or views
def run_performance_audit():
    """Run complete performance audit."""
    logger.info("Starting database performance audit...")

    health_report = HealthChecker.generate_health_report()

    # Log results
    logger.info(f"Database health status: {health_report['health_status']['overall_status']}")

    # Cache results for dashboard
    cache.set('db_health_report', health_report, timeout=300)  # 5 minutes

    return health_report