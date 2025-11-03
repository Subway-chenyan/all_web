#!/usr/bin/env python
"""
简化的测试数据创建脚本
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
import random
import faker
from django.utils import timezone

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import UserProfile, Skill, UserSkill, Education, WorkExperience, Portfolio
from apps.gigs.models import Category, Gig, GigPackage, GigRequirement, GigFAQ
from apps.payments.models import Wallet

User = get_user_model()

# 初始化Faker
fake = faker.Faker('zh_CN')

def create_basic_test_data():
    """创建基本测试数据"""
    print("清理现有数据...")

    # 清理数据
    User.objects.filter(username__startswith='freelancer').delete()
    User.objects.filter(username__startswith='client').delete()
    Category.objects.all().delete()
    Skill.objects.all().delete()

    print("创建基本测试数据...")

    # 创建分类
    categories = []
    category_data = [
        ('编程与开发', '编程和技术服务'),
        ('设计创意', '设计和创意服务'),
        ('写作翻译', '写作和翻译服务'),
    ]

    for name, desc in category_data:
        category = Category.objects.create(
            name=name,
            description=desc,
            icon='fas fa-code',
            is_active=True,
            sort_order=len(categories)
        )
        categories.append(category)

    # 创建技能
    skills = []
    skill_data = [
        ('Python编程', '编程语言'),
        ('JavaScript开发', '编程语言'),
        ('UI设计', '设计'),
        ('网站开发', '编程语言'),
        ('内容写作', '写作'),
    ]

    for name, category in skill_data:
        skill = Skill.objects.create(
            name=name,
            description=fake.text(max_nb_chars=100),
            category=category
        )
        skills.append(skill)

    # 创建自由职业者
    freelancers = []
    for i in range(3):
        user = User.objects.create_user(
            username=f'freelancer{i+1}',
            email=f'freelancer{i+1}@example.com',
            password='testpass123',
            user_type='freelancer',
            user_status='active',
            phone_number=f'1{random.randint(3,9)}{random.randint(100000000, 999999999)}',
            is_email_verified=True,
            is_phone_verified=True,
            profile_completion_percentage=80
        )

        UserProfile.objects.create(
            user=user,
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            bio=fake.text(max_nb_chars=200),
            country='China',
            province='beijing',
            city=fake.city_name(),
            preferred_language='zh-hans',
            timezone='Asia/Shanghai',
            hourly_rate=Decimal(random.randint(100, 500)),
            years_of_experience=random.randint(2, 8),
            profile_visibility='public'
        )

        freelancers.append(user)

    # 创建客户
    clients = []
    for i in range(2):
        user = User.objects.create_user(
            username=f'client{i+1}',
            email=f'client{i+1}@example.com',
            password='testpass123',
            user_type='client',
            user_status='active',
            is_email_verified=True,
            profile_completion_percentage=60
        )

        UserProfile.objects.create(
            user=user,
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            country='China',
            province='shanghai',
            city=fake.city_name(),
            preferred_language='zh-hans',
            timezone='Asia/Shanghai'
        )

        clients.append(user)

    # 为自由职业者分配技能
    for freelancer in freelancers:
        user_skills = random.sample(skills, random.randint(2, 4))
        for skill in user_skills:
            UserSkill.objects.create(
                user=freelancer,
                skill=skill,
                proficiency_level=random.randint(3, 5),
                years_experience=Decimal(random.uniform(1.0, 5.0))
            )

    # 创建服务
    gigs = []
    gig_templates = [
        {
            'title': 'Python网站开发',
            'description': '专业Python Django网站开发服务',
            'tags': 'Python, Django, Web开发'
        },
        {
            'title': 'UI设计服务',
            'description': '专业的用户界面设计服务',
            'tags': 'UI设计, Figma, 界面设计'
        },
        {
            'title': '内容写作',
            'description': '高质量的内容创作和文案写作',
            'tags': '写作, 文案, 内容创作'
        },
    ]

    for i, template in enumerate(gig_templates):
        freelancer = freelancers[i % len(freelancers)]
        category = categories[i % len(categories)]

        gig = Gig.objects.create(
            title=template['title'],
            description=template['description'],
            freelancer=freelancer,
            category=category,
            status='active',
            is_featured=random.random() > 0.5,
            tags=template['tags'],
            searchable_text=f'{template["title"]} {template["description"]} {template["tags"]}',
            view_count=random.randint(10, 200),
            order_count=random.randint(0, 20),
            favorite_count=random.randint(0, 15),
            average_rating=Decimal(round(random.uniform(4.0, 5.0), 1)),
            review_count=random.randint(0, 10),
            slug=f'{template["title"].lower().replace(" ", "-")}-{i+1}',
            meta_description=template['description'][:150]
        )
        gigs.append(gig)

        # 创建服务套餐
        GigPackage.objects.create(
            gig=gig,
            package_type='basic',
            title='基础套餐',
            description='基本服务内容',
            price=Decimal(random.randint(100, 300)),
            delivery_days=random.randint(3, 7),
            revisions=1,
            features=['基础功能', '标准支持']
        )

        GigPackage.objects.create(
            gig=gig,
            package_type='standard',
            title='标准套餐',
            description='标准服务内容',
            price=Decimal(random.randint(300, 800)),
            delivery_days=random.randint(5, 10),
            revisions=3,
            features=['全部基础功能', '优先支持', '3次修改']
        )

        # 创建服务需求
        for j in range(2):
            GigRequirement.objects.create(
                gig=gig,
                requirement_text=f'请提供详细的项目需求说明 {j+1}',
                is_required=j < 1,
                input_type='textarea',
                sort_order=j
            )

        # 创建FAQ
        for j in range(2):
            GigFAQ.objects.create(
                gig=gig,
                question=f'常见问题 {j+1}?',
                answer=f'这是常见问题{j+1}的详细回答。',
                sort_order=j
            )

    # 创建钱包
    for user in freelancers + clients:
        Wallet.objects.create(
            user=user,
            balance=Decimal(random.randint(0, 5000)),
            frozen_balance=Decimal(random.randint(0, 1000)),
            total_earned=Decimal(random.randint(0, 20000)),
            total_spent=Decimal(random.randint(0, 15000)),
            withdrawal_method='alipay',
            withdrawal_account=f'****{random.randint(1000, 9999)}',
            withdrawal_account_name=fake.name()
        )

    print(f"✅ 测试数据创建完成!")
    print(f"📊 创建统计:")
    print(f"   - 用户: {User.objects.count()} 个")
    print(f"   - 分类: {Category.objects.count()} 个")
    print(f"   - 技能: {Skill.objects.count()} 个")
    print(f"   - 服务: {Gig.objects.count()} 个")
    print(f"   - 服务套餐: {GigPackage.objects.count()} 个")
    print(f"   - 钱包: {Wallet.objects.count()} 个")

if __name__ == '__main__':
    create_basic_test_data()