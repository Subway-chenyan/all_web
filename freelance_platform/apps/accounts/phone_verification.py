"""
Phone number verification for Chinese users
Integrates with Chinese SMS providers for social login phone verification
"""
import logging
import random
import requests
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import User

logger = logging.getLogger(__name__)


class ChineseSMSProvider:
    """Base class for Chinese SMS providers"""

    def __init__(self):
        self.access_key = getattr(settings, 'SMS_ACCESS_KEY', '')
        self.secret_key = getattr(settings, 'SMS_SECRET_KEY', '')
        self.sign_name = getattr(settings, 'SMS_SIGN_NAME', ' freelancing platform')

    def send_verification_code(self, phone_number, code, template_id=None):
        """Send SMS verification code"""
        raise NotImplementedError

    def verify_response(self, response):
        """Verify SMS provider response"""
        raise NotImplementedError


class AliyunSMSProvider(ChineseSMSProvider):
    """Alibaba Cloud SMS provider"""

    def __init__(self):
        super().__init__()
        self.region_id = getattr(settings, 'SMS_REGION_ID', 'cn-hangzhou')
        self.endpoint = f"https://dysmsapi.aliyuncs.com/"

    def send_verification_code(self, phone_number, code, template_id=None):
        """Send verification code via Aliyun SMS"""
        template_id = template_id or getattr(settings, 'SMS_VERIFICATION_TEMPLATE_ID', 'SMS_12345678')

        # This is a simplified implementation
        # In production, use the official Aliyun SDK
        params = {
            'PhoneNumbers': phone_number,
            'SignName': self.sign_name,
            'TemplateCode': template_id,
            'TemplateParam': f'{{"code": "{code}"}}',
            'AccessKeyId': self.access_key,
            'Action': 'SendSms',
            'Format': 'JSON',
            'Version': '2017-05-25',
            'RegionId': self.region_id,
            'Timestamp': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
        }

        try:
            response = requests.post(self.endpoint, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if data.get('Code') == 'OK':
                return True, data.get('BizId', '')
            else:
                error_msg = data.get('Message', 'Unknown error')
                logger.error(f"Aliyun SMS failed: {error_msg}")
                return False, error_msg

        except Exception as e:
            logger.error(f"Aliyun SMS request failed: {str(e)}")
            return False, str(e)


class TencentSMSProvider(ChineseSMSProvider):
    """Tencent Cloud SMS provider"""

    def __init__(self):
        super().__init__()
        self.app_id = getattr(settings, 'SMS_APP_ID', '')
        self.sdk_app_id = getattr(settings, 'SMS_SDK_APP_ID', '')

    def send_verification_code(self, phone_number, code, template_id=None):
        """Send verification code via Tencent Cloud SMS"""
        template_id = template_id or getattr(settings, 'SMS_VERIFICATION_TEMPLATE_ID', '123456')

        # Simplified implementation - use official SDK in production
        params = {
            'PhoneNumberSet': [f"+86{phone_number}"],
            'SmsSdkAppId': self.sdk_app_id,
            'SignName': self.sign_name,
            'TemplateId': template_id,
            'TemplateParamSet': [code],
        }

        try:
            # Implementation would use Tencent Cloud SDK
            # This is a placeholder for demonstration
            logger.info(f"Sending SMS to {phone_number} with code {code}")
            return True, 'success'

        except Exception as e:
            logger.error(f"Tencent SMS failed: {str(e)}")
            return False, str(e)


class PhoneVerificationService:
    """Phone verification service for Chinese users"""

    def __init__(self):
        self.provider = self._get_sms_provider()
        self.code_length = 6
        self.code_expire_minutes = 5
        self.max_attempts_per_day = 10
        self.max_attempts_per_hour = 3

    def _get_sms_provider(self):
        """Get configured SMS provider"""
        provider_name = getattr(settings, 'SMS_PROVIDER', 'aliyun').lower()

        if provider_name == 'aliyun':
            return AliyunSMSProvider()
        elif provider_name == 'tencent':
            return TencentSMSProvider()
        else:
            raise ValueError(f"Unsupported SMS provider: {provider_name}")

    def _generate_verification_code(self):
        """Generate 6-digit verification code"""
        return ''.join([str(random.randint(0, 9)) for _ in range(self.code_length)])

    def _validate_chinese_phone(self, phone_number):
        """Validate Chinese phone number format"""
        import re
        pattern = r'^1[3-9]\d{9}$'
        return re.match(pattern, phone_number) is not None

    def _check_rate_limits(self, phone_number):
        """Check rate limits for SMS sending"""
        daily_key = f"sms_daily:{phone_number}"
        hourly_key = f"sms_hourly:{phone_number}"

        daily_count = cache.get(daily_key, 0)
        hourly_count = cache.get(hourly_key, 0)

        if daily_count >= self.max_attempts_per_day:
            raise ValidationError(
                f"Daily SMS limit exceeded. Maximum {self.max_attempts_per_day} messages per day."
            )

        if hourly_count >= self.max_attempts_per_hour:
            raise ValidationError(
                f"Hourly SMS limit exceeded. Please wait before requesting another code."
            )

        return daily_count, hourly_count

    def _increment_rate_limits(self, phone_number, daily_count, hourly_count):
        """Increment rate limit counters"""
        daily_key = f"sms_daily:{phone_number}"
        hourly_key = f"sms_hourly:{phone_number}"

        # Set daily counter (expires at end of day)
        tomorrow_midnight = timezone.now().replace(
            hour=0, minute=0, second=0, microsecond=0
        ) + timedelta(days=1)
        cache.set(daily_key, daily_count + 1, timeout=(tomorrow_midnight - timezone.now()).seconds)

        # Set hourly counter (expires in 1 hour)
        cache.set(hourly_key, hourly_count + 1, timeout=3600)

    def send_verification_code(self, phone_number, purpose='registration'):
        """
        Send SMS verification code

        Args:
            phone_number: Chinese mobile number
            purpose: Purpose of verification (registration, login, etc.)
        """
        # Validate phone number
        if not self._validate_chinese_phone(phone_number):
            raise ValidationError("Invalid Chinese phone number format")

        # Check rate limits
        daily_count, hourly_count = self._check_rate_limits(phone_number)

        # Generate verification code
        code = self._generate_verification_code()
        cache_key = f"phone_verification:{phone_number}:{purpose}"

        # Store code in cache with expiration
        cache_data = {
            'code': code,
            'phone': phone_number,
            'purpose': purpose,
            'created_at': timezone.now().isoformat(),
            'attempts': 0
        }
        cache.set(cache_key, cache_data, timeout=self.code_expire_minutes * 60)

        # Send SMS
        success, result = self.provider.send_verification_code(phone_number, code)

        if success:
            # Increment rate limits on success
            self._increment_rate_limits(phone_number, daily_count, hourly_count)
            logger.info(f"Verification code sent to {phone_number} for {purpose}")
            return True, "Verification code sent successfully"
        else:
            # Remove cached code on failure
            cache.delete(cache_key)
            logger.error(f"Failed to send SMS to {phone_number}: {result}")
            return False, f"Failed to send verification code: {result}"

    def verify_code(self, phone_number, code, purpose='registration'):
        """
        Verify SMS verification code

        Args:
            phone_number: Chinese mobile number
            code: Verification code provided by user
            purpose: Purpose of verification
        """
        cache_key = f"phone_verification:{phone_number}:{purpose}"
        cached_data = cache.get(cache_key)

        if not cached_data:
            raise ValidationError("Verification code has expired or was not requested")

        # Check attempts
        if cached_data.get('attempts', 0) >= 3:
            cache.delete(cache_key)
            raise ValidationError("Too many verification attempts. Please request a new code.")

        # Check code
        if cached_data['code'] != code:
            # Increment attempts
            cached_data['attempts'] += 1
            cache.set(cache_key, cached_data, timeout=300)  # 5 minutes
            raise ValidationError("Invalid verification code")

        # Code is correct - remove from cache
        cache.delete(cache_key)

        # Mark phone as verified in user model if user exists
        try:
            user = User.objects.get(phone_number=phone_number)
            user.is_phone_verified = True
            user.save()
            logger.info(f"Phone {phone_number} verified for user {user.id}")
        except User.DoesNotExist:
            # User doesn't exist yet, that's okay for registration flow
            pass

        return True, "Phone number verified successfully"

    def verify_phone_for_social_login(self, phone_number, code, user_data):
        """
        Verify phone number during social login

        Args:
            phone_number: Chinese mobile number
            code: Verification code
            user_data: User data from social platform
        """
        try:
            # Verify the code
            success, message = self.verify_code(phone_number, code, purpose='social_login')
            if not success:
                return False, message

            # Update or create user with verified phone
            user, created = User.objects.update_or_create(
                email=user_data.get('email'),
                defaults={
                    'username': user_data.get('username', f"social_{phone_number}"),
                    'phone_number': phone_number,
                    'is_phone_verified': True,
                    'user_type': user_data.get('user_type', 'freelancer'),
                    'user_status': 'active',
                    'is_email_verified': True,  # Social login counts as verified
                }
            )

            if created:
                logger.info(f"New user {user.id} created via social login with phone {phone_number}")
            else:
                logger.info(f"Existing user {user.id} phone verified via social login")

            return True, user

        except Exception as e:
            logger.error(f"Phone verification for social login failed: {str(e)}")
            return False, str(e)


class PhoneVerificationFlow:
    """High-level phone verification flow for social login"""

    def __init__(self):
        self.service = PhoneVerificationService()

    def start_verification(self, phone_number, social_user_data):
        """Start phone verification process for social login"""
        try:
            # Send verification code
            success, message = self.service.send_verification_code(
                phone_number, purpose='social_login'
            )

            if success:
                # Store social data temporarily for later use
                temp_data_key = f"social_temp_data:{phone_number}"
                cache.set(temp_data_key, social_user_data, timeout=600)  # 10 minutes

                return True, {
                    'message': 'Verification code sent successfully',
                    'expires_in': 300,  # 5 minutes
                    'phone_number': phone_number
                }
            else:
                return False, message

        except Exception as e:
            logger.error(f"Start phone verification failed: {str(e)}")
            return False, str(e)

    def complete_verification(self, phone_number, code):
        """Complete phone verification and create/update user"""
        try:
            # Get stored social data
            temp_data_key = f"social_temp_data:{phone_number}"
            social_data = cache.get(temp_data_key)

            if not social_data:
                return False, "Social login session expired. Please restart the process."

            # Verify phone and create/update user
            success, result = self.service.verify_phone_for_social_login(
                phone_number, code, social_data
            )

            # Clean up temporary data
            cache.delete(temp_data_key)

            if success:
                return True, {
                    'user': result,
                    'message': 'Phone verification completed successfully'
                }
            else:
                return False, result

        except Exception as e:
            logger.error(f"Complete phone verification failed: {str(e)}")
            return False, str(e)