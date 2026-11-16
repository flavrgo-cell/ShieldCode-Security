@echo off
chcp 65001 >nul
title ShieldCode CLI Tool
color 0b
cd /d "C:\Users\HUWAEI LAPTOP\Desktop\PROJECT"

:menu
cls
echo ================================================================
echo           🛡️ أداة ShieldCode لمكافحة التصيد والاحتيال المالي
echo ================================================================
echo.
echo [1] عرض تعليمات وأوامر الأداة (--help)
echo [2] تجربة حقن رمز الحماية في رسالة بنكية (protect)
echo [3] فحص رسالة للتأكد هل هي أصلية أم تصيد مزور (verify)
echo [4] عرض قائمة الحسابات التجريبية المحمية (list)
echo [5] تشغيل واجهة المنصة البنكية في المتصفح (npm run dev)
echo [6] كتابة أمر يدوي مخصص (Custom Command)
echo [0] خروج
echo.
echo ================================================================
set /p choice="اختر رقماً من القائمة (0-6): "

if "%choice%"=="1" goto cmd_help
if "%choice%"=="2" goto cmd_protect
if "%choice%"=="3" goto cmd_verify
if "%choice%"=="4" goto cmd_list
if "%choice%"=="5" goto cmd_dev
if "%choice%"=="6" goto cmd_custom
if "%choice%"=="0" exit
goto menu

:cmd_help
cls
node bin\shieldcode.js --help
echo.
pause
goto menu

:cmd_protect
cls
echo.
echo --- تجربة حقن رمز الحماية في رسالة بنكية ---
echo.
set /p phone="أدخل رقم الحساب أو الهاتف (افتراضي: 0555123456): "
if "%phone%"=="" set phone=0555123456
set /p msg="أدخل نص الرسالة (افتراضي: رمز التحقق OTP هو 889102): "
if "%msg%"=="" set msg=رمز التحقق OTP هو 889102
cls
node bin\shieldcode.js protect --user %phone% --msg "%msg%"
echo.
pause
goto menu

:cmd_verify
cls
echo.
echo --- فحص واكتشاف رسائل التصيد الاحتيالي ---
echo.
echo [A] فحص رسالة شرعية أصلية تحمل الرمز
echo [B] فحص رسالة تصيد مزورة بدون الرمز
echo.
set /p vchoice="اختر (A أو B): "
if /i "%vchoice%"=="A" (
    cls
    node bin\shieldcode.js verify --user 0555123456 --msg "[رمزك: AYOUB2026] رمز التحقق هو 889102"
) else (
    cls
    node bin\shieldcode.js verify --user 0555123456 --msg "Alert: تم تعليق حسابك اضغط الرابط http://fake-link"
)
echo.
pause
goto menu

:cmd_list
cls
node bin\shieldcode.js list
echo.
pause
goto menu

:cmd_dev
cls
echo جاري تشغيل سيرفر المنصة...
start http://localhost:3000
npm run dev
pause
goto menu

:cmd_custom
cls
echo اكتب الأمر مباشرة بعد كلمة node bin\shieldcode.js
echo مثال: set --user 0555123456 --code AYOUB2026
echo.
set /p userargs="node bin\shieldcode.js "
cls
node bin\shieldcode.js %userargs%
echo.
pause
goto menu
