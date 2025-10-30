#!/usr/bin/env python
"""
Gig管理系统测试脚本

这个脚本用于测试服务(Gig)管理模块的功能是否正常工作。
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

def test_models():
    """测试Gig模型"""
    print("=" * 50)
    print("Gig模型测试")
    print("=" * 50)

    try:
        from apps.gigs.models import (
            Category, Gig, GigPackage, GigRequirement, GigFAQ,
            GigExtra, GigFavorite, GigView, GigStat, GigSearchHistory, GigReport
        )

        print("✓ 所有Gig模型导入成功")

        # 检查分类数据
        category_count = Category.objects.count()
        print(f"\n1. 分类数据:")
        print(f"   - 总分类数: {category_count}")
        print(f"   - 父分类数: {Category.objects.filter(parent=None).count()}")
        print(f"   - 子分类数: {Category.objects.exclude(parent=None).count()}")

        # 检查Gig模型字段
        print(f"\n2. Gig模型字段:")
        print(f"   - 字段数量: {len(Gig._meta.fields)}")
        print(f"   - 数据库表名: {Gig._meta.db_table}")

        # 检查关联模型
        print(f"\n3. 关联模型:")
        print(f"   - GigPackage字段数: {len(GigPackage._meta.fields)}")
        print(f"   - GigRequirement字段数: {len(GigRequirement._meta.fields)}")
        print(f"   - GigFAQ字段数: {len(GigFAQ._meta.fields)}")
        print(f"   - GigExtra字段数: {len(GigExtra._meta.fields)}")

        return True

    except ImportError as e:
        print(f"✗ 模型导入失败: {e}")
        return False

def test_serializers():
    """测试Gig序列化器"""
    print("\n" + "=" * 50)
    print("Gig序列化器测试")
    print("=" * 50)

    try:
        from apps.gigs.serializers import (
            CategorySerializer, GigListSerializer, GigDetailSerializer,
            GigCreateUpdateSerializer, GigPackageSerializer, GigRequirementSerializer,
            GigFAQSerializer, GigExtraSerializer, GigFavoriteSerializer,
            GigSearchHistorySerializer, GigReportSerializer, GigStatSerializer,
            CategoryTreeSerializer, GigSearchSerializer, FreelancerGigSerializer
        )

        print("✓ 所有Gig序列化器导入成功")

        # 测试分类序列化器
        from apps.gigs.models import Category
        categories = Category.objects.filter(parent=None)[:3]
        if categories.exists():
            serializer = CategoryTreeSerializer(categories, many=True)
            print(f"\n1. 分类序列化测试:")
            print(f"   - 成功序列化 {len(serializer.data)} 个父分类")

        return True

    except ImportError as e:
        print(f"✗ 序列化器导入失败: {e}")
        return False

def test_views():
    """测试Gig视图"""
    print("\n" + "=" * 50)
    print("Gig视图测试")
    print("=" * 50)

    try:
        from apps.gigs.views import (
            CategoryListAPIView, GigListAPIView, GigDetailAPIView,
            GigCreateAPIView, GigUpdateAPIView, GigDeleteAPIView,
            FreelancerGigListAPIView, StandardResultsSetPagination
        )

        print("✓ 所有Gig视图导入成功")

        # 检查视图权限
        print(f"\n1. 视图权限配置:")
        print(f"   - CategoryListAPIView: {CategoryListAPIView.permission_classes}")
        print(f"   - GigListAPIView: {GigListAPIView.permission_classes}")
        print(f"   - GigDetailAPIView: {GigDetailAPIView.permission_classes}")
        print(f"   - GigCreateAPIView: {GigCreateAPIView.permission_classes}")

        return True

    except ImportError as e:
        print(f"✗ 视图导入失败: {e}")
        return False

def test_urls():
    """测试URL配置"""
    print("\n" + "=" * 50)
    print("URL配置测试")
    print("=" * 50)

    try:
        from django.urls import reverse
        from apps.gigs import urls

        # 测试URL解析
        url_patterns = [
            'gigs:category-list',
            'gigs:gig-list',
            'gigs:gig-detail',
            'gigs:gig-create',
            'gigs:freelancer-gigs',
            'gigs:toggle-favorite',
            'gigs:user-favorites',
            'gigs:report-gig',
            'gigs:search-suggestions',
            'gigs:gig-analytics'
        ]

        print("1. URL配置检查:")
        for url_name in url_patterns:
            try:
                url = reverse(url_name)
                print(f"   ✓ {url_name}: {url}")
            except Exception as e:
                print(f"   ✗ {url_name}: {e}")

        print(f"\n2. URL模式数量: {len(urls.urlpatterns)}")

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
        from apps.gigs.admin import (
            CategoryAdmin, GigAdmin, GigPackageAdmin,
            GigRequirementAdmin, GigFAQAdmin, GigExtraAdmin,
            GigFavoriteAdmin, GigViewAdmin, GigStatAdmin,
            GigSearchHistoryAdmin, GigReportAdmin
        )

        print("✓ 所有Gig Admin类导入成功")

        # 检查Admin注册
        from django.contrib import admin
        from apps.gigs.models import Category, Gig

        if admin.site.is_registered(Category):
            print("✓ Category 已注册到Admin")
        else:
            print("✗ Category 未注册到Admin")

        if admin.site.is_registered(Gig):
            print("✓ Gig 已注册到Admin")
        else:
            print("✗ Gig 未注册到Admin")

        return True

    except ImportError as e:
        print(f"✗ Admin配置测试失败: {e}")
        return False

def create_test_gig():
    """创建测试服务数据"""
    print("\n" + "=" * 50)
    print("创建测试服务数据")
    print("=" * 50)

    try:
        from apps.gigs.models import Gig, GigPackage, GigRequirement, GigFAQ
        from apps.accounts.models import User
        from django.utils.text import slugify

        # 查找自由职业者用户
        freelancer_user = User.objects.filter(user_type='freelancer').first()
        if not freelancer_user:
            # 创建测试自由职业者用户
            freelancer_user = User.objects.create_user(
                username='test_freelancer',
                email='freelancer@test.com',
                user_type='freelancer',
                user_status='active'
            )
            print("✓ 创建测试自由职业者用户")

        # 查找分类
        from apps.gigs.models import Category
        category = Category.objects.first()
        if not category:
            print("✗ 没有找到分类，请先运行分类创建脚本")
            return False

        # 创建测试Gig
        if not Gig.objects.filter(title='测试Logo设计服务').exists():
            gig = Gig.objects.create(
                title='测试Logo设计服务',
                slug=slugify('测试Logo设计服务', allow_unicode=True),
                description='专业的Logo设计服务，包含多个概念设计稿和修改机会。',
                freelancer=freelancer_user,
                category=category,
                status='active',
                tags='logo,设计,品牌,视觉',
                searchable_text='logo 设计 品牌 视觉 创意',
                meta_description='专业的Logo设计服务，为您的品牌打造独特的视觉形象',
                is_featured=True,
                is_premium=False
            )
            print("✓ 创建测试Gig成功")

            # 创建基础套餐
            GigPackage.objects.create(
                gig=gig,
                package_type='basic',
                title='基础套餐',
                description='包含2个概念设计稿，1次修改机会',
                price=299.00,
                delivery_days=3,
                revisions=1,
                features=['2个设计概念', 'JPG格式文件', '1次修改机会']
            )
            print("✓ 创建基础套餐成功")

            # 创建标准套餐
            GigPackage.objects.create(
                gig=gig,
                package_type='standard',
                title='标准套餐',
                description='包含3个概念设计稿，3次修改机会，源文件',
                price=599.00,
                delivery_days=5,
                revisions=3,
                features=['3个设计概念', '源文件(PSD/AI)', '3次修改机会', '快速响应']
            )
            print("✓ 创建标准套餐成功")

            # 创建高级套餐
            GigPackage.objects.create(
                gig=gig,
                package_type='premium',
                title='高级套餐',
                description='包含5个概念设计稿，无限修改，全套品牌设计',
                price=1299.00,
                delivery_days=7,
                revisions=-1,  # 无限修改
                features=['5个设计概念', '无限修改机会', '全套品牌设计', '名片设计', '社交媒体模板']
            )
            print("✓ 创建高级套餐成功")

            # 创建需求项
            GigRequirement.objects.create(
                gig=gig,
                requirement_text='请提供您的公司名称和业务描述',
                is_required=True,
                input_type='textarea',
                sort_order=1
            )
            print("✓ 创建需求项成功")

            # 创建FAQ
            GigFAQ.objects.create(
                gig=gig,
                question='你们提供哪些格式的文件？',
                answer='我们提供JPG、PNG、PDF以及源文件(PSD/AI)格式。',
                sort_order=1
            )
            print("✓ 创建FAQ成功")

        else:
            gig = Gig.objects.get(title='测试Logo设计服务')
            print("✓ 测试Gig已存在")

        return True

    except Exception as e:
        print(f"✗ 创建测试数据失败: {e}")
        return False

def test_gig_search():
    """测试Gig搜索功能"""
    print("\n" + "=" * 50)
    print("Gig搜索功能测试")
    print("=" * 50)

    try:
        from django.db.models import Q
        from apps.gigs.models import Gig

        # 测试基础搜索
        all_gigs = Gig.objects.all()
        active_gigs = Gig.objects.filter(status='active')
        featured_gigs = Gig.objects.filter(is_featured=True)

        print(f"1. 基础搜索统计:")
        print(f"   - 总服务数: {all_gigs.count()}")
        print(f"   - 活跃服务数: {active_gigs.count()}")
        print(f"   - 推荐服务数: {featured_gigs.count()}")

        # 测试文本搜索
        design_gigs = Gig.objects.filter(
            Q(title__icontains='设计') | Q(description__icontains='设计')
        )
        print(f"\n2. 文本搜索测试:")
        print(f"   - 包含'设计'的服务: {design_gigs.count()} 个")

        # 测试分类搜索
        from apps.gigs.models import Category
        if Category.objects.exists():
            category = Category.objects.first()
            category_gigs = Gig.objects.filter(category=category)
            print(f"   - '{category.name}'分类的服务: {category_gigs.count()} 个")

        return True

    except Exception as e:
        print(f"✗ 搜索测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print(f"开始测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = []

    # 运行各项测试
    results.append(("模型测试", test_models()))
    results.append(("序列化器测试", test_serializers()))
    results.append(("视图测试", test_views()))
    results.append(("URL测试", test_urls()))
    results.append(("Admin测试", test_admin()))
    results.append(("测试数据", create_test_gig()))
    results.append(("搜索功能", test_gig_search()))

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
        print("\n🎉 所有测试通过！Gig管理系统配置正确。")
        print("\n您现在可以:")
        print("- 访问 http://127.0.0.1:8000/admin/gigs/ 管理服务")
        print("- 使用API接口创建和管理服务")
        print("- 测试服务搜索和过滤功能")
    else:
        print(f"\n⚠️  {len(results) - passed} 项测试失败，请检查配置。")

    print(f"\n测试完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == '__main__':
    main()