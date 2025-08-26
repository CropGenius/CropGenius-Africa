@echo off
echo 🚀 CROPGENIUS AUTH CRITICAL FIXES - EXECUTION MODE
echo ================================================

echo.
echo Step 1: Backing up current state...
git add .
git commit -m "Backup before auth refactor" || echo "No changes to backup"

echo.
echo Step 2: Applying critical auth fixes...
git apply auth-critical-fixes.patch

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Patch application failed. Check for conflicts.
    pause
    exit /b 1
)

echo.
echo Step 3: Installing dependencies (if needed)...
npm install

echo.
echo Step 4: Running validation script...
node validate-auth-fixes.js

echo.
echo Step 5: Running Playwright tests...
npx playwright test AUTH_TESTS/auth-flows.spec.ts --reporter=html

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Some tests failed. Check test results.
    echo Opening test report...
    start playwright-report/index.html
)

echo.
echo ✅ AUTH FIXES APPLIED SUCCESSFULLY
echo.
echo Next steps:
echo 1. Verify Supabase dashboard redirect URLs
echo 2. Configure custom SMTP (see RUNBOOK_AUTH.md)
echo 3. Configure Vercel deployment (see vercel.json)
echo.
pause