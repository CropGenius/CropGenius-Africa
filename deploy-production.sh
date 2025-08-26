#!/bin/bash
# 🚀 CropGenius Production Deployment Validation
echo "🌾 CROPGENIUS PRODUCTION DEPLOYMENT - VERCEL READY"
echo "================================================="

# Check for required environment variables
echo "🔍 Validating environment variables..."
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ VITE_SUPABASE_URL not set"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ VITE_SUPABASE_ANON_KEY not set"
    exit 1
fi

echo "✅ Environment variables configured"

# Validate build process
echo "🏗️ Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Production build failed"
    exit 1
fi

echo "✅ Production build successful"

# Check auth system integrity
echo "🔐 Validating auth system..."
node validate-auth-fixes.js

if [ $? -ne 0 ]; then
    echo "❌ Auth validation failed"
    exit 1
fi

echo "✅ Auth system validated"

# Check Vercel configuration
echo "🚀 Validating Vercel configuration..."
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found"
    exit 1
fi

echo "✅ Vercel configuration present"

echo ""
echo "🎉 CROPGENIUS IS PRODUCTION READY!"
echo ""
echo "Deploy commands:"
echo "  vercel --prod    # Deploy to production"
echo "  vercel           # Deploy to preview"
echo ""
echo "Post-deployment checklist:"
echo "  ✅ Verify auth flows work in production"
echo "  ✅ Check Supabase dashboard redirect URLs"
echo "  ✅ Configure custom SMTP provider"
echo "  ✅ Monitor auth success rates"