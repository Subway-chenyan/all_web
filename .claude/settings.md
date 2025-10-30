# 项目环境设置和启动方式

## 使用 uv 进行 Python 环境管理

本项目使用 `uv` 作为 Python 包管理器和虚拟环境管理工具。

### 环境创建和激活

```bash
# 创建新的虚拟环境
uv venv

# 激活虚拟环境
source .venv/bin/activate  # Linux/Mac
# 或者
.venv\Scripts\activate     # Windows
```

### 依赖管理

```bash
# 安装 Django 和核心依赖
uv add django djangorestframework python-decouple psycopg2-binary redis celery

# 安装开发依赖
uv add --dev pytest pytest-django black flake8 mypy coverage

# 安装所有依赖（从 requirements.txt）
uv pip install -r requirements.txt

# 生成 requirements.txt
uv pip freeze > requirements.txt
```

### 项目启动

```bash
# 1. 激活虚拟环境
source .venv/bin/activate

# 2. 数据库迁移
python manage.py makemigrations
python manage.py migrate

# 3. 创建超级用户
python manage.py createsuperuser

# 4. 启动开发服务器
python manage.py runserver
```

### 项目结构

```
freelance_platform/
├── manage.py
├── requirements.txt
├── .env
├── .gitignore
├── config/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── __init__.py
│   ├── accounts/
│   ├── gigs/
│   ├── orders/
│   ├── payments/
│   ├── messaging/
│   └── reviews/
└── static/
    └── media/
```

### 常用命令

```bash
# Django 管理命令
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic
python manage.py runserver 0.0.0.0:8000

# 测试
pytest
coverage run -m pytest
coverage report

# 代码质量
black .
flake8 .
mypy .

# Celery
celery -A config worker -l info
celery -A config beat -l info
```

### 记住：始终使用 uv 进行环境管理

- 安装包：`uv add package_name`
- 卸载包：`uv remove package_name`
- 查看已安装包：`uv pip list`
- 激活环境：`source .venv/bin/activate`