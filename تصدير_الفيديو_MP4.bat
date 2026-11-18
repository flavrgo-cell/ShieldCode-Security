@echo off
chcp 65001 > nul
title ShieldCode - تصدير الفيديو إلى ملف MP4 (1080p)
echo ========================================================
echo    🎥 جاري تصدير فيديو العرض بدقة Full HD (MP4)
echo ========================================================
echo.
cd /d "%~dp0shieldcode-motion"
set "TEMP=%~dp0shieldcode-motion\out\temp"
set "TMP=%~dp0shieldcode-motion\out\temp"
if not exist "%TEMP%" mkdir "%TEMP%"
npx remotion render ShieldCodePresentation "../presentation/ShieldCode_Jury_Presentation.mp4" --concurrency=2
echo.
echo ✅ تم حفظ الفيديو بنجاح داخل مجلد presentation!
pause
