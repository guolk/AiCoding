@echo off
chcp 65001 >nul
echo ========================================
echo    3D打印项目管理系统 - 快速启动
echo ========================================
echo.

echo [1/3] 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js v16或更高版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js环境正常
echo.

echo [2/3] 安装依赖...
if not exist "node_modules" (
    echo 正在安装后端依赖...
    npm install
)

if not exist "client\node_modules" (
    echo 正在安装前端依赖...
    cd client
    npm install
    cd ..
)
echo 依赖安装完成
echo.

echo [3/3] 启动应用...
echo.
echo 后端服务将运行在: http://localhost:8765
echo 前端应用将运行在: http://localhost:3000
echo.
echo 按 Ctrl+C 停止应用
echo ========================================
echo.

npm run dev

pause