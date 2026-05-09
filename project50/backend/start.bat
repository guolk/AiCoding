@echo off
echo ========================================
echo   晶体结构分析平台 - 后端启动
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查 Python 环境...
python --version
if errorlevel 1 (
    echo 错误: 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

echo.
echo [2/3] 安装依赖包...
pip install -r requirements.txt

echo.
echo [3/3] 启动 Flask 服务器...
echo.
echo 后端服务将运行在: http://localhost:5000
echo 按 Ctrl+C 停止服务
echo.

python run.py

pause
