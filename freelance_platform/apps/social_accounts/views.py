import json
import logging
import requests
from datetime import datetime, timedelta
from django.shortcuts import redirect
from django.contrib.auth import login
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse, HttpResponseBadRequest
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from social_core.exceptions import AuthException
from social_core.backends.oauth import BaseOAuth2
from social_django.utils import load_strategy, load_backend

from .models import (
    SocialAccount, SocialLoginAttempt, SocialUserRegistration,
    WeChatUserInfo, QQUserInfo
)
from .serializers import (
    SocialLoginSerializer, SocialAccountSerializer,
    SocialRegistrationSerializer, SocialAccountBindingSerializer,
    SocialUserInfoSerializer, SocialLoginCallbackSerializer,
    SocialTokenRefreshSerializer, UserSocialAccountsSerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)


class SocialLoginView(APIView):
    """社交登录视图"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SocialLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        provider = serializer.validated_data['provider']
        code = serializer.validated_data.get('code')
        access_token = serializer.validated_data.get('access_token')
        user_type = serializer.validated_data.get('user_type', 'client')
        social_info = serializer.validated_data.get('social_info', {})

        # 记录登录尝试
        login_attempt = SocialLoginAttempt.objects.create(
            provider=provider,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            social_info=social_info
        )

        try:
            # 执行社交登录
            result = self._process_social_login(
                provider, code, access_token, user_type,
                social_info, request, login_attempt
            )

            if result['success']:
                login_attempt.status = 'success'
                login_attempt.user = result['user']
                login_attempt.completed_at = datetime.now()
                login_attempt.save()

                return Response(result, status=status.HTTP_200_OK)
            else:
                login_attempt.status = 'failed'
                login_attempt.error_code = result.get('error_code')
                login_attempt.error_message = result.get('error_message')
                login_attempt.completed_at = datetime.now()
                login_attempt.save()

                return Response(result, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Social login error for {provider}: {str(e)}")
            login_attempt.status = 'failed'
            login_attempt.error_message = str(e)
            login_attempt.completed_at = datetime.now()
            login_attempt.save()

            return Response({
                'success': False,
                'error': '登录过程中发生错误',
                'error_code': 'INTERNAL_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _process_social_login(self, provider, code, access_token, user_type,
                            social_info, request, login_attempt):
        """处理社交登录逻辑"""
        try:
            # 加载社交认证后端
            strategy = load_strategy(request)
            backend = load_backend(
                strategy,
                f'social_core.backends.wechat.WeChatOAuth2' if provider == 'wechat'
                else f'social_core.backends.qq.QQOAuth2',
                redirect_uri=None
            )

            # 获取用户信息
            if code:
                # 使用授权码获取访问令牌
                token_data = backend.get_access_token(code)
                access_token = token_data.get('access_token')
            elif access_token:
                # 直接使用访问令牌
                pass
            else:
                return {
                    'success': False,
                    'error': '缺少必要的认证参数',
                    'error_code': 'MISSING_PARAMS'
                }

            # 获取用户信息
            user_data = backend.user_data(access_token)

            # 处理不同平台的用户信息
            if provider == 'wechat':
                social_uid = user_data.get('openid', '')
                unionid = user_data.get('unionid', '')
                social_nickname = user_data.get('nickname', '')
                social_avatar = user_data.get('headimgurl', '')

                # 创建或获取社交账号
                social_account, created = SocialAccount.objects.get_or_create(
                    provider=provider,
                    uid=social_uid,
                    defaults={
                        'openid': social_uid,
                        'unionid': unionid,
                        'social_nickname': social_nickname,
                        'social_avatar': social_avatar,
                        'access_token': access_token,
                        'is_verified': True
                    }
                )

                # 创建微信用户详细信息
                if created or not hasattr(social_account, 'wechat_info'):
                    WeChatUserInfo.objects.create(
                        social_account=social_account,
                        nickname=social_nickname,
                        avatar_url=social_avatar,
                        gender=user_data.get('sex'),
                        language=user_data.get('language'),
                        city=user_data.get('city'),
                        province=user_data.get('province'),
                        country=user_data.get('country'),
                        privilege=user_data.get('privilege', [])
                    )

            elif provider == 'qq':
                social_uid = user_data.get('openid', '')
                social_nickname = user_data.get('nickname', '')
                social_avatar = user_data.get('figureurl_qq_2', '')

                # 创建或获取社交账号
                social_account, created = SocialAccount.objects.get_or_create(
                    provider=provider,
                    uid=social_uid,
                    defaults={
                        'openid': social_uid,
                        'social_nickname': social_nickname,
                        'social_avatar': social_avatar,
                        'access_token': access_token,
                        'is_verified': True
                    }
                )

                # 创建QQ用户详细信息
                if created or not hasattr(social_account, 'qq_info'):
                    QQUserInfo.objects.create(
                        social_account=social_account,
                        nickname=social_nickname,
                        avatar_url=social_avatar,
                        gender=user_data.get('gender'),
                        province=user_data.get('province'),
                        city=user_data.get('city'),
                        year=user_data.get('year'),
                        is_vip=user_data.get('is_vip', False),
                        vip_level=user_data.get('vip_level', 0),
                        is_yellow_vip=user_data.get('is_yellow_vip', False),
                        yellow_vip_level=user_data.get('yellow_vip_level', 0),
                        is_yellow_year_vip=user_data.get('is_yellow_year_vip', False)
                    )

            # 更新登录信息
            social_account.last_login_at = datetime.now()
            social_account.login_count += 1
            social_account.access_token = access_token
            social_account.save()

            # 处理用户账号
            if not social_account.user:
                # 创建新用户
                user = self._create_social_user(
                    social_account, user_type, social_info
                )
            else:
                user = social_account.user

            # 登录用户
            login(request, user)

            # 生成JWT令牌
            refresh = RefreshToken.for_user(user)

            return {
                'success': True,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': user.get_user_type_display(),
                    'is_new_user': not social_account.user
                },
                'social_account': SocialAccountSerializer(social_account).data
            }

        except AuthException as e:
            return {
                'success': False,
                'error': f'社交认证失败: {str(e)}',
                'error_code': 'AUTH_FAILED'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'处理社交登录时发生错误: {str(e)}',
                'error_code': 'PROCESSING_ERROR'
            }

    def _create_social_user(self, social_account, user_type, social_info):
        """创建社交登录用户"""
        # 生成用户名
        username = f"{social_account.provider}_{social_account.uid}"
        if User.objects.filter(username=username).exists():
            username = f"{username}_{datetime.now().timestamp()}"

        # 创建用户
        user = User.objects.create_user(
            username=username,
            email=f"{username}@social.user",  # 临时邮箱，需要用户后续更新
            user_type=user_type,
            user_status='active',
            is_email_verified=False,
            is_phone_verified=False
        )

        # 创建用户资料
        from apps.accounts.models import UserProfile
        UserProfile.objects.create(
            user=user,
            first_name=social_account.social_nickname or '',
            avatar_url=social_account.social_avatar
        )

        # 关联社交账号
        social_account.user = user
        social_account.save()

        # 创建社交用户注册记录
        SocialUserRegistration.objects.create(
            social_account=social_account,
            selected_user_type=user_type,
            registration_status='social_login',
            current_step=1,
            total_steps=4
        )

        return user


class SocialAccountBindView(APIView):
    """绑定/解绑社交账号"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SocialAccountBindingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        provider = serializer.validated_data['provider']
        bind_type = serializer.validated_data['bind_type']
        code = serializer.validated_data.get('code')
        access_token = serializer.validated_data.get('access_token')

        try:
            if bind_type == 'bind':
                return self._bind_social_account(request.user, provider, code, access_token)
            else:
                return self._unbind_social_account(request.user, provider)

        except Exception as e:
            logger.error(f"Social account binding error: {str(e)}")
            return Response({
                'success': False,
                'error': '绑定操作失败'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _bind_social_account(self, user, provider, code, access_token):
        """绑定社交账号"""
        # 检查用户是否已经绑定了该平台的账号
        if SocialAccount.objects.filter(user=user, provider=provider).exists():
            return Response({
                'success': False,
                'error': f'您已经绑定了{provider}账号'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 获取社交账号信息
        social_info = self._get_social_info(provider, code, access_token)
        if not social_info:
            return Response({
                'success': False,
                'error': '获取社交账号信息失败'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 创建社交账号关联
        social_account = SocialAccount.objects.create(
            user=user,
            provider=provider,
            uid=social_info['uid'],
            openid=social_info.get('openid'),
            unionid=social_info.get('unionid'),
            social_nickname=social_info.get('nickname'),
            social_avatar=social_info.get('avatar'),
            access_token=access_token,
            is_verified=True
        )

        return Response({
            'success': True,
            'message': f'成功绑定{provider}账号',
            'social_account': SocialAccountSerializer(social_account).data
        })

    def _unbind_social_account(self, user, provider):
        """解绑社交账号"""
        try:
            social_account = SocialAccount.objects.get(user=user, provider=provider)
            social_account.delete()
            return Response({
                'success': True,
                'message': f'成功解绑{provider}账号'
            })
        except SocialAccount.DoesNotExist:
            return Response({
                'success': False,
                'error': f'未找到绑定的{provider}账号'
            }, status=status.HTTP_404_NOT_FOUND)

    def _get_social_info(self, provider, code, access_token):
        """获取社交账号信息"""
        # 这里应该调用相应的API获取用户信息
        # 为了简化，这里返回模拟数据
        return {
            'uid': f"mock_{provider}_uid",
            'nickname': f"Mock {provider} User",
            'avatar': "https://example.com/avatar.jpg"
        }


class UserSocialAccountsView(ListAPIView):
    """获取用户社交账号列表"""
    serializer_class = SocialAccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SocialAccount.objects.filter(user=self.request.user, is_active=True)


class SocialRegistrationCompleteView(APIView):
    """完成社交用户注册"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        # 获取用户的社交注册记录
        try:
            registration = SocialUserRegistration.objects.get(
                social_account__user=user
            )
        except SocialUserRegistration.DoesNotExist:
            return Response({
                'success': False,
                'error': '未找到社交注册记录'
            }, status=status.HTTP_404_NOT_FOUND)

        # �用户提供的信息
        email = request.data.get('email')
        phone = request.data.get('phone')
        nickname = request.data.get('nickname')

        # 更新用户信息
        if email and email != user.email:
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({
                    'success': False,
                    'error': '该邮箱已被其他用户使用'
                }, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
            user.is_email_verified = True
            registration.email_collected = True

        if phone:
            if User.objects.filter(phone_number=phone).exclude(id=user.id).exists():
                return Response({
                    'success': False,
                    'error': '该手机号已被其他用户使用'
                }, status=status.HTTP_400_BAD_REQUEST)
            user.phone_number = phone
            user.is_phone_verified = True
            registration.phone_collected = True

        if nickname:
            user.username = nickname
            registration.nickname_collected = True

        user.save()

        # 更新注册状态
        if registration.email_collected and registration.phone_collected:
            registration.registration_status = 'completed'
            registration.current_step = registration.total_steps
            registration.registration_completed_at = datetime.now()
        else:
            registration.current_step = min(registration.current_step + 1, registration.total_steps)

        registration.save()

        return Response({
            'success': True,
            'message': '注册信息更新成功',
            'registration': SocialRegistrationSerializer(registration).data
        })


class SocialTokenRefreshView(APIView):
    """刷新社交账号令牌"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SocialTokenRefreshSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        social_account_id = serializer.validated_data['social_account_id']
        refresh_token = serializer.validated_data['refresh_token']

        try:
            social_account = SocialAccount.objects.get(
                id=social_account_id,
                user=request.user
            )

            # 这里应该调用相应的API刷新令牌
            # 为了简化，这里只更新令牌过期时间
            social_account.token_expires_at = datetime.now() + timedelta(hours=2)
            social_account.save()

            return Response({
                'success': True,
                'message': '令牌刷新成功',
                'expires_at': social_account.token_expires_at
            })

        except SocialAccount.DoesNotExist:
            return Response({
                'success': False,
                'error': '社交账号不存在'
            }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def social_login_providers(request):
    """获取可用的社交登录平台"""
    enabled_providers = settings.SOCIAL_AUTH_ENABLED_PROVIDERS
    provider_info = {
        'wechat': {
            'name': '微信',
            'description': '使用微信账号登录',
            'icon': '/static/icons/wechat.svg',
            'enabled': 'wechat' in enabled_providers
        },
        'qq': {
            'name': 'QQ',
            'description': '使用QQ账号登录',
            'icon': '/static/icons/qq.svg',
            'enabled': 'qq' in enabled_providers
        }
    }

    return Response({
        'providers': provider_info,
        'enabled_count': len(enabled_providers)
    })


@method_decorator(csrf_exempt, name='dispatch')
class SocialLoginCallbackView(APIView):
    """社交登录回调处理"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        serializer = SocialLoginCallbackSerializer(data=request.GET)
        if not serializer.is_valid():
            return HttpResponseBadRequest(serializer.errors)

        provider = serializer.validated_data['provider']
        code = serializer.validated_data['code']
        state = serializer.validated_data.get('state')

        # 重定向到前端，携带授权码
        redirect_url = f"https://yourdomain.com/auth/callback/{provider}/?code={code}"
        if state:
            redirect_url += f"&state={state}"

        return redirect(redirect_url)

    def post(self, request):
        """处理前端回调提交"""
        serializer = SocialLoginCallbackSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        provider = serializer.validated_data['provider']
        code = serializer.validated_data['code']

        # 调用社交登录处理
        login_data = {
            'provider': provider,
            'code': code,
            'user_type': 'client'  # 默认为客户端
        }

        # 创建社交登录请求
        social_login_view = SocialLoginView()
        return social_login_view.post(request)
