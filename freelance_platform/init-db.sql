-- 初始化脚本，设置数据库
-- 为应用创建专用用户
CREATE USER freelance_user WITH PASSWORD 'freelance_pass123';

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE freelance_platform TO freelance_user;

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 设置时区
SET timezone = 'Asia/Shanghai';