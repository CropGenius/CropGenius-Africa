#!/bin/bash

# CropGenius Africa - Database Schema Fix Script
# This script ensures all required tables and columns exist

echo "🌱 Starting CropGenius Africa database schema fixes..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the CropGenius Africa root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Link to your Supabase project
supabase link --project-ref bapqlyvfwxsichlyjxpd

# Apply all pending migrations
echo "📋 Applying pending migrations..."
supabase db reset --linked

# Run the irrigation type migration
echo "🔧 Adding irrigation_type column to fields table..."
supabase db push --file supabase/migrations/20250731_add_irrigation_type.sql

# Deploy Edge Functions
echo "🚀 Deploying Supabase Edge Functions..."
supabase functions deploy crop-disease-proxy

# Test database connection
echo "🔍 Testing database connection..."
supabase db test

echo "✅ Database schema fixes completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Test field creation"
echo "3. Test disease detection"
echo "4. Test WhatsApp integration"