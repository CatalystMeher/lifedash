#!/bin/bash

# AI Chat Deployment Script for LifeDash
# This script helps deploy the AI chat feature to Supabase Edge Functions

set -e

echo "🚀 LifeDash AI Chat Deployment Script"
echo "====================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

# Check if project is linked by trying to get project info
if ! supabase projects list | grep -q "LINKED"; then
    echo "❌ No project linked. Please run:"
    echo "   supabase link --project-ref YOUR_PROJECT_ID"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# Check for required environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY environment variable is not set"
    echo "Please set it:"
    echo "   export OPENAI_API_KEY=your-openai-api-key"
    exit 1
fi

echo "✅ OpenAI API key is set"

# Deploy the function
echo "📦 Deploying AI chat function..."
supabase functions deploy ai-chat

# Set secrets
echo "🔐 Setting environment variables..."
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"

# Get service role key from user
echo "Please enter your Supabase service role key (found in Settings > API):"
read -s SERVICE_ROLE_KEY

if [ -n "$SERVICE_ROLE_KEY" ]; then
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
    echo "✅ Service role key set"
else
    echo "⚠️  Service role key not provided. You'll need to set it manually:"
    echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
fi

echo ""
echo "🎉 AI Chat deployment complete!"
echo ""
echo "Next steps:"
echo "1. Remove VITE_OPENAI_API_KEY from your .env.local file"
echo "2. Test the AI chat feature in your app"
echo "3. Check function logs if needed: supabase functions logs ai-chat"
echo ""
echo "For more information, see SUPABASE_AI_SETUP.md"
