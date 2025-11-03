#!/bin/bash

# 自由职业平台PostgreSQL设置脚本
echo "🚀 设置自由职业平台PostgreSQL数据库..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs static/files static/media

# 停止并清理现有容器
echo "🛑 停止现有容器..."
docker-compose down -v 2>/dev/null || true

# 启动PostgreSQL容器
echo "🐘 启动PostgreSQL容器..."
docker-compose up -d postgres redis

# 等待PostgreSQL启动
echo "⏳ 等待PostgreSQL启动..."
sleep 10

# 检查PostgreSQL是否运行
echo "✅ 检查PostgreSQL状态..."
docker-compose exec postgres pg_isready -U postgres -d freelance_platform

if [ $? -ne 0 ]; then
    echo "❌ PostgreSQL启动失败"
    exit 1
fi

# 安装Python依赖
echo "📦 安装Python依赖..."
pip install -r requirements.txt

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
python manage.py makemigrations
python manage.py migrate

# 创建超级用户
echo "👤 创建超级用户..."
echo "from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('超级用户创建成功: admin/admin123')
else:
    print('超级用户已存在')
" | python manage.py shell

# 创建测试数据
echo "📊 创建测试数据..."
python create_test_data.py

echo "🎉 设置完成！"
echo ""
echo "📋 使用说明："
echo "1. PostgreSQL运行在: localhost:5432"
echo "2. 数据库名: freelance_platform"
echo "3. 用户名: postgres, 密码: postgres123"
echo "4. Redis运行在: localhost:6379"
echo "5. 超级用户: admin/admin123"
echo ""
echo "🚀 启动Django服务器:"
echo "   python manage.py runserver"
echo ""
echo "🐳 使用Docker启动完整环境:"
echo "   docker-compose up django"