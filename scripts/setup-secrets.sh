#!/bin/bash

# 🔑 Mo'edim GitHub Secrets Setup Script
echo "🔑 Setting up GitHub Secrets for Mo'edim Automated Deployment"
echo "============================================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Installing..."
    echo "Please install GitHub CLI: https://cli.github.com/"
    echo "Then run: gh auth login"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub first:"
    echo "gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Function to add secret
add_secret() {
    local secret_name=$1
    local secret_description=$2

    echo "📝 Setting up: $secret_name"
    echo "   Description: $secret_description"
    read -p "   Enter value: " -s secret_value
    echo ""

    if [ -n "$secret_value" ]; then
        gh secret set "$secret_name" --body "$secret_value"
        echo "✅ $secret_name added successfully"
    else
        echo "⚠️  Skipping $secret_name (empty value)"
    fi
    echo ""
}

echo "🚂 Railway Secrets"
echo "=================="
echo "1. Go to https://railway.app"
echo "2. Sign up with GitHub account (mrterryt40)"
echo "3. Create project from mrterryt40/moedim repo"
echo "4. Get your Railway token from Account Settings → Tokens"
echo ""

add_secret "RAILWAY_TOKEN" "Railway API token for deployment"

echo "⚡ Vercel Secrets"
echo "================"
echo "1. Go to https://vercel.com"
echo "2. Sign up with GitHub account (mrterryt40)"
echo "3. Import project from mrterryt40/moedim repo"
echo "4. Get your token from Account Settings → Tokens"
echo ""

add_secret "VERCEL_TOKEN" "Vercel API token for deployment"
add_secret "VERCEL_ORG_ID" "Vercel organization ID"
add_secret "VERCEL_PROJECT_ID" "Vercel project ID"

echo "🌐 Production URLs (add after first deployment)"
echo "==============================================="
add_secret "RAILWAY_API_URL" "Production Railway API URL (e.g., https://moedim-api.up.railway.app)"
add_secret "VERCEL_PROJECT_URL" "Production Vercel web URL (e.g., https://moedim.vercel.app)"

echo ""
echo "🎉 GitHub Secrets Setup Complete!"
echo "=================================="
echo ""
echo "✅ Next steps:"
echo "1. Push code to trigger automated deployment:"
echo "   git push origin main"
echo ""
echo "2. Watch deployment progress:"
echo "   https://github.com/mrterryt40/moedim/actions"
echo ""
echo "3. Update URLs after first deployment (if you didn't add them above)"
echo ""
echo "🚀 Your Mo'edim platform will be live in ~8 minutes!"