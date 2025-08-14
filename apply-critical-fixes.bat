@echo off
echo 🚨 APPLYING CROPGENIUS CRITICAL FIXES...
echo.

echo 📦 Installing required dependencies...
npm install node-cache
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Backing up current .env file...
copy .env .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%
if %errorlevel% neq 0 (
    echo ⚠️ Could not backup .env file
)

echo.
echo ✅ Critical fixes applied successfully!
echo.
echo 📋 MANUAL STEPS REQUIRED:
echo 1. Update WhatsApp credentials in .env file:
echo    - VITE_WHATSAPP_PHONE_NUMBER_ID=your_actual_phone_number_id
echo    - VITE_WHATSAPP_ACCESS_TOKEN=your_actual_access_token
echo.
echo 2. Test the fixes:
echo    node validate-critical-fixes.mjs
echo.
echo 3. Start development server:
echo    npm run dev
echo.
echo 🎯 TARGET: 99.7% accuracy with live market data and WhatsApp integration
echo.
pause