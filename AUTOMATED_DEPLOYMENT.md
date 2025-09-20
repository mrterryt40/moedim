# 🤖 Mo'edim Automated Deployment Setup

## ✅ Current Status: Automated CI/CD Pipeline Ready

Your Mo'edim platform now has a **fully automated deployment pipeline** that will:
- 🧪 Test and build on every push
- 🚂 Deploy API to Railway automatically
- ⚡ Deploy web app to Vercel automatically
- 📱 Update mobile app API endpoints
- 🧪 Run production tests after deployment

---

## 🔑 Required Setup: GitHub Secrets

To enable automated deployment, you need to add these secrets in your GitHub repository:

### 1. Go to GitHub Repository Settings
1. Navigate to: `https://github.com/mrterryt40/moedim/settings/secrets/actions`
2. Click **"New repository secret"** for each secret below

### 2. Railway Secrets
```bash
# Get these from railway.app after creating account
RAILWAY_TOKEN=<your-railway-api-token>
RAILWAY_API_URL=<your-deployed-api-url>  # e.g., https://moedim-api-production.up.railway.app
```

**How to get Railway secrets:**
1. Go to: https://railway.app
2. Sign up with GitHub account
3. Create new project from `mrterryt40/moedim` repo
4. Go to Account Settings → Tokens → Generate new token
5. Copy the token for `RAILWAY_TOKEN`
6. After first deployment, copy the Railway URL for `RAILWAY_API_URL`

### 3. Vercel Secrets
```bash
# Get these from vercel.com after creating account
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
VERCEL_PROJECT_URL=<your-deployed-web-url>  # e.g., https://moedim.vercel.app
```

**How to get Vercel secrets:**
1. Go to: https://vercel.com
2. Sign up with GitHub account
3. Import project from `mrterryt40/moedim` repo
4. Go to Account Settings → Tokens → Create token
5. Copy the token for `VERCEL_TOKEN`
6. In project settings, find ORG_ID and PROJECT_ID
7. After first deployment, copy the Vercel URL for `VERCEL_PROJECT_URL`

---

## 🚀 Automated Deployment Process

Once secrets are configured, **every push to main branch will automatically:**

### 🧪 **Step 1: Test & Build** (2-3 minutes)
- Install dependencies
- Build API with NestJS
- Build mobile app for web with Expo
- Run TypeScript checks

### 🚂 **Step 2: Deploy to Railway** (2-3 minutes)
- Deploy NestJS API to Railway
- Set up PostgreSQL database
- Configure environment variables
- Start production server

### ⚡ **Step 3: Deploy to Vercel** (1-2 minutes)
- Deploy Expo web build to Vercel
- Configure CDN and routing
- Set production environment variables

### 📱 **Step 4: Update Mobile App** (30 seconds)
- Automatically update API URLs in mobile app
- Commit changes back to repository
- Mobile app now uses production API

### 🧪 **Step 5: Production Testing** (30 seconds)
- Test Railway API endpoints
- Test Vercel web app
- Verify all services are responding

**Total deployment time: ~6-8 minutes**

---

## 🎯 What Happens After Setup

### ✅ **Immediate Benefits:**
- **Zero-touch deployment**: Just push to main branch
- **Automatic testing**: Catches errors before deployment
- **Production URLs**: Get live URLs immediately
- **Mobile app sync**: API endpoints updated automatically
- **Rollback capability**: Previous versions remain accessible

### 📍 **Your Production URLs:**
After first deployment, you'll have:
- **API**: `https://moedim-api-production.up.railway.app`
- **Web**: `https://moedim.vercel.app`
- **Mobile**: Updated to use production API automatically

---

## 🔧 Quick Setup Commands

Run these after adding GitHub secrets:

```bash
# 1. Trigger first automated deployment
git add .
git commit -m "🚀 Enable automated deployment pipeline"
git push origin main

# 2. Watch deployment progress
# Go to: https://github.com/mrterryt40/moedim/actions

# 3. After ~8 minutes, test production
curl https://your-railway-url.up.railway.app/torah/daily
```

---

## 🎉 Result: Production-Ready Israelite Platform

After automated deployment completes, you'll have:

### ✅ **Live Production Services:**
- 🚂 **Railway API**: NestJS backend with PostgreSQL
- ⚡ **Vercel Web**: Expo web app globally distributed
- 📱 **Mobile App**: React Native connecting to production
- 🔄 **Auto-sync**: Mobile app always uses latest API

### ✅ **Professional Features:**
- Automated testing and deployment
- Production database with migrations
- CDN distribution for web app
- Environment-specific configurations
- Monitoring and error handling

### ✅ **Ready for Users:**
The Mo'edim platform will be **live and accessible** to the Israelite community with:
- Daily Torah readings with Hebrew calendar
- Mobile-first design for learning on the go
- Production-grade infrastructure
- Continuous deployment for rapid updates

---

## 🎯 Next Steps After Deployment

1. **Share URLs**: Platform ready for Israelite community
2. **Add features**: Automated deployment handles updates
3. **Monitor usage**: Railway and Vercel provide analytics
4. **Scale as needed**: Both platforms auto-scale

**The Mo'edim platform will be serving the Israelite community within minutes! 🏛️📱✨**