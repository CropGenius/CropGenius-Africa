@echo off
REM WhatsApp Integration Database Setup for Windows
REM Run this to create the necessary tables for WhatsApp farming assistant

echo 🚀 Setting up WhatsApp Integration Database Tables...

REM Check if Supabase CLI is available
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found. Please install it first:
    echo npm install -g supabase
    pause
    exit /b 1
)

REM Run the migration
echo 📊 Creating farmer_interactions and farmer_profiles tables...
supabase db push

REM Check if migration was successful
if %errorlevel% equ 0 (
    echo ✅ WhatsApp Integration Database Setup Complete!
    echo.
    echo 📋 Tables Created:
    echo   - farmer_interactions ^(for WhatsApp message tracking^)
    echo   - farmer_profiles ^(for farmer data and preferences^)
    echo.
    echo 🔐 Security Features:
    echo   - Row Level Security ^(RLS^) enabled
    echo   - Users can only access their own data
    echo   - Automatic profile creation on user signup
    echo.
    echo 🎯 Next Steps:
    echo   1. Test the WhatsApp integration in the Chat page
    echo   2. Click the WhatsApp button to activate farming assistant
    echo   3. Try the demo mode to see AI responses
    echo.
    echo 🌱 CropGenius WhatsApp Integration is now LIVE!
) else (
    echo ❌ Migration failed. Please check your Supabase connection.
    pause
    exit /b 1
)

pause