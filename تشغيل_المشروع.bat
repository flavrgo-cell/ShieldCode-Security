@echo off
chcp 65001 > nul
title TechStore - SecurePay Gateway (Anti-Phishing)
echo ========================================================
echo        جاري تشغيل مشروع TechStore - SecurePay Gateway
echo ========================================================
echo.
cd /d "%~dp0"
echo السيرفر سيعمل على: http://localhost:3000
echo سيتم فتح المتصفح تلقائياً بعد ثوانٍ...
start "" http://localhost:3000
npm run dev
pause
