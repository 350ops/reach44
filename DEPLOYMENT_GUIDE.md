# API Deployment Guide

## The Problem

You're getting a **405 Method Not Allowed** error because your Expo Router API routes (`app/api/*.ts`) are not deployed to your production server.

**Expo Router API routes only work:**
- ✅ In development (Expo Go or dev client)
- ✅ When deployed separately to a server (Vercel, Netlify, etc.)
- ❌ NOT in standalone production app builds

## Solution: Deploy API Routes to Production

You need to deploy your API routes to `https://www.reach974.com`. Here are your options:

### Option 1: Deploy to Vercel (Recommended)

If `reach974.com` is hosted on Vercel:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy your API routes**:
   ```bash
   vercel --prod
   ```

3. **Or connect your GitHub repo to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect Expo Router and deploy API routes

4. **Set Environment Variables in Vercel**:
   - Go to your project settings → Environment Variables
   - Add:
     - `STRIPE_SECRET_KEY=sk_...`
     - `SMM_PANEL_API_KEY=...`
     - `STRIPE_WEBHOOK_SECRET=...`

### Option 2: Deploy API Routes as Separate Backend

Create a separate Node.js/Express server or use a serverless function platform.

### Option 3: Use Expo's Server Output (If Available)

If you're using Expo's server output feature, you may need to configure it properly.

## Quick Test

After deploying, test your API:

```bash
# Test the endpoint
curl -X POST https://www.reach974.com/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "followers": 1000,
    "targetLink": "test",
    "platforms": "instagram"
  }'
```

You should get a JSON response with `clientSecret`, not a 405 error.

## Current Status

- ✅ API routes are correctly written (`app/api/*.ts`)
- ✅ Frontend is calling the correct URL
- ❌ API routes are NOT deployed to production server
- ❌ Server is returning 405 (Method Not Allowed)

## Next Steps

1. **Deploy your API routes** using one of the options above
2. **Set environment variables** on your production server
3. **Test the endpoint** using the curl command above
4. **Try the payment flow again** in your app

## Important Notes

- The `vercel.json` file I created will help with routing if you're using Vercel
- Make sure your production server has Node.js 18+ and supports serverless functions
- Environment variables must be set on your production server, not just locally

