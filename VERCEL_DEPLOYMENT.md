# 🚀 Vercel Serverless Deployment Guide

## Overview

This guide explains how to deploy the Coffee Shop App backend to Vercel as Serverless Functions.

---

## ✅ What's Been Created

### API Functions Structure:
```
api/
├── auth/
│   ├── login.ts              # POST /api/auth/login
│   └── register.ts           # POST /api/auth/register
├── products/
│   ├── index.ts              # GET/POST/PUT/DELETE /api/products
│   ├── featured.ts           # GET /api/products/featured
│   └── search.ts             # GET /api/products/search?q=...
├── orders/
│   ├── index.ts              # GET/POST /api/orders
│   └── [id].ts               # GET/PATCH /api/orders/:id
└── user/
    ├── profile.ts            # GET/PUT /api/user/profile
    ├── change-password.ts    # POST /api/user/change-password
    └── points-history.ts     # GET /api/user/points-history
```

---

## 📋 Pre-Deployment Checklist

### 1. Database Setup (Supabase)

1. Go to https://app.supabase.com
2. Create a new project or select existing
3. Get database credentials:
   - Go to **Settings** → **Database**
   - Copy **Connection String** (Pooler mode)
   - Copy **Connection String** (Direct connection)

### 2. Cloudinary Setup (Optional for images)

1. Go to https://cloudinary.com
2. Sign up / Login
3. Get credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

---

## 🔧 Deployment Steps

### Step 1: Push Code to GitHub

```bash
# Add all new files
git add .
git commit -m "feat: Add Vercel serverless functions for backend"
git push origin main
```

### Step 2: Configure Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Import your GitHub repository
4. Select `coffee-shop-app`

### Step 3: Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

```bash
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**IMPORTANT:**
- Use **Pooler mode** for `DATABASE_URL` (port 6432)
- Use **Direct connection** for `DIRECT_URL` (port 5432)
- Add to **Production**, **Preview**, and **Development** environments

### Step 4: Deploy!

1. Click **Deploy**
2. Wait for build to complete (~2-5 minutes)
3. Your app is live! 🎉

---

## 🧪 Testing Deployment

### 1. Test Frontend

Open your Vercel URL: `https://coffee-shop-app-psi.vercel.app`

### 2. Test API Endpoints

```bash
# Test health check (should work automatically)
curl https://your-app.vercel.app/api/health

# Test login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@coffee.com","password":"userpassword"}'

# Test products
curl https://your-app.vercel.app/api/products
```

### 3. Test in Browser Console

Open browser console on your Vercel URL. You should see:
```
🔌 API Base URL: /api
```

---

## 🔍 Troubleshooting

### Error: "Function timeout after 10 seconds"

**Cause:** Database query too slow

**Solution:**
1. Add connection pooling (already configured with Supabase Pooler)
2. Optimize Prisma queries
3. Increase timeout in `vercel.json` (max 60s on paid plan)

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Error: "Cannot connect to database"

**Check:**
1. Environment variables are set correctly in Vercel
2. `DATABASE_URL` uses Pooler mode (port 6432)
3. `DIRECT_URL` uses direct connection (port 5432)
4. Database allows connections from Vercel IPs

**Test connection:**
```bash
# In Vercel Deployment Logs
# Look for Prisma connection logs
```

### Error: "Mixed Content" (HTTP vs HTTPS)

**Already fixed!** The API client now uses relative path `/api` which Vercel routes automatically.

If still seeing errors, check:
1. `.env.production` has `VITE_API_URL=/api`
2. Rebuild frontend after environment variable change

---

## 📊 Vercel Free Tier Limits

| Resource | Limit | Your Usage |
|----------|-------|------------|
| **Bandwidth** | 100GB/month | ✅ ~1GB for coffee shop |
| **Serverless Executions** | 100GB-hours | ✅ ~0.5GB-hours |
| **Function Duration** | 10 seconds | ✅ Most queries <1s |
| **Build Minutes** | 6000 minutes/month | ✅ ~100 minutes/build |

**Verdict:** ✅ **Well within free tier!**

---

## 🔐 Security Best Practices

### 1. Never Commit Secrets

- ✅ `.env` files are in `.gitignore`
- ✅ Use Vercel Environment Variables
- ✅ Database credentials never in code

### 2. CORS Configuration

All API functions include CORS headers:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
```

For production, consider restricting to your domain:
```typescript
res.setHeader('Access-Control-Allow-Origin', 'https://coffee-shop-app-psi.vercel.app');
```

### 3. Rate Limiting (Optional)

Add rate limiting if needed:
```typescript
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

---

## 📈 Monitoring & Logs

### Vercel Dashboard

1. Go to your project in Vercel
2. Click **Deployments**
3. Click on latest deployment
4. View **Function Logs**

### Real-time Logs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs coffee-shop-app-psi
```

---

## 🔄 CI/CD Pipeline

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```
main branch → Production deployment
Other branches → Preview deployments
```

### Manual Redeploy

If needed:
1. Go to Vercel Dashboard
2. Select project
3. Click **Redeploy** on latest deployment

---

## 💰 Cost Estimate

### Free Tier (Current Setup)

- **Frontend Hosting:** FREE ✅
- **Backend Functions:** FREE ✅
- **Database (Supabase):** FREE ✅
- **Image Storage (Cloudinary):** FREE ✅

**Total:** **$0/month** 🎉

### If You Scale

- **Vercel Pro:** $20/month (for longer function timeouts)
- **Supabase Pro:** $25/month (for more database usage)
- **Cloudinary Plus:** $89/month (for more image storage)

**Total at scale:** ~$134/month

---

## 📝 Post-Deployment Checklist

- [ ] Test login with both user and admin accounts
- [ ] Test product browsing and search
- [ ] Test cart functionality
- [ ] Test checkout flow
- [ ] Test order creation
- [ ] Test admin dashboard
- [ ] Test order status updates
- [ ] Test profile editing
- [ ] Test on mobile devices
- [ ] Check all API logs for errors

---

## 🆘 Support

If you encounter issues:

1. **Check Vercel Deployment Logs**
   - Go to Vercel Dashboard → Deployments → View Logs

2. **Check Function Logs**
   - Look for error messages in real-time

3. **Test API Directly**
   - Use curl or Postman to test endpoints

4. **Check Database Connection**
   - Verify Supabase credentials
   - Check database is accessible

5. **Contact Support**
   - Vercel Support: https://vercel.com/support
   - Supabase Support: https://supabase.com/support

---

**Last Updated:** February 28, 2026
**Version:** 1.0.0
