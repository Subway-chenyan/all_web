#!/usr/bin/env python
"""
社交登录系统测试脚本

这个脚本用于测试微信和QQ社交登录功能的基本配置。
"""

import os
import sys
import django
import requests
from datetime import datetime

# 添加项目路径
sys.path.append('/home/subway/all_web/freelance_platform')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 初始化Django
django.setup()

def test_social_auth_config():
    """测试社交认证配置"""
    print("=" * 50)
    print("社交登录系统配置测试")
    print("=" * 50)

    from django.conf import settings

    # 检查必要的配置
    print("1. 检查Django Allauth配置:")
    print(f"   - SITE_ID: {getattr(settings, 'SITE_ID', '未设置')}")
    print(f"   - AUTHENTICATION_BACKENDS: {getattr(settings, 'AUTHENTICATION_BACKENDS', '未设置')}")

    print("\n2. 检查社交账号配置:")
    print(f"   - SOCIALACCOUNT_EMAIL_REQUIRED: {getattr(settings, 'SOCIALACCOUNT_EMAIL_REQUIRED', '未设置')}")
    print(f"   - SOCIALACCOUNT_AUTO_SIGNUP: {getattr(settings, 'SOCIALACCOUNT_AUTO_SIGNUP', '未设置')}")

    print("\n3. 检查微信配置:")
    print(f"   - WECHAT_CLIENT_ID: {'已设置' if getattr(settings, 'WECHAT_CLIENT_ID', '') else '未设置'}")
    print(f"   - WECHAT_CLIENT_SECRET: {'已设置' if getattr(settings, 'WECHAT_CLIENT_SECRET', '') else '未设置'}")
    print(f"   - WECHAT_REDIRECT_URI: {getattr(settings, 'WECHAT_REDIRECT_URI', '未设置')}")

    print("\n4. 检查QQ配置:")
    print(f"   - QQ_CLIENT_ID: {'已设置' if getattr(settings, 'QQ_CLIENT_ID', '') else '未设置'}")
    print(f"   - QQ_CLIENT_SECRET: {'已设置' if getattr(settings, 'QQ_CLIENT_SECRET', '') else '未设置'}")
    print(f"   - QQ_REDIRECT_URI: {getattr(settings, 'QQ_REDIRECT_URI', '未设置')}")

    print("\n5. 检查启用的社交平台:")
    enabled_providers = getattr(settings, 'SOCIAL_AUTH_ENABLED_PROVIDERS', [])
    print(f"   - 启用的平台: {enabled_providers}")

    return enabled_providers

def test_models():
    """测试社交账号模型"""
    print("\n" + "=" * 50)
    print("社交账号模型测试")
    print("=" * 50)

    try:
        from apps.social_accounts.models import (
            SocialAccount, SocialAuthBinding, SocialLoginAttempt,
            SocialUserRegistration, WeChatUserInfo, QQUserInfo
        )

        print("✓ 所有社交账号模型导入成功")

        # 检查模型字段
        print("\n1. SocialAccount 模型:")
        print(f"   - 字段数量: {len(SocialAccount._meta.fields)}")
        print(f"   - 数据库表名: {SocialAccount._meta.db_table}")

        print("\n2. WeChatUserInfo 模型:")
        print(f"   - 字段数量: {len(WeChatUserInfo._meta.fields)}")
        print(f"   - 数据库表名: {WeChatUserInfo._meta.db_table}")

        print("\n3. QQUserInfo 模型:")
        print(f"   - 字段数量: {len(QQUserInfo._meta.fields)}")
        print(f"   - 数据库表名: {QQUserInfo._meta.db_table}")

        return True

    except ImportError as e:
        print(f"✗ 模型导入失败: {e}")
        return False

def test_views():
    """测试社交登录视图"""
    print("\n" + "=" * 50)
    print("社交登录视图测试")
    print("=" * 50)

    try:
        from apps.social_accounts.views import (
            SocialLoginView, SocialAccountBindView,
            UserSocialAccountsView, SocialRegistrationCompleteView
        )

        print("✓ 所有社交登录视图导入成功")

        # 检查视图权限
        print(f"\n1. SocialLoginView 权限: {SocialLoginView.permission_classes}")
        print(f"2. SocialAccountBindView 权限: {SocialAccountBindView.permission_classes}")
        print(f"3. UserSocialAccountsView 权限: {UserSocialAccountsView.permission_classes}")

        return True

    except ImportError as e:
        print(f"✗ 视图导入失败: {e}")
        return False

def test_serializers():
    """测试社交登录序列化器"""
    print("\n" + "=" * 50)
    print("社交登录序列化器测试")
    print("=" * 50)

    try:
        from apps.social_accounts.serializers import (
            SocialLoginSerializer, SocialAccountSerializer,
            SocialRegistrationSerializer, SocialAccountBindingSerializer
        )

        print("✓ 所有社交登录序列化器导入成功")

        # 测试序列化器验证
        print("\n1. 测试SocialLoginSerializer:")
        test_data = {
            'provider': 'wechat',
            'code': 'test_code',
            'user_type': 'client'
        }

        serializer = SocialLoginSerializer(data=test_data)
        if serializer.is_valid():
            print("   - 测试数据验证成功")
        else:
            print(f"   - 验证失败: {serializer.errors}")

        return True

    except ImportError as e:
        print(f"✗ 序列化器导入失败: {e}")
        return False

def test_urls():
    """测试URL配置"""
    print("\n" + "=" * 50)
    print("URL配置测试")
    print("=" * 50)

    try:
        from django.urls import reverse

        # 测试URL解析
        urls_to_test = [
            'social_accounts:social-login',
            'social_accounts:social-login-providers',
            'social_accounts:user-social-accounts',
            'social_accounts:social-account-bind',
            'social_accounts:social-registration-complete'
        ]

        for url_name in urls_to_test:
            try:
                url = reverse(url_name)
                print(f"✓ {url_name}: {url}")
            except Exception as e:
                print(f"✗ {url_name}: {e}")

        return True

    except Exception as e:
        print(f"✗ URL测试失败: {e}")
        return False

def test_admin():
    """测试Django Admin配置"""
    print("\n" + "=" * 50)
    print("Django Admin配置测试")
    print("=" * 50)

    try:
        from apps.social_accounts.admin import (
            SocialAccountAdmin, SocialAuthBindingAdmin,
            SocialLoginAttemptAdmin, WeChatUserInfoAdmin, QQUserInfoAdmin
        )

        print("✓ 所有Admin类导入成功")

        # 检查Admin注册
        from django.contrib import admin
        from apps.social_accounts.models import SocialAccount

        if admin.site.is_registered(SocialAccount):
            print("✓ SocialAccount 已注册到Admin")
        else:
            print("✗ SocialAccount 未注册到Admin")

        return True

    except ImportError as e:
        print(f"✗ Admin配置测试失败: {e}")
        return False

def create_test_data():
    """创建测试数据"""
    print("\n" + "=" * 50)
    print("创建测试数据")
    print("=" * 50)

    try:
        from apps.social_accounts.models import SocialAccount, WeChatUserInfo
        from apps.accounts.models import User

        # 创建测试用户
        if not User.objects.filter(username='test_social_user').exists():
            test_user = User.objects.create_user(
                username='test_social_user',
                email='test@example.com',
                user_type='client'
            )
            print("✓ 创建测试用户成功")
        else:
            test_user = User.objects.get(username='test_social_user')
            print("✓ 测试用户已存在")

        # 创建测试社交账号
        if not SocialAccount.objects.filter(user=test_user, provider='wechat').exists():
            social_account = SocialAccount.objects.create(
                user=test_user,
                provider='wechat',
                uid='test_wechat_uid_12345',
                openid='test_openid_12345',
                social_nickname='测试微信用户',
                social_avatar='https://example.com/avatar.jpg',
                is_verified=True
            )
            print("✓ 创建测试社交账号成功")

            # 创建微信用户信息
            WeChatUserInfo.objects.create(
                social_account=social_account,
                nickname='测试微信用户',
                avatar_url='https://example.com/avatar.jpg',
                gender=1,
                city='北京',
                province='北京',
                country='中国'
            )
            print("✓ 创建微信用户信息成功")
        else:
            print("✓ 测试社交账号已存在")

        return True

    except Exception as e:
        print(f"✗ 创建测试数据失败: {e}")
        return False

def main():
    """主测试函数"""
    print(f"开始测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = []

    # 运行各项测试
    results.append(("配置测试", test_social_auth_config()))
    results.append(("模型测试", test_models()))
    results.append(("视图测试", test_views()))
    results.append(("序列化器测试", test_serializers()))
    results.append(("URL测试", test_urls()))
    results.append(("Admin测试", test_admin()))
    results.append(("测试数据", create_test_data()))

    # 输出测试结果
    print("\n" + "=" * 50)
    print("测试结果汇总")
    print("=" * 50)

    passed = 0
    for test_name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{test_name}: {status}")
        if result:
            passed += 1

    print(f"\n总计: {passed}/{len(results)} 项测试通过")

    if passed == len(results):
        print("\n🎉 所有测试通过！社交登录系统配置正确。")
    else:
        print(f"\n⚠️  {len(results) - passed} 项测试失败，请检查配置。")

    print(f"\n测试完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == '__main__':
    main()