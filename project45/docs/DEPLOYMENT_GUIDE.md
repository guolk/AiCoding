# 部署指南

## 1. 前置要求

### 1.1 环境要求

| 工具 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 18.0.0 | 运行时环境 |
| npm | >= 9.0.0 | 包管理器（随Node.js安装） |
| git | 任意 | 代码版本控制 |

### 1.2 检查环境

```bash
# 检查Node.js版本
node -v
# 应输出: v18.x.x 或更高

# 检查npm版本
npm -v
# 应输出: 9.x.x 或更高

# 检查git版本
git -v
```

---

## 2. 本地构建部署

### 2.1 构建生产版本

```bash
# 1. 进入项目目录
cd d:\TARE_workspace\test\project38

# 2. 安装依赖（如未安装）
npm install

# 3. 构建生产版本
npm run build
```

构建完成后，生成的文件将位于 `dist/` 目录：

```
dist/
├── index.html          # 入口HTML
├── assets/
│   ├── index-xxx.js    # 主JS文件（已压缩）
│   ├── index-xxx.css   # 主CSS文件（已压缩）
│   └── ...             # 其他资源
└── favicon.ico         # 网站图标
```

### 2.2 预览构建结果

```bash
# 预览生产构建
npm run preview
```

然后访问 `http://localhost:4173/` 查看效果。

### 2.3 本地静态服务器部署

使用任意静态文件服务器部署 `dist/` 目录：

**方式1：使用Vite预览**
```bash
npm run preview
```

**方式2：使用serve**
```bash
# 安装serve
npm install -g serve

# 启动服务器
serve -s dist -l 3000
```

**方式3：使用http-server**
```bash
# 安装
npm install -g http-server

# 启动
cd dist
http-server -p 3000
```

---

## 3. 常见平台部署

### 3.1 Nginx 部署

#### 步骤1：复制构建文件

```bash
# 将dist目录复制到Nginx静态目录
cp -r dist/* /usr/share/nginx/html/
```

#### 步骤2：配置Nginx

创建配置文件 `/etc/nginx/conf.d/app.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名
    
    # 根目录
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 单页应用路由支持（React Router Browser模式）
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理（如需要）
    location /api/ {
        proxy_pass http://backend-server:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 步骤3：重启Nginx

```bash
# 检查配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 3.2 Vercel 部署

#### 方式1：使用Vercel CLI

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel
# 按照提示完成部署
```

#### 方式2：Git仓库自动部署

1. 将代码推送到GitHub/GitLab/Bitbucket
2. 在Vercel网站导入仓库
3. 配置构建命令：`npm run build`
4. 配置输出目录：`dist`
5. 点击部署

#### 配置文件（可选）

创建 `vercel.json`：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3.3 Netlify 部署

#### 方式1：使用Netlify CLI

```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 构建并部署
netlify build
netlify deploy --prod
```

#### 方式2：Git仓库自动部署

1. 将代码推送到GitHub
2. 在Netlify网站导入仓库
3. 配置：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 点击部署

#### 配置文件（可选）

创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3.4 Docker 部署

#### Dockerfile

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    
    # 单页应用路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 构建和运行

```bash
# 构建镜像
docker build -t user-management-app .

# 运行容器
docker run -d -p 80:80 --name my-app user-management-app

# 查看运行状态
docker ps
```

### 3.5 GitHub Pages 部署

#### 步骤1：安装gh-pages

```bash
npm install --save-dev gh-pages
```

#### 步骤2：修改package.json

```json
{
  "homepage": "https://your-username.github.io/repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 步骤3：修改vite.config.ts

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/repo-name/',  // 替换为你的仓库名
});
```

#### 步骤4：部署

```bash
npm run deploy
```

---

## 4. 环境配置

### 4.1 环境变量

创建 `.env` 文件：

```bash
# 应用标题
VITE_APP_TITLE=用户管理系统

# API基础URL
VITE_API_BASE_URL=https://api.example.com

# 是否启用Mock数据
VITE_USE_MOCK=true

# 页面刷新时间（毫秒）
VITE_REFRESH_INTERVAL=300000
```

### 4.2 多环境配置

| 文件 | 环境 | 说明 |
|------|------|------|
| `.env.development` | 开发 | 开发环境配置 |
| `.env.staging` | 预发布 | 预发布环境配置 |
| `.env.production` | 生产 | 生产环境配置 |

**示例：.env.production**

```bash
VITE_APP_TITLE=用户管理系统
VITE_API_BASE_URL=https://api.example.com
VITE_USE_MOCK=false
```

**不同环境构建：**

```bash
# 开发
npm run dev

# 预发布
vite build --mode staging

# 生产
npm run build
```

---

## 5. CI/CD 配置

### 5.1 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run typecheck
      
      - name: Build
        run: npm run build
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
  
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 5.2 GitLab CI/CD

创建 `.gitlab-ci.yml`：

```yaml
image: node:18-alpine

stages:
  - build
  - test
  - deploy

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/

before_script:
  - npm ci

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  script:
    - npm run typecheck
    - npx playwright install --with-deps
    - npm run test:e2e

deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production..."
  only:
    - main
  environment:
    name: production
```

---

## 6. 性能优化建议

### 6.1 构建优化

**1. 代码分割**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关库单独打包
          react: ['react', 'react-dom', 'react-router-dom'],
          // 将数据管理库单独打包
          query: ['@tanstack/react-query'],
          // 将表单处理库单独打包
          form: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 移除console
        drop_debugger: true, // 移除debugger
      },
    },
    // 生成sourcemap（生产环境可选）
    sourcemap: false,
  },
});
```

**2. 资源预加载**

在 `index.html` 中添加：

```html
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://api.example.com">
```

### 6.2 运行时优化

**1. 图片优化**

```typescript
// 使用WebP格式
// 懒加载图片
<img
  src="/images/product.webp"
  alt="Product"
  loading="lazy"
  width="400"
  height="300"
/>
```

**2. 使用CDN**

将静态资源放到CDN上：

```typescript
// vite.config.ts
export default defineConfig({
  base: 'https://cdn.example.com/',
  // 或
  base: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.example.com/' 
    : '/',
});
```

---

## 7. 监控和日志

### 7.1 错误监控

**Sentry集成：**

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 7.2 性能监控

```typescript
// 监听Core Web Vitals
import { getCLS, getFID, getLCP, getTTFB } from 'web-vitals';

function reportWebVitals(metric: any) {
  console.log(metric);
  // 发送到分析服务
}

getCLS(reportWebVitals);
getFID(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

---

## 8. 安全考虑

### 8.1 HTTPS

生产环境必须使用HTTPS：

- Nginx配置SSL证书
- 使用Let's Encrypt免费证书
- 配置HSTS：`Strict-Transport-Security: max-age=31536000`

### 8.2 内容安全策略（CSP）

```nginx
# nginx.conf
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
";
```

### 8.3 防止XSS

```typescript
// 不直接使用用户输入
// 使用DOMPurify清理用户输入
import DOMPurify from 'dompurify';

const safeHtml = DOMPurify.sanitize(userInput);
```

### 8.4 敏感信息

**不要将敏感信息提交到代码库：**

```bash
# .gitignore
.env
.env.local
*.pem
*.key
```

**使用环境变量：**

```typescript
// 正确做法
const apiKey = import.meta.env.VITE_API_KEY;

// 错误做法
const apiKey = 'sk-xxx-xxx-xxx'; // 不要硬编码！
```

---

## 9. 部署检查清单

### 部署前

- [ ] 所有测试通过（`npm run test:e2e`）
- [ ] 类型检查通过（`npm run typecheck`）
- [ ] 构建成功（`npm run build`）
- [ ] 环境变量配置正确
- [ ] 敏感信息未硬编码
- [ ] 依赖安全审计（`npm audit`）

### 部署中

- [ ] 服务器环境满足要求
- [ ] 静态资源正确上传
- [ ] Nginx/CDN配置正确
- [ ] 路由重写规则正确（SPA支持）
- [ ] SSL证书配置正确

### 部署后

- [ ] 网站可正常访问
- [ ] 所有页面可正常加载
- [ ] API调用正常
- [ ] 静态资源加载正常
- [ ] 移动端适配正常
- [ ] 错误监控正常工作
- [ ] 性能指标在可接受范围

---

## 10. 快速部署命令参考

```bash
# ========== 本地构建 ==========
npm install          # 安装依赖
npm run typecheck    # 类型检查
npm run build        # 构建生产版本
npm run preview      # 预览构建结果

# ========== Docker部署 ==========
docker build -t my-app .
docker run -d -p 80:80 my-app

# ========== Vercel部署 ==========
npm install -g vercel
vercel login
vercel --prod

# ========== GitHub Pages ==========
npm install --save-dev gh-pages
# 修改package.json和vite.config.ts
npm run deploy
```
