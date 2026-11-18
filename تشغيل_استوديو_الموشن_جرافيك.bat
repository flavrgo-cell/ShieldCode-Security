@echo off
chcp 65001 > nul
title ShieldCode - استوديو العرض السينمائي (Motion Graphics)
echo ========================================================
echo    🎬 جاري تشغيل استوديو فيديو العرض ShieldCode
echo ========================================================
echo.
cd /d "%~dp0shieldcode-motion"
set "TEMP=%~dp0shieldcode-motion\out\temp"
set "TMP=%~dp0shieldcode-motion\out\temp"
if not exist "%TEMP%" mkdir "%TEMP%"
if not exist "node_modules" (
    echo جاري تثبيت حزم الاستوديو لأول مرة...
    call npm install
)
echo الاستوديو سيعمل على: http://localhost:3100/ShieldCodePresentation
start "" http://localhost:3100/ShieldCodePresentation
npx remotion studio --port=3100
pause
