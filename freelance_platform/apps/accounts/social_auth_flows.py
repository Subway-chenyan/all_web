"""
Social authentication flow implementations for WeChat and QQ
"""
import logging
import uuid
import requests
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.urls import reverse
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
from .models_social import SocialAccount, SocialLoginAttempt, SocialProvider, SocialProfileSync
from .models import User, UserProfile

logger = logging.getLogger(__name__)
UserModel = get_user_model()


class SocialAuthFlow:
    """Base class for social authentication flows"""

    PROVIDER = None
    AUTH_URL = None
    TOKEN_URL = None
    USER_INFO_URL = None
    SCOPE = None

    def __init__(self):
        self.client_id = getattr(settings, f'{self.PROVIDER.upper()}_CLIENT_ID')
        self.client_secret = getattr(settings, f'{self.PROVIDER.upper()}_CLIENT_SECRET')
        self.redirect_uri = getattr(settings, f'{self.PROVIDER.upper()}_REDIRECT_URI')

    def get_authorization_url(self, state=None, **kwargs):
        """Generate OAuth authorization URL"""
        if not state:
            state = str(uuid.uuid4())

        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': self.SCOPE,
            'state': state,
            **kwargs
        }

        auth_url = f"{self.AUTH_URL}?" + "&".join([f"{k}={v}" for k, v in params.items()])

        # Store state in cache for security
        cache.set(f"social_auth_state:{state}", {
            'provider': self.PROVIDER,
            'created_at': timezone.now().isoformat(),
        }, timeout=600)  # 10 minutes expiry

        return auth_url, state

    def exchange_code_for_token(self, code):
        """Exchange authorization code for access token"""
        raise NotImplementedError

    def get_user_info(self, access_token, openid=None):
        """Get user information from social platform"""
        raise NotImplementedError

    def process_callback(self, code, state):
        """Process OAuth callback and return user info"""
        # Verify state
        cached_state = cache.get(f"social_auth_state:{state}")
        if not cached_state or cached_state['provider'] != self.PROVIDER:
            raise ValueError("Invalid or expired state parameter")

        # Clear state from cache
        cache.delete(f"social_auth_state:{state}")

        # Exchange code for token
        token_data = self.exchange_code_for_token(code)

        # Get user info
        user_info = self.get_user_info(
            token_data.get('access_token'),
            token_data.get('openid')
        )

        return {
            'token_data': token_data,
            'user_info': user_info,
            'provider': self.PROVIDER
        }

    def create_or_update_social_account(self, user, token_data, user_info):
        """Create or update social account for user"""
        openid = user_info.get('openid') or token_data.get('openid')
        unionid = user_info.get('unionid')
        uid = user_info.get('uid') or openid

        if not openid and not uid:
            raise ValueError("Missing both openid and uid from social platform")

        social_account, created = SocialAccount.objects.update_or_create(
            user=user,
            provider=self.PROVIDER,
            openid=openid,
            defaults={
                'uid': uid,
                'unionid': unionid,
                'raw_data': user_info,
                'extra_data': token_data,
                'access_token': token_data.get('access_token'),
                'refresh_token': token_data.get('refresh_token'),
                'last_synced_at': timezone.now(),
            }
        )

        # Set token expiration if provided
        if 'expires_in' in token_data:
            social_account.update_token(
                access_token=token_data.get('access_token'),
                refresh_token=token_data.get('refresh_token'),
                expires_in=token_data.get('expires_in')
            )

        return social_account

    def sync_user_profile(self, user, social_account, user_info):
        """Sync user profile data from social platform"""
        sync_record = SocialProfileSync.objects.create(
            social_account=social_account,
            sync_type='profile',
            status='processing'
        )

        try:
            processed_fields = []

            # Update user profile
            profile, _ = UserProfile.objects.get_or_create(user=user)

            # Basic profile fields
            if 'nickname' in user_info:
                profile.first_name = user_info['nickname']
                processed_fields.append('first_name')

            if 'avatar_url' in user_info or 'headimgurl' in user_info:
                avatar_url = user_info.get('avatar_url') or user_info.get('headimgurl')
                # TODO: Download and save avatar
                processed_fields.append('avatar')

            if 'sex' in user_info or 'gender' in user_info:
                # Map gender if needed
                processed_fields.append('gender')

            # WeChat specific fields
            if self.PROVIDER == SocialProvider.WECHAT:
                if 'province' in user_info:
                    profile.province = user_info['province']
                    processed_fields.append('province')

                if 'city' in user_info:
                    profile.city = user_info['city']
                    processed_fields.append('city')

                if 'country' in user_info:
                    profile.country = user_info['country']
                    processed_fields.append('country')

            profile.save()

            # Update user account fields
            if 'phone' in user_info or 'mobile' in user_info:
                phone = user_info.get('phone') or user_info.get('mobile')
                if phone and not user.phone_number:
                    user.phone_number = phone
                    processed_fields.append('phone_number')
                    user.save()

            sync_record.status = 'success'
            sync_record.processed_fields = processed_fields
            sync_record.sync_data = user_info
            sync_record.completed_at = timezone.now()
            sync_record.save()

            logger.info(f"Profile sync completed for user {user.id}, fields: {processed_fields}")

        except Exception as e:
            sync_record.status = 'failed'
            sync_record.error_message = str(e)
            sync_record.completed_at = timezone.now()
            sync_record.save()

            logger.error(f"Profile sync failed for user {user.id}: {str(e)}")
            raise


class WeChatAuthFlow(SocialAuthFlow):
    """WeChat OAuth authentication flow"""

    PROVIDER = SocialProvider.WECHAT
    SCOPE = 'snsapi_userinfo'

    def __init__(self):
        super().__init__()
        # WeChat endpoints
        self.AUTH_URL = 'https://open.weixin.qq.com/connect/oauth2/authorize'
        self.TOKEN_URL = 'https://api.weixin.qq.com/sns/oauth2/access_token'
        self.USER_INFO_URL = 'https://api.weixin.qq.com/sns/userinfo'

    def get_authorization_url(self, state=None, appid=None):
        """Generate WeChat authorization URL"""
        if not state:
            state = str(uuid.uuid4())

        params = {
            'appid': self.client_id,  # WeChat uses appid instead of client_id
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': self.SCOPE,
            'state': state,
        }

        auth_url = f"{self.AUTH_URL}?" + "&".join([f"{k}={v}" for k, v in params.items()]) + '#wechat_redirect'

        # Store state in cache
        cache.set(f"social_auth_state:{state}", {
            'provider': self.PROVIDER,
            'created_at': timezone.now().isoformat(),
        }, timeout=600)

        return auth_url, state

    def exchange_code_for_token(self, code):
        """Exchange WeChat authorization code for access token"""
        params = {
            'appid': self.client_id,
            'secret': self.client_secret,
            'code': code,
            'grant_type': 'authorization_code'
        }

        try:
            response = requests.get(self.TOKEN_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'errcode' in data:
                raise ValueError(f"WeChat API error: {data.get('errmsg', 'Unknown error')}")

            return data

        except requests.RequestException as e:
            logger.error(f"WeChat token exchange failed: {str(e)}")
            raise ValueError(f"WeChat token exchange failed: {str(e)}")

    def get_user_info(self, access_token, openid):
        """Get WeChat user information"""
        params = {
            'access_token': access_token,
            'openid': openid,
            'lang': 'zh_CN'
        }

        try:
            response = requests.get(self.USER_INFO_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'errcode' in data:
                raise ValueError(f"WeChat API error: {data.get('errmsg', 'Unknown error')}")

            return data

        except requests.RequestException as e:
            logger.error(f"WeChat user info fetch failed: {str(e)}")
            raise ValueError(f"WeChat user info fetch failed: {str(e)}")


class QQAuthFlow(SocialAuthFlow):
    """QQ OAuth authentication flow"""

    PROVIDER = SocialProvider.QQ
    SCOPE = 'get_user_info'

    def __init__(self):
        super().__init__()
        # QQ endpoints
        self.AUTH_URL = 'https://graph.qq.com/oauth2.0/authorize'
        self.TOKEN_URL = 'https://graph.qq.com/oauth2.0/token'
        self.OPENID_URL = 'https://graph.qq.com/oauth2.0/me'
        self.USER_INFO_URL = 'https://graph.qq.com/user/get_user_info'

    def get_authorization_url(self, state=None):
        """Generate QQ authorization URL"""
        if not state:
            state = str(uuid.uuid4())

        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': self.SCOPE,
            'state': state,
        }

        auth_url = f"{self.AUTH_URL}?" + "&".join([f"{k}={v}" for k, v in params.items()])

        # Store state in cache
        cache.set(f"social_auth_state:{state}", {
            'provider': self.PROVIDER,
            'created_at': timezone.now().isoformat(),
        }, timeout=600)

        return auth_url, state

    def exchange_code_for_token(self, code):
        """Exchange QQ authorization code for access token"""
        params = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'redirect_uri': self.redirect_uri,
            'grant_type': 'authorization_code'
        }

        try:
            response = requests.get(self.TOKEN_URL, params=params, timeout=10)
            response.raise_for_status()

            # QQ returns callback( { "access_token":"...", "expires_in":... } );
            # We need to extract JSON from the callback
            content = response.text
            if content.startswith('callback(') and content.endswith(');'):
                json_str = content[9:-2]  # Remove callback( and );
                import json
                data = json.loads(json_str)
            else:
                # Fallback for direct JSON response
                data = response.json()

            return data

        except requests.RequestException as e:
            logger.error(f"QQ token exchange failed: {str(e)}")
            raise ValueError(f"QQ token exchange failed: {str(e)}")

    def get_user_info(self, access_token, openid):
        """Get QQ user information"""
        params = {
            'access_token': access_token,
            'oauth_consumer_key': self.client_id,
            'openid': openid
        }

        try:
            response = requests.get(self.USER_INFO_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if data.get('ret') != 0:
                raise ValueError(f"QQ API error: {data.get('msg', 'Unknown error')}")

            return data

        except requests.RequestException as e:
            logger.error(f"QQ user info fetch failed: {str(e)}")
            raise ValueError(f"QQ user info fetch failed: {str(e)}")


class SocialAuthManager:
    """Manager class for handling social authentication"""

    flows = {
        SocialProvider.WECHAT: WeChatAuthFlow,
        SocialProvider.QQ: QQAuthFlow,
    }

    @classmethod
    def get_flow(cls, provider):
        """Get authentication flow for provider"""
        if provider not in cls.flows:
            raise ValueError(f"Unsupported provider: {provider}")
        return cls.flows[provider]()

    @classmethod
    def start_social_auth(cls, provider, ip_address=None, user_agent=None):
        """Start social authentication process"""
        flow = cls.get_flow(provider)

        # Create login attempt record
        attempt = SocialLoginAttempt.objects.create(
            provider=provider,
            state=str(uuid.uuid4()),
            ip_address=ip_address,
            user_agent=user_agent,
            status='pending'
        )

        # Get authorization URL
        auth_url, state = flow.get_authorization_url(state=attempt.state)

        return {
            'attempt_id': attempt.attempt_id,
            'state': state,
            'auth_url': auth_url
        }

    @classmethod
    def complete_social_auth(cls, provider, code, state, user_type=None, ip_address=None):
        """Complete social authentication process"""
        flow = cls.get_flow(provider)

        # Find login attempt
        try:
            attempt = SocialLoginAttempt.objects.get(
                state=state,
                provider=provider,
                status='pending'
            )
        except SocialLoginAttempt.DoesNotExist:
            raise ValueError("Invalid or expired authentication attempt")

        try:
            # Process callback
            callback_data = flow.process_callback(code, state)
            token_data = callback_data['token_data']
            user_info = callback_data['user_info']

            # Extract identifiers
            openid = user_info.get('openid') or token_data.get('openid')
            unionid = user_info.get('unionid')
            uid = user_info.get('uid') or openid

            if not openid and not uid:
                raise ValueError("Missing user identifiers from social platform")

            # Check if social account already exists
            social_account = None
            user = None

            # Try to find existing social account
            if unionid:
                social_accounts = SocialAccount.objects.filter(
                    provider=provider,
                    unionid=unionid,
                    is_active=True
                )
            elif openid:
                social_accounts = SocialAccount.objects.filter(
                    provider=provider,
                    openid=openid,
                    is_active=True
                )
            else:
                social_accounts = SocialAccount.objects.filter(
                    provider=provider,
                    uid=uid,
                    is_active=True
                )

            if social_accounts.exists():
                social_account = social_accounts.first()
                user = social_account.user

                # Update existing social account
                flow.create_or_update_social_account(user, token_data, user_info)

            else:
                # Create new user
                user = cls._create_user_from_social_data(provider, user_info, user_type)

                # Create social account
                social_account = flow.create_or_update_social_account(user, token_data, user_info)

            # Sync user profile
            flow.sync_user_profile(user, social_account, user_info)

            # Mark attempt as successful
            attempt.mark_completed('success', social_account)

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return {
                'user': user,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'is_new_user': social_account is None or user is None,
                'social_account': social_account
            }

        except Exception as e:
            # Mark attempt as failed
            attempt.mark_completed('failed', error_message=str(e))
            logger.error(f"Social auth failed for {provider}: {str(e)}")
            raise

    @classmethod
    def _create_user_from_social_data(cls, provider, user_info, user_type=None):
        """Create new user from social platform data"""
        # Generate username
        username = f"{provider}_{user_info.get('openid', '')[:10]}_{uuid.uuid4().hex[:8]}"

        # Generate email if not provided
        email = user_info.get('email') or f"{username}@social.local"

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            user_type=user_type or 'freelancer',  # Default to freelancer
            user_status='active',
            is_email_verified=True,  # Social accounts are considered verified
        )

        # Create user profile
        profile = UserProfile.objects.create(user=user)

        # Set display name
        if 'nickname' in user_info:
            profile.first_name = user_info['nickname']
            profile.save()

        logger.info(f"Created new user {user.id} from {provider} social login")

        return user