#!/bin/bash

# Mo'edim Deployment Testing Script
echo "🚀 Testing Mo'edim Deployment..."

# Test local API first
echo "📍 Testing Local API..."
LOCAL_API="http://localhost:3000"

echo "Testing local Torah endpoint..."
curl -s "$LOCAL_API/torah/daily" > /dev/null && echo "✅ Local API: Working" || echo "❌ Local API: Failed"

echo "Testing local health endpoint..."
curl -s "$LOCAL_API/" > /dev/null && echo "✅ Local Health: Working" || echo "❌ Local Health: Failed"

# Test production API (update URL after Railway deployment)
echo "📍 Testing Production API..."
PROD_API="https://moedim-production.up.railway.app"  # Update this URL

echo "Testing production Torah endpoint..."
curl -s "$PROD_API/torah/daily" > /dev/null && echo "✅ Production API: Working" || echo "❌ Production API: Not deployed yet"

echo "Testing production health endpoint..."
curl -s "$PROD_API/" > /dev/null && echo "✅ Production Health: Working" || echo "❌ Production Health: Not deployed yet"

# Detailed API response test
echo "📊 API Response Details:"
echo "Local Torah Response:"
curl -s "$LOCAL_API/torah/daily" | jq '.nameEnglish, .nameHebrew, .hebrewDate, .isSabbath' 2>/dev/null || echo "jq not available, showing raw response:"
curl -s "$LOCAL_API/torah/daily"

echo ""
echo "🎯 Next Steps:"
echo "1. Deploy to Railway: railway.app"
echo "2. Deploy to Vercel: vercel.com"
echo "3. Update PROD_API URL in this script"
echo "4. Run this script again to verify deployments"