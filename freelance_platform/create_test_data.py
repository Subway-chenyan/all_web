#!/usr/bin/env python
"""
创建测试数据的脚本
为所有数据表创建5条虚拟测试数据
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta, date
import random
import faker
from django.utils import timezone

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import UserProfile, Skill, UserSkill, Education, WorkExperience, Portfolio, UserVerification, UserActivityLog
from apps.gigs.models import Category, Gig, GigPackage, GigRequirement, GigFAQ, GigExtra, GigFavorite, GigView, GigStat, GigSearchHistory, GigReport
from apps.orders.models import Order, OrderStatusHistory, OrderExtra, OrderRequirement, Delivery, OrderMessage, OrderReview, OrderDispute, OrderStat, OrderCancellation
from apps.payments.models import Wallet, PaymentMethod, Transaction, Escrow, Withdrawal, PaymentRefund, PaymentStat, PayoutBatch
from apps.messaging.models import Conversation, Message, MessageAttachment, MessageTemplate, MessageReaction, BlockedUser, MessageReport, MessagingStat
from apps.reviews.models import Review, ReviewHelpful, ReviewReport, UserRating, ReviewInvitation, ReviewTemplate, ReviewStat

User = get_user_model()

# 初始化Faker
fake = faker.Faker('zh_CN')

# 测试数据常量
TEST_USERS_COUNT = 5
TEST_GIGS_COUNT = 5
TEST_ORDERS_COUNT = 5

# 中文技能和分类数据
CHINESE_SKILLS = [
    ('Python编程', '编程语言'),
    ('JavaScript开发', '编程语言'),
    ('UI设计', '设计'),
    ('网站开发', '编程语言'),
    ('移动应用开发', '编程语言'),
    ('数据分析', '数据科学'),
    ('机器学习', '数据科学'),
    ('平面设计', '设计'),
    ('视频剪辑', '多媒体'),
    ('内容写作', '写作'),
    ('翻译服务', '语言'),
    ('市场营销', '营销'),
    ('SEO优化', '营销'),
    ('社交媒体管理', '营销'),
    ('客户服务', '服务'),
]

CHINESE_CATEGORIES = [
    ('编程与开发', '编程和技术服务'),
    ('设计创意', '设计和创意服务'),
    ('写作翻译', '写作和翻译服务'),
    ('数字营销', '营销和推广服务'),
    ('视频音频', '多媒体制作服务'),
    ('商业咨询', '商业和咨询服务'),
]

CHINESE_PROVINCES = ['beijing', 'shanghai', 'guangdong', 'zhejiang', 'jiangsu']

def create_users():
    """创建测试用户"""
    print("创建测试用户...")
    users = []

    for i in range(TEST_USERS_COUNT):
        # 创建自由职业者
        freelancer = User.objects.create_user(
            username=f'freelancer{i+1}',
            email=f'freelancer{i+1}@example.com',
            password='testpass123',
            user_type='freelancer',
            user_status='active',
            phone_number=f'1{random.randint(3,9)}{random.randint(100000000, 999999999)}',
            wechat_id=f'freelancer{i+1}_{random.randint(100, 999)}',
            is_email_verified=True,
            is_phone_verified=True,
            profile_completion_percentage=random.randint(60, 100)
        )

        # 创建用户资料
        UserProfile.objects.create(
            user=freelancer,
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            bio=fake.text(max_nb_chars=200),
            country='China',
            province=random.choice(CHINESE_PROVINCES),
            city=fake.city_name(),
            preferred_language='zh-hans',
            timezone='Asia/Shanghai',
            hourly_rate=Decimal(random.randint(50, 500)),
            years_of_experience=random.randint(1, 10),
            profile_visibility='public'
        )

        users.append(freelancer)

        # 创建客户
        client = User.objects.create_user(
            username=f'client{i+1}',
            email=f'client{i+1}@example.com',
            password='testpass123',
            user_type='client',
            user_status='active',
            phone_number=f'1{random.randint(3,9)}{random.randint(100000000, 999999999)}',
            is_email_verified=True,
            is_phone_verified=True,
            profile_completion_percentage=random.randint(40, 80)
        )

        UserProfile.objects.create(
            user=client,
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            country='China',
            province=random.choice(CHINESE_PROVINCES),
            city=fake.city_name(),
            preferred_language='zh-hans',
            timezone='Asia/Shanghai'
        )

        users.append(client)

    return users

def create_skills():
    """创建技能数据"""
    print("创建技能数据...")
    skills = []

    for skill_name, category in CHINESE_SKILLS:
        skill = Skill.objects.create(
            name=skill_name,
            description=fake.text(max_nb_chars=100),
            category=category
        )
        skills.append(skill)

    return skills

def create_user_skills(users, skills):
    """为用户分配技能"""
    print("为用户分配技能...")
    freelancers = [u for u in users if u.user_type == 'freelancer']

    for freelancer in freelancers:
        # 每个自由职业者随机拥有3-6个技能
        user_skills = random.sample(skills, random.randint(3, 6))
        for skill in user_skills:
            UserSkill.objects.create(
                user=freelancer,
                skill=skill,
                proficiency_level=random.randint(3, 5),
                years_experience=Decimal(random.uniform(0.5, 8.0))
            )

def create_education(users):
    """创建教育经历"""
    print("创建教育经历...")

    for user in random.sample(users, min(TEST_USERS_COUNT, len(users))):
        Education.objects.create(
            user=user,
            institution_name=fake.company() + '大学',
            degree=random.choice(['本科', '硕士', '博士']),
            field_of_study=random.choice(['计算机科学', '软件工程', '设计', '市场营销', '工商管理']),
            start_date=fake.date_between(start_date='-10y', end_date='-4y'),
            end_date=fake.date_between(start_date='-4y', end_date='-1y'),
            gpa=Decimal(round(random.uniform(2.5, 4.0), 2))
        )

def create_work_experience(users):
    """创建工作经历"""
    print("创建工作经历...")
    freelancers = [u for u in users if u.user_type == 'freelancer']

    for freelancer in freelancers:
        for _ in range(random.randint(1, 3)):
            WorkExperience.objects.create(
                user=freelancer,
                company_name=fake.company(),
                job_title=random.choice(['高级工程师', '产品经理', '设计师', '开发工程师', '项目经理']),
                description=fake.text(max_nb_chars=300),
                start_date=fake.date_between(start_date='-5y', end_date='-1y'),
                end_date=fake.date_between(start_date='-1y', end_date='today') if random.random() > 0.3 else None,
                is_current=random.random() > 0.7,
                company_location=fake.city_name()
            )

def create_categories():
    """创建分类数据"""
    print("创建分类数据...")
    categories = []

    for name, description in CHINESE_CATEGORIES:
        category = Category.objects.create(
            name=name,
            description=description,
            icon=f'fas fa-{random.choice(["code", "palette", "pen", "chart-line", "video", "briefcase"])}',
            is_active=True,
            sort_order=len(categories)
        )
        categories.append(category)

    return categories

def create_gigs(users, categories):
    """创建服务数据"""
    print("创建服务数据...")
    freelancers = [u for u in users if u.user_type == 'freelancer']
    gigs = []

    gig_templates = [
        {
            'title': 'Python网站开发',
            'description': '专业Python Django网站开发，包括前端和后端',
            'tags': 'Python, Django, Web开发'
        },
        {
            'title': 'UI/UX设计服务',
            'description': '专业的用户界面和用户体验设计',
            'tags': 'UI设计, UX设计, Figma'
        },
        {
            'title': '移动应用开发',
            'description': 'React Native或Flutter跨平台移动应用开发',
            'tags': '移动开发, React Native, Flutter'
        },
        {
            'title': '数据分析服务',
            'description': '使用Python进行数据分析和可视化',
            'tags': '数据分析, Python, Pandas'
        },
        {
            'title': '品牌Logo设计',
            'description': '专业的品牌标志和视觉识别系统设计',
            'tags': 'Logo设计, 品牌设计, 平面设计'
        }
    ]

    for i in range(min(TEST_GIGS_COUNT, len(freelancers))):
        freelancer = freelancers[i]
        template = gig_templates[i % len(gig_templates)]
        category = random.choice(categories)

        gig = Gig.objects.create(
            title=template['title'],
            description=template['description'],
            freelancer=freelancer,
            category=category,
            status='active',
            is_featured=random.random() > 0.6,
            tags=template['tags'],
            searchable_text=f'{template["title"]} {template["description"]} {template["tags"]}',
            view_count=random.randint(10, 500),
            order_count=random.randint(0, 50),
            favorite_count=random.randint(0, 30),
            average_rating=Decimal(round(random.uniform(4.0, 5.0), 1)),
            review_count=random.randint(0, 20),
            slug=f'{template["title"].lower().replace(" ", "-").replace("/", "-")}-{i+1}',
            meta_description=template['description'][:150]
        )
        gigs.append(gig)

    return gigs

def create_gig_packages(gigs):
    """创建服务套餐"""
    print("创建服务套餐...")

    for gig in gigs:
        # 基础套餐
        GigPackage.objects.create(
            gig=gig,
            package_type='basic',
            title='基础套餐',
            description='基本服务内容',
            price=Decimal(random.randint(100, 300)),
            delivery_days=random.randint(3, 7),
            revisions=1,
            features=['基础功能', '标准支持', '1次修改']
        )

        # 标准套餐
        GigPackage.objects.create(
            gig=gig,
            package_type='standard',
            title='标准套餐',
            description='标准服务内容',
            price=Decimal(random.randint(300, 800)),
            delivery_days=random.randint(5, 10),
            revisions=3,
            features=['全部基础功能', '优先支持', '3次修改', '源文件']
        )

        # 高级套餐
        GigPackage.objects.create(
            gig=gig,
            package_type='premium',
            title='高级套餐',
            description='高级服务内容',
            price=Decimal(random.randint(800, 2000)),
            delivery_days=random.randint(7, 14),
            revisions=5,
            features=['全部标准功能', '24小时支持', '无限修改', '源文件+文档', '后续维护']
        )

def create_gig_requirements(gigs):
    """创建服务需求"""
    print("创建服务需求...")

    for gig in gigs:
        for i in range(random.randint(2, 4)):
            GigRequirement.objects.create(
                gig=gig,
                requirement_text=random.choice([
                    '请提供详细的项目需求说明',
                    '请提供您的品牌标识和配色方案',
                    '请提供目标用户群体信息',
                    '请提供参考案例或竞品分析'
                ]),
                is_required=i < 2,
                input_type=random.choice(['text', 'textarea', 'file']),
                sort_order=i
            )

def create_gig_faqs(gigs):
    """创建服务FAQ"""
    print("创建服务FAQ...")

    for gig in gigs:
        for i in range(random.randint(2, 4)):
            GigFAQ.objects.create(
                gig=gig,
                question=fake.sentence() + '?',
                answer=fake.text(max_nb_chars=200),
                sort_order=i
            )

def create_orders(users, gigs):
    """创建订单数据"""
    print("创建订单数据...")
    clients = [u for u in users if u.user_type == 'client']
    orders = []

    for i in range(min(TEST_ORDERS_COUNT, len(clients))):
        client = clients[i % len(clients)]
        gig = gigs[i % len(gigs)]
        package = gig.packages.filter(package_type='standard').first()

        order = Order.objects.create(
            client=client,
            freelancer=gig.freelancer,
            gig=gig,
            gig_package=package,
            title=gig.title,
            description=gig.description[:200],
            client_requirements=fake.text(max_nb_chars=500),
            base_price=package.price,
            total_price=package.price,
            platform_fee=package.price * Decimal('0.1'),
            freelancer_earnings=package.price * Decimal('0.9'),
              status=random.choice(['pending', 'paid', 'completed']),
            delivery_deadline=timezone.now() + timedelta(days=package.delivery_days),
            estimated_delivery=timezone.now() + timedelta(days=package.delivery_days),
            client_email=client.email,
            client_phone=client.phone_number or '',
        )
        orders.append(order)

    return orders

def create_wallets(users):
    """创建钱包数据"""
    print("创建钱包数据...")

    for user in users:
        Wallet.objects.create(
            user=user,
            balance=Decimal(random.randint(0, 10000)),
            frozen_balance=Decimal(random.randint(0, 2000)),
            total_earned=Decimal(random.randint(0, 50000)),
            total_spent=Decimal(random.randint(0, 40000)),
            withdrawal_method=random.choice(['alipay', 'wechat', 'bank_transfer']),
            withdrawal_account=f'****{random.randint(1000, 9999)}',
            withdrawal_account_name=fake.name()
        )

def create_transactions(users, orders):
    """创建交易数据"""
    print("创建交易数据...")

    for order in orders[:min(TEST_ORDERS_COUNT, len(orders))]:
        # 客户支付
        Transaction.objects.create(
            user=order.client,
            order=order,
            transaction_type='payment',
            amount=order.total_price,
            fee=order.platform_fee,
            net_amount=order.total_price,
            status='completed',
            provider=random.choice(['alipay', 'wechat', 'wallet']),
            description=f'支付订单: {order.gig.title}',
            processed_at=timezone.now(),
            completed_at=timezone.now()
        )

        # 自由职业者收入
        Transaction.objects.create(
            user=order.freelancer,
            order=order,
            transaction_type='payment',
            amount=order.freelancer_earnings,
            fee=Decimal('0'),
            net_amount=order.freelancer_earnings,
            status='completed',
            provider='wallet',
            description=f'订单收入: {order.gig.title}',
            processed_at=timezone.now(),
            completed_at=timezone.now()
        )

def create_conversations(users):
    """创建对话数据"""
    print("创建对话数据...")

    for i in range(TEST_USERS_COUNT):
        user1 = users[i]
        user2 = users[(i + 1) % len(users)]

        if user1 != user2:
            conversation = Conversation.objects.create(
                participant1=user1,
                participant2=user2,
                last_message_at=timezone.now(),
                last_message_preview=fake.sentence()
            )

            # 创建一些消息
            for j in range(random.randint(1, 5)):
                Message.objects.create(
                    conversation=conversation,
                    sender=user1 if j % 2 == 0 else user2,
                    content=fake.text(max_nb_chars=200),
                    is_read=j < 3
                )

def create_reviews(users, orders):
    """创建评价数据"""
    print("创建评价数据...")

    completed_orders = [o for o in orders if o.status == 'completed']

    for order in completed_orders[:min(TEST_ORDERS_COUNT, len(completed_orders))]:
        Review.objects.create(
            order=order,
            gig=order.gig,
            reviewer=order.client,
            reviewee=order.freelancer,
            rating=random.randint(4, 5),
            title=fake.sentence(),
            content=fake.text(max_nb_chars=300),
            is_visible=True
        )

def main():
    """主函数"""
    print("开始创建测试数据...")

    try:
        # 清理现有数据
        print("清理现有数据...")
        User.objects.filter(username__startswith='freelancer').delete()
        User.objects.filter(username__startswith='client').delete()
        Category.objects.all().delete()
        Skill.objects.all().delete()

        # 创建基础数据
        users = create_users()
        skills = create_skills()
        categories = create_categories()

        # 创建用户相关数据
        create_user_skills(users, skills)
        create_education(users)
        create_work_experience(users)
        create_wallets(users)

        # 创建服务相关数据
        gigs = create_gigs(users, categories)
        create_gig_packages(gigs)
        create_gig_requirements(gigs)
        create_gig_faqs(gigs)

        # 创建订单相关数据
        orders = create_orders(users, gigs)
        create_transactions(users, orders)

        # 创建消息和评价
        create_conversations(users)
        create_reviews(users, orders)

        print(f"\n测试数据创建完成!")
        print(f"创建了 {User.objects.count()} 个用户")
        print(f"创建了 {Category.objects.count()} 个分类")
        print(f"创建了 {Skill.objects.count()} 个技能")
        print(f"创建了 {Gig.objects.count()} 个服务")
        print(f"创建了 {Order.objects.count()} 个订单")
        print(f"创建了 {Transaction.objects.count()} 个交易")
        print(f"创建了 {Conversation.objects.count()} 个对话")
        print(f"创建了 {Review.objects.count()} 个评价")

    except Exception as e:
        print(f"创建测试数据时出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()