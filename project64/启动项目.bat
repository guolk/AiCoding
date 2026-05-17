@echo off
chcp 65001 >nul
echo ========================================
echo    SignMaster 手语学习平台 - 启动脚本
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查端口占用...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [警告] 端口 8080 已被占用，正在尝试端口 8081...
    netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
    if %errorlevel% equ 0 (
        echo [警告] 端口 8081 已被占用，正在尝试端口 8082...
        netstat -ano | findstr ":8082" | findstr "LISTENING" >nul
        if %errorlevel% equ 0 (
            echo [错误] 端口 8080、8081、8082 均被占用，请手动释放端口后重试
            pause
            exit /b 1
        ) else (
            set PORT=8082
        )
    ) else (
        set PORT=8081
    )
) else (
    set PORT=8080
)

echo [2/3] 启动 HTTP 服务器，端口: %PORT%
echo.
echo ========================================
echo    服务器启动成功！
echo    访问地址: http://localhost:%PORT%
echo ========================================
echo.
echo 提示: 按 Ctrl+C 停止服务器
echo.

python -m http.server %PORT%
