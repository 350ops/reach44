# Server Configuration Fix for 405 Error

## The Problem

Your production server at `reach974.com` has authentication middleware that's redirecting all API requests to `/api/auth/guest` before they reach your payment endpoint. This causes:

1. Request to `/api/create-payment-intent` 
2. → Redirected to `/api/auth/guest?redirectUrl=...`
3. → `/api/auth/guest` doesn't accept POST → **405 Error**

## The Solution

You need to configure your production server (Vercel/Next.js) to **bypass authentication** for the payment API routes. Here are the options:

### Option 1: Configure Vercel/Next.js Middleware (Recommended)

If you're using Next.js middleware, update your `middleware.ts` or `middleware.js` file on the server to exclude payment routes:

```typescript
// middleware.ts (on your production server)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth for payment API routes
  if (pathname.startsWith('/api/create-payment-intent') || 
      pathname.startsWith('/api/subscription-payment-intent') ||
      pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }
  
  // Your existing auth logic for other routes
  // ...
}
```

### Option 2: Update Vercel Configuration

If you're using Vercel, you may need to update your `vercel.json` to handle these routes differently:

```json
{
  "rewrites": [
    {
      "source": "/api/create-payment-intent",
      "destination": "/api/create-payment-intent",
      "headers": {
        "x-bypass-auth": "true"
      }
    },
    {
      "source": "/api/subscription-payment-intent",
      "destination": "/api/subscription-payment-intent",
      "headers": {
        "x-bypass-auth": "true"
      }
    }
  ]
}
```

### Option 3: Make Routes Public in Your Auth System

If you're using a custom auth system, you need to whitelist these endpoints:

- `/api/create-payment-intent`
- `/api/subscription-payment-intent`
- `/api/webhook` (Stripe webhooks should always be public)

### Option 4: Use a Different Subdomain/Path

Deploy the payment API routes to a different path that doesn't have auth middleware, like:
- `https://api.reach974.com/create-payment-intent`
- `https://www.reach974.com/payments/create-payment-intent`

Then update your app to use the new URL.

## How to Verify the Fix

After making the server configuration change:

```bash
# This should return JSON with clientSecret, not a redirect
curl -X POST https://www.reach974.com/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "followers": 1000,
    "targetLink": "test",
    "platforms": "instagram"
  }'
```

Expected response:
```json
{
  "clientSecret": "pi_...",
  "amount": 12000,
  "currency": "qar"
}
```

## Current Status

- ✅ API route code is correct
- ✅ Frontend is calling the right URL
- ❌ Server middleware is blocking/redirecting the request
- ❌ Need to configure server to allow public access to payment routes

## Next Steps

1. **Access your server configuration** (Vercel dashboard, server files, etc.)
2. **Update middleware/auth config** to exclude payment routes
3. **Deploy the changes**
4. **Test with curl** to verify it works
5. **Test in your app** - the payment should work now!

## Important Notes

- Payment endpoints should typically be **public** (no auth required) for guest checkout
- Webhook endpoints (`/api/webhook`) should **always** be public (Stripe needs to call them)
- You can still validate requests using other methods (rate limiting, IP whitelisting, etc.)

