@echo off
echo 🌱 Starting CropGenius Africa database schema fixes...

cd /d "%~dp0"

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the CropGenius Africa root directory
    pause
    exit /b 1
)

REM Check if Supabase CLI is available
where supabase > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found. Please install it first:
    echo npm install -g supabase
    pause
    exit /b 1
)

REM Link to your Supabase project
echo 🔗 Linking to Supabase project...
supabase link --project-ref bapqlyvfwxsichlyjxpd

REM Apply all pending migrations
echo 📋 Applying pending migrations...
supabase db reset --linked

REM Run the irrigation type migration
echo 🔧 Adding irrigation_type column to fields table...
supabase db push --file "supabase\migrations\20250731_add_irrigation_type.sql"

REM Deploy Edge Functions
echo 🚀 Deploying Supabase Edge Functions...
supabase functions deploy crop-disease-proxy

REM Test database connection
echo 🔍 Testing database connection...
supabase db test

echo ✅ Database schema fixes completed successfully!
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Test field creation
echo 3. Test disease detection
echo 4. Test WhatsApp integration
pause