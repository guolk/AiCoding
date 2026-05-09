@echo off
echo ========================================
echo   晶体结构分析平台 - 前端启动
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查 Node.js 环境...
node --version
if errorlevel 1 (
    echo 错误: 未找到 Node.js，请先安装 Node.js 16+
    pause
    exit /b 1
)

echo.
echo [2/3] 安装依赖包...
call npm install

echo.
echo [3/3] 启动开发服务器...
echo.
echo 前端服务将运行在: http://localhost:3000
echo 确保后端服务已启动 (http://localhost:5000)
echo 按 Ctrl+C 停止服务
echo.

call npm start

pause
