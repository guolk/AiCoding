@echo off
title 晶体结构分析平台

echo ========================================
echo   晶体结构分析平台
echo   启动所有服务
echo ========================================
echo.

echo 正在启动后端服务...
start "后端服务" cmd /k "cd /d %~dp0backend && python run.py"

echo 等待后端启动...
timeout /t 5 /nobreak > nul

echo 正在启动前端服务...
start "前端服务" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo   服务启动中...
echo   后端: http://localhost:5000
echo   前端: http://localhost:3000
echo ========================================
echo.
echo 请在浏览器中打开: http://localhost:3000
echo.
pause
