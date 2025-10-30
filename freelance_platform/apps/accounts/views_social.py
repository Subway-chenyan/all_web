"""
Social authentication API views
"""
import logging
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models_social import SocialAccount, SocialLoginAttempt, SocialProvider
from .serializers_social import (
    SocialAuthStartSerializer,
    SocialAuthCompleteSerializer,
    SocialAccountSerializer,
    UserSocialProfileSerializer
)
from .social_auth_flows import SocialAuthManager
from .models import UserProfile

logger = logging.getLogger(__name__)
User = get_user_model()


class SocialAuthStartView(GenericAPIView):
    """
    Start social authentication process
    Returns authorization URL and state parameter
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = SocialAuthStartSerializer

    @extend_schema(
        summary="Start social authentication",
        description="Initialize social authentication for WeChat or QQ. Returns authorization URL.",
        responses={
            200: {
                "type": "object",
                "properties": {
                    "attempt_id": {"type": "string"},
                    "state": {"type": "string"},
                    "auth_url": {"type": "string"},
                    "expires_in": {"type": "integer"}
                }
            }
        }
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        provider = serializer.validated_data['provider']
        redirect_url = serializer.validated_data.get('redirect_url')

        try:
            # Get client IP and user agent
            ip_address = self._get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')

            # Start social authentication
            result = SocialAuthManager.start_social_auth(
                provider=provider,
                ip_address=ip_address,
                user_agent=user_agent
            )

            # Modify redirect URL if provided
            if redirect_url and result['auth_url']:
                # Append custom redirect URL as parameter
                separator = '&' if '?' in result['auth_url'] else '?'
                result['auth_url'] += f"{separator}redirect_url={redirect_url}"

            return Response({
                'success': True,
                'data': {
                    'attempt_id': result['attempt_id'],
                    'state': result['state'],
                    'auth_url': result['auth_url'],
                    'expires_in': 600,  # 10 minutes
                    'provider': provider
                }
            })

        except Exception as e:
            logger.error(f"Social auth start failed for {provider}: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to start social authentication',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_400_BAD_REQUEST)

    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SocialAuthCallbackView(GenericAPIView):
    """
    Handle social authentication callback
    This endpoint is called by the frontend after redirect from social platform
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = SocialAuthCompleteSerializer

    @extend_schema(
        summary="Complete social authentication",
        description="Complete social authentication process after redirect from social platform.",
        parameters=[
            OpenApiParameter(
                name='code',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Authorization code from social platform'
            ),
            OpenApiParameter(
                name='state',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='State parameter for CSRF protection'
            )
        ],
        responses={
            200: {
                "type": "object",
                "properties": {
                    "access_token": {"type": "string"},
                    "refresh_token": {"type": "string"},
                    "user": {"type": "object"},
                    "is_new_user": {"type": "boolean"}
                }
            }
        }
    )
    def post(self, request):
        """
        Handle social authentication callback
        Expects: { code, state, user_type? }
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code']
        state = serializer.validated_data['state']
        user_type = serializer.validated_data.get('user_type')

        # Get client IP
        ip_address = self._get_client_ip(request)

        try:
            # Find the login attempt to get provider
            try:
                attempt = SocialLoginAttempt.objects.get(
                    state=state,
                    status='pending'
                )
                provider = attempt.provider
            except SocialLoginAttempt.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid or expired authentication session'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Complete social authentication
            result = SocialAuthManager.complete_social_auth(
                provider=provider,
                code=code,
                state=state,
                user_type=user_type,
                ip_address=ip_address
            )

            user = result['user']
            social_account = result['social_account']

            # Prepare response data
            response_data = {
                'access_token': result['access_token'],
                'refresh_token': result['refresh_token'],
                'token_type': 'Bearer',
                'expires_in': getattr(settings, 'SIMPLE_JWT', {}).get('ACCESS_TOKEN_LIFETIME', 3600),
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'user_type': user.user_type,
                    'user_status': user.user_status,
                    'is_email_verified': user.is_email_verified,
                    'is_phone_verified': user.is_phone_verified,
                    'profile_completion_percentage': user.profile_completion_percentage,
                },
                'is_new_user': result['is_new_user'],
                'social_account': {
                    'provider': social_account.provider,
                    'uid': social_account.uid,
                    'created_at': social_account.created_at,
                } if social_account else None
            }

            # Add profile information if exists
            try:
                profile = UserProfile.objects.get(user=user)
                response_data['user'].update({
                    'first_name': profile.first_name,
                    'last_name': profile.last_name,
                    'bio': profile.bio,
                    'avatar': profile.avatar.url if profile.avatar else None,
                    'country': profile.country,
                    'province': profile.province,
                    'city': profile.city,
                })
            except UserProfile.DoesNotExist:
                pass

            return Response({
                'success': True,
                'data': response_data
            })

        except ValueError as e:
            logger.error(f"Social auth validation error: {str(e)}")
            return Response({
                'success': False,
                'error': 'Authentication failed',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Social auth completion failed: {str(e)}")
            return Response({
                'success': False,
                'error': 'Authentication failed',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SocialAccountListView(APIView):
    """
    List connected social accounts for authenticated user
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="List connected social accounts",
        description="Get list of all connected social accounts for the authenticated user.",
        responses={
            200: SocialAccountSerializer(many=True)
        }
    )
    def get(self, request):
        """List user's connected social accounts"""
        social_accounts = SocialAccount.objects.filter(
            user=request.user,
            is_active=True
        ).order_by('-created_at')

        serializer = SocialAccountSerializer(social_accounts, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class SocialAccountDisconnectView(APIView):
    """
    Disconnect a social account
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Disconnect social account",
        description="Disconnect and remove a social account from the user's account.",
        parameters=[
            OpenApiParameter(
                name='provider',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description='Social provider (wechat, qq)'
            )
        ]
    )
    def delete(self, request, provider):
        """Disconnect a social account"""
        try:
            # Validate provider
            if provider not in [p.value for p in SocialProvider]:
                return Response({
                    'success': False,
                    'error': 'Invalid provider'
                }, status=status.HTTP_400_BAD_REQUEST)

            social_account = SocialAccount.objects.get(
                user=request.user,
                provider=provider,
                is_active=True
            )

            # Check if user has other login methods
            if not request.user.has_usable_password() and SocialAccount.objects.filter(
                user=request.user,
                is_active=True
            ).count() <= 1:
                return Response({
                    'success': False,
                    'error': 'Cannot disconnect the only login method. Please set a password first.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Soft delete the social account
            social_account.is_active = False
            social_account.save()

            return Response({
                'success': True,
                'message': 'Social account disconnected successfully'
            })

        except SocialAccount.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Social account not found'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Social account disconnect failed: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to disconnect social account'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SocialProfileSyncView(APIView):
    """
    Sync profile data from social platform
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Sync social profile data",
        description="Manually sync profile data from connected social platform.",
        parameters=[
            OpenApiParameter(
                name='provider',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description='Social provider (wechat, qq)'
            )
        ]
    )
    def post(self, request, provider):
        """Sync profile data from social platform"""
        try:
            # Validate provider
            if provider not in [p.value for p in SocialProvider]:
                return Response({
                    'success': False,
                    'error': 'Invalid provider'
                }, status=status.HTTP_400_BAD_REQUEST)

            social_account = SocialAccount.objects.get(
                user=request.user,
                provider=provider,
                is_active=True
            )

            # Check if token is valid
            if social_account.is_token_expired:
                return Response({
                    'success': False,
                    'error': 'Social account token expired. Please reconnect.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Use the appropriate flow to sync profile
            flow = SocialAuthManager.get_flow(provider)
            user_info = flow.get_user_info(
                social_account.access_token,
                social_account.openid
            )

            # Update social account and sync profile
            flow.create_or_update_social_account(request.user, {
                'access_token': social_account.access_token,
                'refresh_token': social_account.refresh_token,
            }, user_info)

            flow.sync_user_profile(request.user, social_account, user_info)

            return Response({
                'success': True,
                'message': 'Profile synced successfully'
            })

        except SocialAccount.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Social account not found'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Social profile sync failed: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to sync profile data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Function-based views for flexibility
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def social_providers_view(request):
    """
    Get list of available social authentication providers
    """
    providers = [
        {
            'provider': provider.value,
            'name': provider.label,
            'enabled': True,
            'icon': f'/static/icons/{provider.value}.svg',
        }
        for provider in SocialProvider
    ]

    return Response({
        'success': True,
        'data': providers
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def link_social_account_view(request):
    """
    Link a new social account to existing user
    """
    serializer = SocialAuthStartSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    provider = serializer.validated_data['provider']

    try:
        # Start authentication flow for linking
        result = SocialAuthManager.start_social_auth(
            provider=provider,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Mark this as a linking attempt
        attempt = SocialLoginAttempt.objects.get(attempt_id=result['attempt_id'])
        attempt.user = request.user
        attempt.save()

        return Response({
            'success': True,
            'data': {
                'attempt_id': result['attempt_id'],
                'state': result['state'],
                'auth_url': result['auth_url'],
                'expires_in': 600,
                'is_linking': True
            }
        })

    except Exception as e:
        logger.error(f"Social account linking failed for {provider}: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to start social account linking'
        }, status=status.HTTP_400_BAD_REQUEST)