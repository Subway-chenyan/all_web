"""
Security middleware for social authentication
"""
import logging
import time
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models_social import SocialLoginAttempt

logger = logging.getLogger(__name__)
User = get_user_model()


class SocialAuthSecurityMiddleware:
    """
    Security middleware for social authentication endpoints
    Provides rate limiting, IP tracking, and security monitoring
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only apply to social auth endpoints
        if '/api/accounts/social/' in request.path:
            # Rate limiting check
            if not self._check_rate_limit(request):
                return JsonResponse({
                    'success': False,
                    'error': 'Too many requests. Please try again later.',
                    'error_code': 'RATE_LIMIT_EXCEEDED'
                }, status=429)

            # Add security headers
            response = self.get_response(request)
            self._add_security_headers(response)
            return response

        return self.get_response(request)

    def _check_rate_limit(self, request):
        """Check rate limiting for social auth endpoints"""
        client_ip = self._get_client_ip(request)
        endpoint = request.path.split('/')[-2]  # Get endpoint name
        cache_key = f"social_auth_rate_limit:{client_ip}:{endpoint}"

        # Get current request count
        current_count = cache.get(cache_key, 0)

        # Define rate limits per endpoint
        rate_limits = {
            'start': 10,  # 10 requests per minute
            'callback': 20,  # 20 requests per minute
            'link': 5,  # 5 requests per minute
        }

        max_requests = rate_limits.get(endpoint, 10)

        if current_count >= max_requests:
            logger.warning(f"Rate limit exceeded for IP {client_ip} on endpoint {endpoint}")
            return False

        # Increment counter with 1 minute expiry
        cache.set(cache_key, current_count + 1, timeout=60)
        return True

    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def _add_security_headers(self, response):
        """Add security headers to response"""
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Add CSP header for social auth endpoints
        if response.get('Content-Type', '').startswith('application/json'):
            response['Content-Security-Policy'] = "default-src 'self'"


class SocialAuthAuditMiddleware:
    """
    Audit middleware for tracking social authentication activities
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if '/api/accounts/social/' in request.path:
            start_time = time.time()

            # Process request
            response = self.get_response(request)

            # Log activity
            duration = time.time() - start_time
            self._log_social_auth_activity(request, response, duration)

            return response

        return self.get_response(request)

    def _log_social_auth_activity(self, request, response, duration):
        """Log social authentication activity"""
        try:
            client_ip = self._get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            method = request.method
            path = request.path
            status_code = response.status_code

            # Extract relevant data
            log_data = {
                'timestamp': timezone.now().isoformat(),
                'client_ip': client_ip,
                'user_agent': user_agent,
                'method': method,
                'path': path,
                'status_code': status_code,
                'duration_ms': round(duration * 1000, 2),
            }

            # Add specific data based on endpoint
            if 'start' in path and method == 'POST':
                try:
                    import json
                    body = json.loads(request.body)
                    log_data['provider'] = body.get('provider')
                except:
                    pass

            elif 'callback' in path and method == 'POST':
                try:
                    import json
                    body = json.loads(request.body)
                    state = body.get('state')
                    if state:
                        # Find the login attempt
                        attempt = SocialLoginAttempt.objects.filter(state=state).first()
                        if attempt:
                            log_data['attempt_id'] = str(attempt.attempt_id)
                            log_data['provider'] = attempt.provider
                            log_data['status'] = attempt.status
                except:
                    pass

            # Log based on status
            if status_code >= 400:
                logger.warning(f"Social auth error: {log_data}")
            elif status_code == 200 and 'callback' in path:
                logger.info(f"Social auth success: {log_data}")

        except Exception as e:
            logger.error(f"Error logging social auth activity: {str(e)}")

    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SocialAuthCSRFMiddleware:
    """
    CSRF protection middleware for social authentication
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only apply to POST requests on social auth endpoints
        if (request.method == 'POST' and
            '/api/accounts/social/' in request.path and
            'callback' not in request.path):  # Callback already uses state parameter

            if not self._verify_csrf_token(request):
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid CSRF token',
                    'error_code': 'CSRF_INVALID'
                }, status=403)

        return self.get_response(request)

    def _verify_csrf_token(self, request):
        """Verify CSRF token for social auth requests"""
        # Get CSRF token from header or cookie
        csrf_token = request.META.get('HTTP_X_CSRFTOKEN') or request.COOKIES.get('csrftoken')

        if not csrf_token:
            return False

        # Verify against cache
        cached_token = cache.get(f"csrf_token:{self._get_client_ip(request)}")

        return cached_token == csrf_token

    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SocialAuthIPWhitelistMiddleware:
    """
    IP whitelist middleware for admin social auth endpoints (optional)
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.whitelisted_ips = getattr(settings, 'SOCIAL_AUTH_ADMIN_IP_WHITELIST', [])

    def __call__(self, request):
        # Only apply to admin endpoints
        if '/api/accounts/social/admin/' in request.path:
            client_ip = self._get_client_ip(request)

            if client_ip not in self.whitelisted_ips:
                return JsonResponse({
                    'success': False,
                    'error': 'Access denied',
                    'error_code': 'IP_NOT_ALLOWED'
                }, status=403)

        return self.get_response(request)

    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip