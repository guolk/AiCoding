# 修复后部署说明文档

**文档版本**: 1.0  
**创建日期**: 2026-05-01

---

## 目录

1. [系统要求](#1-系统要求)
2. [环境变量配置](#2-环境变量配置)
3. [数据库部署](#3-数据库部署)
4. [Redis部署](#4-redis部署)
5. [应用部署](#5-应用部署)
6. [Nginx配置](#6-nginx配置)
7. [安全加固](#7-安全加固)
8. [测试验证](#8-测试验证)
9. [回滚方案](#9-回滚方案)

---

## 1. 系统要求

### 1.1 硬件要求

| 环境 | CPU | 内存 | 硬盘 |
|------|-----|------|------|
| 测试环境 | 2核 | 4GB | 50GB |
| 生产环境 | 4核+ | 8GB+ | 100GB SSD+ |

### 1.2 软件要求

| 软件 | 版本 |
|------|------|
| Node.js | 18.x LTS |
| MySQL | 8.0 |
| Redis | 7.x |
| Nginx | 1.24+ |

---

## 2. 环境变量配置

### 2.1 必需环境变量

```bash
# JWT配置
JWT_SECRET=your-production-secret-key-change-this
JWT_EXPIRES_IN=24h

# 数据库
DATABASE_URL=mysql://db_user:db_password@localhost:3306/content_subscription

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=no-reply@example.com

# Node环境
NODE_ENV=production
```

### 2.2 环境变量文件

创建 `.env.production` 文件：

```bash
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
DATABASE_URL=${DATABASE_URL}
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_SECURE=true
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_FROM}
LOG_LEVEL=info
```

---

## 3. 数据库部署

### 3.1 MySQL安装

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 3.2 数据库创建

```sql
-- 登录MySQL
sudo mysql -u root -p

-- 创建数据库
CREATE DATABASE content_subscription 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'app_user'@'localhost' 
  IDENTIFIED BY 'YourStrongPassword123!';

-- 授权
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, EXECUTE 
  ON content_subscription.* 
  TO 'app_user'@'localhost';

FLUSH PRIVILEGES;
```

### 3.3 数据库迁移

```bash
cd /path/to/server-backend

# 安装依赖
npm ci

# 生成Prisma客户端
npx prisma generate

# 执行迁移
npx prisma migrate deploy

# 验证
npx prisma migrate status
```

---

## 4. Redis部署

### 4.1 Redis安装

```bash
# Ubuntu/Debian
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 4.2 Redis安全配置

编辑 `/etc/redis/redis.conf`：

```ini
# 设置密码
requirepass YourStrongRedisPassword123!

# 绑定到特定IP
bind 127.0.0.1

# 重命名危险命令
rename-command CONFIG ""
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""

# 内存配置
maxmemory 2gb
maxmemory-policy allkeys-lru
```

重启Redis：

```bash
sudo systemctl restart redis-server

# 验证密码
redis-cli
127.0.0.1:6379> auth YourStrongRedisPassword123!
127.0.0.1:6379> ping
PONG
```

---

## 5. 应用部署

### 5.1 目录结构

```bash
/opt
└── content-subscription
    ├── current           # 当前版本 (软链接)
    ├── releases          # 历史版本
    ├── shared            # 共享文件
    │   ├── .env          # 环境变量
    │   ├── logs          # 日志
    │   └── uploads       # 上传文件
    └── backup            # 备份
```

### 5.2 部署脚本

```bash
#!/bin/bash
# deploy.sh

set -e

APP_DIR="/opt/content-subscription"
RELEASE_DIR="$APP_DIR/releases/$(date +%Y%m%d-%H%M%S)"
CURRENT_DIR="$APP_DIR/current"

# 创建目录
mkdir -p "$RELEASE_DIR" "$APP_DIR/shared/logs" "$APP_DIR/shared/uploads"

# 复制代码
cp -r /path/to/server-backend/* "$RELEASE_DIR"

# 链接共享文件
ln -sf "$APP_DIR/shared/.env" "$RELEASE_DIR/.env"
ln -sf "$APP_DIR/shared/logs" "$RELEASE_DIR/logs"
ln -sf "$APP_DIR/shared/uploads" "$RELEASE_DIR/public/uploads"

# 安装依赖
cd "$RELEASE_DIR"
npm ci --only=production

# 构建
npm run build

# 数据库迁移
npx prisma migrate deploy

# 切换版本
ln -sfn "$RELEASE_DIR" "$CURRENT_DIR"

# 重启应用
pm2 restart content-subscription || pm2 start "$CURRENT_DIR/.output/server/index.mjs" --name "content-subscription"

# 清理旧版本
ls -dt "$APP_DIR/releases/"* | tail -n +6 | xargs rm -rf

echo "部署完成: $RELEASE_DIR"
```

### 5.3 PM2配置

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'content-subscription',
    script: '.output/server/index.mjs',
    cwd: '/opt/content-subscription/current',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    out_file: '/opt/content-subscription/shared/logs/out.log',
    error_file: '/opt/content-subscription/shared/logs/error.log',
    max_memory_restart: '500M',
  }],
};
```

启动应用：

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 6. Nginx配置

### 6.1 站点配置

创建 `/etc/nginx/conf.d/content-subscription.conf`：

```nginx
upstream nuxt_app {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }
    
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    
    # 安全响应头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 日志
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # 静态资源
    location /_nuxt/ {
        alias /opt/content-subscription/current/.output/public/_nuxt/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 上传文件
    location /uploads/ {
        alias /opt/content-subscription/shared/uploads/;
        expires 7d;
        
        # 禁止执行脚本
        location ~* \.(php|jsp|asp|sh|bat|exe)$ {
            deny all;
            return 403;
        }
        
        # 只允许GET/HEAD
        limit_except GET HEAD {
            deny all;
        }
    }
    
    # API代理
    location /api/ {
        proxy_pass http://nuxt_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # 默认路由
    location / {
        proxy_pass http://nuxt_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
    }
}
```

### 6.2 SSL证书

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试续期
sudo certbot renew --dry-run
```

重启Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. 安全加固

### 7.1 防火墙配置

```bash
# 安装UFW
sudo apt install -y ufw

# 配置规则
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# 内网访问 (如需要)
sudo ufw allow from 192.168.1.0/24 to any port 3306 comment 'MySQL'
sudo ufw allow from 192.168.1.0/24 to any port 6379 comment 'Redis'

# 启用防火墙
sudo ufw enable
sudo ufw status verbose
```

### 7.2 SSH安全

编辑 `/etc/ssh/sshd_config`：

```ssh-config
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
Port 2222
AllowUsers deploy
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
```

重启SSH：

```bash
sudo systemctl restart sshd
```

### 7.3 文件权限

```bash
# 应用目录
sudo chown -R deploy:deploy /opt/content-subscription
sudo chmod -R 750 /opt/content-subscription

# 环境变量
sudo chmod 600 /opt/content-subscription/shared/.env

# 上传目录
sudo chmod 750 /opt/content-subscription/shared/uploads
sudo chown deploy:www-data /opt/content-subscription/shared/uploads
```

### 7.4 安全响应头

Nginx已配置以下安全头：

| 响应头 | 值 | 作用 |
|--------|-----|------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains | 强制HTTPS |
| X-Frame-Options | SAMEORIGIN | 防止点击劫持 |
| X-Content-Type-Options | nosniff | 防止MIME嗅探 |
| X-XSS-Protection | 1; mode=block | 启用XSS过滤 |
| Referrer-Policy | strict-origin-when-cross-origin | 控制Referer |

---

## 8. 测试验证

### 8.1 功能测试清单

- [ ] 首页正常加载
- [ ] 用户注册/登录/注销正常
- [ ] 订阅创建/查询正常
- [ ] 文章创建/点赞正常
- [ ] 搜索功能正常
- [ ] 图片上传正常
- [ ] 邮件发送正常

### 8.2 安全测试清单

- [ ] 未登录用户无法访问受保护资源
- [ ] SQL注入尝试被拦截
- [ ] 危险文件上传被拒绝
- [ ] 注销后Token无法使用
- [ ] 安全响应头正确设置
- [ ] 错误页面不泄露敏感信息

### 8.3 健康检查端点

| 端点 | 说明 |
|------|------|
| `GET /api/health` | 基础健康检查 |
| `GET /api/health/db` | 数据库连接检查 |
| `GET /api/health/redis` | Redis连接检查 |
| `GET /api/ready` | 就绪检查 |

---

## 9. 回滚方案

### 9.1 应用回滚

```bash
#!/bin/bash
# rollback.sh

APP_DIR="/opt/content-subscription"

# 获取上一个版本
get_previous_version() {
    ls -dt "$APP_DIR/releases"/* | head -n 2 | tail -n 1
}

previous=$(get_previous_version)

echo "当前版本: $(readlink $APP_DIR/current)"
echo "回滚到: $previous"

read -p "确认回滚? [y/N] " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 切换版本
    ln -sfn "$previous" "$APP_DIR/current"
    
    # 重启
    pm2 reload content-subscription
    
    # 验证
    sleep 5
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "回滚成功"
    else
        echo "回滚失败，请检查"
        exit 1
    fi
fi
```

### 9.2 数据库回滚

```bash
# 查看迁移状态
npx prisma migrate status

# 从备份恢复
mysql -u root -p content_subscription < backup_20260501.sql
```

---

## 10. 常用命令

### 应用管理

```bash
# 启动/停止/重启
pm2 start content-subscription
pm2 stop content-subscription
pm2 restart content-subscription
pm2 reload content-subscription  # 零停机

# 状态/日志
pm2 status
pm2 logs content-subscription
pm2 monit
```

### 数据库管理

```bash
# 连接
mysql -u root -p

# 常用命令
SHOW PROCESSLIST;
SHOW TABLES;
DESCRIBE User;
```

### Redis管理

```bash
# 连接
redis-cli -a your_password

# 常用命令
info
info memory
keys *  # 生产环境不建议使用
ping
```

### Nginx管理

```bash
# 测试配置
sudo nginx -t

# 重载/重启
sudo nginx -s reload
sudo systemctl restart nginx

# 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

**部署文档完成日期**: 2026-05-01  
**版本**: 1.0
