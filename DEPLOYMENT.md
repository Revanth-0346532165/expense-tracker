# Finance Buddy - Deployment Guide

## Deploy Frontend to Vercel

### Prerequisites
- Vercel account (free at https://vercel.com)
- GitHub account (already set up)

### Steps

1. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your expense-tracker repository
   - Click "Import"

2. **Configure Environment Variables**
   - In Vercel Project Settings → Environment Variables
   - Add: `VITE_API_URL` = your backend URL (e.g., https://your-backend.railway.app)

3. **Deploy**
   - Vercel will automatically build and deploy on every push to `main`
   - Your site will be available at `https://<project-name>.vercel.app`

## Deploy Backend to Railway

### Prerequisites
- Railway account (free at https://railway.app)

### Steps

1. **Connect Railway to GitHub**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Install Railway GitHub app
   - Select `expense-tracker` repository

2. **Configure Build & Deploy**
   - Set Start Command: `node server/index.js`
   - Set build command (if needed): `npm ci --legacy-peer-deps`

3. **Add Environment Variables**
   - In Railway, add any required environment variables
   - Your backend will be available at the Railway-provided URL

4. **Update Frontend Environment Variable**
   - Go back to Vercel project settings
   - Update `VITE_API_URL` with your Railway backend URL
   - Redeploy frontend

## Alternative: Deploy Both to Railway

Railway can host both frontend (static) and backend:

1. Create a new Railway project
2. Add GitHub repository
3. Deploy as a monorepo with:
   - SPA (static) for frontend (`dist/` folder)
   - Node service for backend (`server/index.js`)

## GitHub Actions Automation

Once secrets are configured:
- Every push to `main` automatically deploys frontend to Vercel
- Every push to `main` automatically deploys backend to Railway

### Required Secrets (for GitHub Actions)

Add these to your GitHub repository settings → Secrets:

**For Vercel:**
- `VERCEL_TOKEN` - Get from Vercel Account Settings
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Project ID from Vercel dashboard

**For Railway:**
- `RAILWAY_TOKEN` - Get from Railway Account Settings

## Recommended Setup

1. **Frontend**: Vercel (optimized for React/Vite, CDN, free tier)
2. **Backend**: Railway (Node.js support, free tier, easy database integration)

This gives you:
- Fast frontend delivery
- Scalable backend
- Automatic deployments on push
- Free tier for both services
