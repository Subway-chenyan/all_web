# 自由职业平台 PostgreSQL 数据库设置

这个指南帮助你设置PostgreSQL数据库容器并连接到现有的Django后端，然后创建测试数据。

## 🚀 快速开始

### 1. 使用自动设置脚本

```bash
# 运行自动设置脚本
./setup.sh
```

这个脚本会自动：
- 启动PostgreSQL和Redis容器
- 安装Python依赖
- 运行数据库迁移
- 创建超级用户
- 生成测试数据

### 2. 手动设置

#### 启动数据库容器
```bash
# 启动PostgreSQL和Redis
docker-compose up -d postgres redis

# 等待数据库启动
sleep 10
```

#### 安装依赖和迁移
```bash
# 安装Python依赖
pip install -r requirements.txt

# 运行数据库迁移
python manage.py makemigrations
python manage.py migrate
```

#### 创建测试数据
```bash
# 创建超级用户
python manage.py createsuperuser

# 创建测试数据
python create_test_data.py
```

## 📁 文件说明

### Docker配置文件
- `docker-compose.yml` - Docker服务编排配置
- `Dockerfile` - Django应用容器配置
- `init-db.sql` - PostgreSQL初始化脚本

### 环境配置文件
- `.env` - 本地开发环境配置
- `.env.docker` - Docker环境配置

### 数据脚本
- `create_test_data.py` - 测试数据生成脚本
- `setup.sh` - 自动设置脚本

## 🗄️ 数据库配置

### 连接信息
- **主机**: localhost
- **端口**: 5432
- **数据库名**: freelance_platform
- **用户名**: postgres
- **密码**: postgres123

### 应用用户
- **用户名**: freelance_user
- **密码**: freelance_pass123

## 📊 测试数据

脚本会为每个数据表创建5条测试记录，包括：

### 用户和认证
- 5个自由职业者用户
- 5个客户用户
- 用户资料和技能关联
- 教育经历和工作经历

### 服务相关
- 5个服务分类
- 5个服务项目
- 每个服务的3个套餐（基础/标准/高级）
- 服务需求和FAQ

### 订单和支付
- 5个订单
- 交易记录
- 钱包数据

### 消息和评价
- 用户对话
- 消息记录
- 服务评价

## 🛠️ 开发命令

### 数据库操作
```bash
# 创建新的迁移文件
python manage.py makemigrations

# 应用迁移
python manage.py migrate

# 重置数据库
docker-compose down -v
docker-compose up -d postgres
python manage.py migrate
python create_test_data.py
```

### Django管理
```bash
# 启动开发服务器
python manage.py runserver

# 访问管理后台
# http://localhost:8000/admin/
# 用户名: admin
# 密码: admin123

# Django Shell
python manage.py shell
```

### Docker操作
```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs postgres
docker-compose logs django

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart
```

## 🔧 常见问题

### 1. PostgreSQL连接失败
```bash
# 检查PostgreSQL状态
docker-compose exec postgres pg_isready -U postgres

# 查看PostgreSQL日志
docker-compose logs postgres
```

### 2. 迁移失败
```bash
# 重置迁移
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
python manage.py makemigrations
python manage.py migrate
```

### 3. 测试数据创建失败
```bash
# 清理现有数据
python manage.py shell
>>> from create_test_data import main
>>> main()
```

## 📈 监控和日志

### 数据库监控
```sql
-- 连接到数据库
docker-compose exec postgres psql -U postgres -d freelance_platform

-- 查看表大小
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_stat_user_tables ORDER BY pg_total_relation_size DESC;

-- 查看活跃连接
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### 应用日志
```bash
# 查看Django日志
tail -f logs/django.log

# 查看容器日志
docker-compose logs -f django
```

## 🔒 安全注意事项

- 生产环境中请更改默认密码
- 使用环境变量管理敏感信息
- 定期备份数据库
- 限制数据库访问权限

## 📝 开发建议

1. **使用虚拟环境**: 建议使用Python虚拟环境
2. **代码质量**: 运行 `python manage.py check` 检查项目配置
3. **测试**: 编写单元测试和集成测试
4. **文档**: 保持API文档更新

## 🆘 获取帮助

如果遇到问题，请检查：
1. Docker和Docker Compose是否正确安装
2. 端口5432和6379是否被占用
3. Python依赖是否正确安装
4. Django配置是否正确

更多帮助请参考Django和PostgreSQL官方文档。