#!/bin/bash

# WhatsApp Integration Database Setup
# Run this to create the necessary tables for WhatsApp farming assistant

echo "🚀 Setting up WhatsApp Integration Database Tables..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Run the migration
echo "📊 Creating farmer_interactions and farmer_profiles tables..."
supabase db push

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "✅ WhatsApp Integration Database Setup Complete!"
    echo ""
    echo "📋 Tables Created:"
    echo "  - farmer_interactions (for WhatsApp message tracking)"
    echo "  - farmer_profiles (for farmer data and preferences)"
    echo ""
    echo "🔐 Security Features:"
    echo "  - Row Level Security (RLS) enabled"
    echo "  - Users can only access their own data"
    echo "  - Automatic profile creation on user signup"
    echo ""
    echo "🎯 Next Steps:"
    echo "  1. Test the WhatsApp integration in the Chat page"
    echo "  2. Click the WhatsApp button to activate farming assistant"
    echo "  3. Try the demo mode to see AI responses"
    echo ""
    echo "🌱 CropGenius WhatsApp Integration is now LIVE!"
else
    echo "❌ Migration failed. Please check your Supabase connection."
    exit 1
fi