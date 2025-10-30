#!/usr/bin/env python
"""
创建Gig分类数据的脚本

这个脚本用于初始化服务分类，为自由职业平台提供基础分类数据。
"""

import os
import sys
import django

# 添加项目路径
sys.path.append('/home/subway/all_web/freelance_platform')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 初始化Django
django.setup()

from apps.gigs.models import Category

def create_categories():
    """创建服务分类数据"""

    categories_data = [
        {
            'name': '设计与创意',
            'description': '平面设计、UI/UX设计、视频编辑等创意服务',
            'icon': 'design',
            'children': [
                {
                    'name': '平面设计',
                    'description': 'Logo设计、海报设计、名片设计等',
                    'icon': 'graphic-design'
                },
                {
                    'name': 'UI/UX设计',
                    'description': '网页设计、APP设计、交互设计等',
                    'icon': 'ui-ux'
                },
                {
                    'name': '视频编辑',
                    'description': '视频剪辑、特效制作、动画设计等',
                    'icon': 'video-editing'
                },
                {
                    'name': '3D建模',
                    'description': '3D建模、渲染、动画制作等',
                    'icon': '3d-modeling'
                },
                {
                    'name': '品牌设计',
                    'description': '品牌VI设计、包装设计等',
                    'icon': 'branding'
                }
            ]
        },
        {
            'name': '编程与开发',
            'description': '网站开发、APP开发、软件开发等技术服务',
            'icon': 'programming',
            'children': [
                {
                    'name': '网站开发',
                    'description': '企业网站、电商平台、门户网站开发',
                    'icon': 'web-development'
                },
                {
                    'name': '移动应用开发',
                    'description': 'iOS应用、Android应用开发',
                    'icon': 'mobile-development'
                },
                {
                    'name': '游戏开发',
                    'description': '游戏设计、游戏开发、游戏测试',
                    'icon': 'game-development'
                },
                {
                    'name': '数据库开发',
                    'description': '数据库设计、优化、维护',
                    'icon': 'database'
                },
                {
                    'name': '区块链开发',
                    'description': '智能合约、DApp开发、加密货币相关',
                    'icon': 'blockchain'
                }
            ]
        },
        {
            'name': '写作与翻译',
            'description': '文案写作、技术写作、翻译服务等',
            'icon': 'writing',
            'children': [
                {
                    'name': '文案写作',
                    'description': '广告文案、营销文案、品牌文案',
                    'icon': 'copywriting'
                },
                {
                    'name': '技术写作',
                    'description': '技术文档、API文档、用户手册',
                    'icon': 'technical-writing'
                },
                {
                    'name': '翻译服务',
                    'description': '中英翻译、多语言翻译、本地化',
                    'icon': 'translation'
                },
                {
                    'name': '内容创作',
                    'description': '博客文章、社交媒体内容、SEO内容',
                    'icon': 'content-creation'
                },
                {
                    'name': '简历写作',
                    'description': '简历修改、求职信、职业规划',
                    'icon': 'resume-writing'
                }
            ]
        },
        {
            'name': '数字营销',
            'description': 'SEO、社交媒体营销、内容营销等',
            'icon': 'marketing',
            'children': [
                {
                    'name': 'SEO优化',
                    'description': '网站SEO、关键词优化、排名提升',
                    'icon': 'seo'
                },
                {
                    'name': '社交媒体营销',
                    'description': '微信营销、微博营销、内容运营',
                    'icon': 'social-media'
                },
                {
                    'name': '内容营销',
                    'description': '内容策划、内容创作、内容分发',
                    'icon': 'content-marketing'
                },
                {
                    'name': '邮件营销',
                    'description': '邮件设计、邮件自动化、EDM策略',
                    'icon': 'email-marketing'
                },
                {
                    'name': 'PPC广告',
                    'description': 'Google Ads、Facebook Ads、百度推广',
                    'icon': 'ppc'
                }
            ]
        },
        {
            'name': '视频与动画',
            'description': '视频制作、动画设计、后期制作等',
            'icon': 'video',
            'children': [
                {
                    'name': '视频拍摄',
                    'description': '商业视频、产品视频、活动拍摄',
                    'icon': 'video-shooting'
                },
                {
                    'name': '视频剪辑',
                    'description': '视频剪辑、调色、音效处理',
                    'icon': 'video-editing'
                },
                {
                    'name': '2D动画',
                    'description': '动画制作、MG动画、角色动画',
                    'icon': '2d-animation'
                },
                {
                    'name': '3D动画',
                    'description': '3D动画、产品展示动画、建筑动画',
                    'icon': '3d-animation'
                },
                {
                    'name': '视频特效',
                    'description': '视觉特效、合成、后期制作',
                    'icon': 'visual-effects'
                }
            ]
        },
        {
            'name': '音乐与音频',
            'description': '音乐制作、音频处理、配音服务等',
            'icon': 'music',
            'children': [
                {
                    'name': '音乐制作',
                    'description': '原创音乐、编曲、混音、母带',
                    'icon': 'music-production'
                },
                {
                    'name': '配音服务',
                    'description': '商业配音、动画配音、有声书',
                    'icon': 'voice-over'
                },
                {
                    'name': '音频编辑',
                    'description': '音频剪辑、降噪、音频修复',
                    'icon': 'audio-editing'
                },
                {
                    'name': '音效制作',
                    'description': '游戏音效、影视音效、环境音',
                    'icon': 'sound-effects'
                },
                {
                    'name': '播客制作',
                    'description': '播客录制、剪辑、发布',
                    'icon': 'podcast'
                }
            ]
        },
        {
            'name': '商业咨询',
            'description': '商业策略、管理咨询、财务咨询等',
            'icon': 'business',
            'children': [
                {
                    'name': '商业计划',
                    'description': '商业计划书、融资计划、市场分析',
                    'icon': 'business-plan'
                },
                {
                    'name': '市场调研',
                    'description': '市场分析、竞品分析、用户调研',
                    'icon': 'market-research'
                },
                {
                    'name': '财务咨询',
                    'description': '财务规划、税务咨询、投资建议',
                    'icon': 'finance'
                },
                {
                    'name': '管理咨询',
                    'description': '流程优化、团队管理、战略规划',
                    'icon': 'management'
                },
                {
                    'name': '法律咨询',
                    'description': '合同审查、法律文书、合规咨询',
                    'icon': 'legal'
                }
            ]
        },
        {
            'name': '教育培训',
            'description': '在线课程、技能培训、语言学习等',
            'icon': 'education',
            'children': [
                {
                    'name': '编程教学',
                    'description': 'Python、Java、Web开发教学',
                    'icon': 'programming-tutor'
                },
                {
                    'name': '语言教学',
                    'description': '英语、日语、韩语等语言教学',
                    'icon': 'language-tutor'
                },
                {
                    'name': '设计教学',
                    'description': 'PS、AI、CAD等软件教学',
                    'icon': 'design-tutor'
                },
                {
                    'name': '职业培训',
                    'description': '面试技巧、职场技能、职业规划',
                    'icon': 'career-training'
                },
                {
                    'name': '学术辅导',
                    'description': '数学、物理、化学等学科辅导',
                    'icon': 'academic-tutor'
                }
            ]
        }
    ]

    print("开始创建Gig分类数据...")

    created_count = 0
    updated_count = 0

    for category_data in categories_data:
        # 创建父分类
        parent_category, created = Category.objects.get_or_create(
            name=category_data['name'],
            defaults={
                'description': category_data['description'],
                'icon': category_data['icon'],
                'parent': None,
                'sort_order': created_count
            }
        )

        if created:
            print(f"✓ 创建父分类: {parent_category.name}")
            created_count += 1
        else:
            print(f"○ 父分类已存在: {parent_category.name}")
            updated_count += 1

        # 创建子分类
        for i, child_data in enumerate(category_data['children']):
            child_category, created = Category.objects.get_or_create(
                name=child_data['name'],
                parent=parent_category,
                defaults={
                    'description': child_data['description'],
                    'icon': child_data['icon'],
                    'sort_order': i
                }
            )

            if created:
                print(f"  ✓ 创建子分类: {child_category.name}")
                created_count += 1
            else:
                print(f"  ○ 子分类已存在: {child_category.name}")
                updated_count += 1

    print(f"\n分类数据创建完成!")
    print(f"新创建: {created_count} 个分类")
    print(f"已存在: {updated_count} 个分类")
    print(f"总计: {Category.objects.count()} 个分类")

    # 显示创建的分类统计
    print(f"\n分类统计:")
    parent_categories = Category.objects.filter(parent=None).count()
    child_categories = Category.objects.exclude(parent=None).count()
    print(f"父分类: {parent_categories} 个")
    print(f"子分类: {child_categories} 个")

def main():
    """主函数"""
    print("=" * 60)
    print("创建Gig分类数据")
    print("=" * 60)

    try:
        create_categories()
        print("\n🎉 分类数据创建成功!")
    except Exception as e:
        print(f"\n❌ 创建失败: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()