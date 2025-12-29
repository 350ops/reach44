# Production Logging Guide

## How to Check Logs in Production

### Method 1: In-App Error Details (Easiest)
When an error occurs, you'll now see:
- Detailed error messages with the exact URL being called
- A "Copy Error Details" button to copy full error info
- Environment info (DEV vs PRODUCTION)

**What to do:**
1. Try to make a payment
2. If it fails, tap "Copy Error Details" in the alert
3. Paste it somewhere (Notes, email, etc.) to review

### Method 2: iOS Device Logs

**Option A: Using Xcode (Recommended)**
1. Connect your iPhone to your Mac
2. Open Xcode
3. Go to **Window → Devices and Simulators**
4. Select your device
5. Click **Open Console** button
6. Filter by your app name: `Luna` or `com.mmdev13.luna`
7. Look for logs starting with `[OrderCheckout]`

**Option B: Using Console.app**
1. Open **Console.app** on your Mac
2. Connect your iPhone
3. Select your device from the sidebar
4. Filter by: `Luna` or search for `[OrderCheckout]`

**Option C: Using Terminal (Command Line)**
```bash
# Install ios-deploy if you don't have it
npm install -g ios-deploy

# Stream logs from connected device
ios-deploy --id <device-id> --justlaunch --bundle <path-to-app> --get_bundle_id
# Or use idevicesyslog (if you have libimobiledevice)
idevicesyslog | grep -i "OrderCheckout\|luna"
```

### Method 3: Android Device Logs

**Option A: Using Android Studio**
1. Connect your Android device
2. Open Android Studio
3. Go to **View → Tool Windows → Logcat**
4. Filter by: `ReactNativeJS` or search for `OrderCheckout`

**Option B: Using ADB (Command Line)**
```bash
# Connect device and check if detected
adb devices

# Stream all logs
adb logcat

# Filter for React Native logs
adb logcat | grep -i "ReactNativeJS\|OrderCheckout"

# Filter for specific tag
adb logcat -s ReactNativeJS:* *:S

# Save logs to file
adb logcat > production_logs.txt
```

### Method 4: Using EAS Build Logs
If you're using EAS Build:
```bash
# View build logs
eas build:list

# View specific build logs
eas build:view <build-id>
```

### Method 5: Remote Logging (Future Enhancement)
Consider adding:
- **Sentry** for error tracking
- **Firebase Crashlytics** for crash reports
- **LogRocket** for session replay

## What to Look For

When checking logs, look for these key indicators:

1. **Environment Check:**
   ```
   [OrderCheckout] Environment: PRODUCTION
   ```

2. **Request URL:**
   ```
   [OrderCheckout] Request URL: https://www.reach974.com/api/create-payment-intent
   ```

3. **Response Status:**
   ```
   [OrderCheckout] Response status: 200 (or 404, 500, etc.)
   ```

4. **Error Messages:**
   ```
   [OrderCheckout] Exception caught: {...}
   [OrderCheckout] Server Error Response: {...}
   ```

## Common Issues & Solutions

### Issue: "Network request failed"
**Possible causes:**
- API not deployed to `https://www.reach974.com/api/create-payment-intent`
- CORS issues
- Network connectivity

**Solution:**
- Verify the API endpoint is accessible: `curl https://www.reach974.com/api/create-payment-intent`
- Check if API routes are deployed (Expo Router API routes need to be deployed separately)

### Issue: "404 Not Found"
**Possible causes:**
- API route not deployed
- Wrong URL path

**Solution:**
- Deploy API routes to your production server
- Verify the URL matches your deployment

### Issue: "500 Internal Server Error"
**Possible causes:**
- Missing environment variables (STRIPE_SECRET_KEY)
- Server-side error

**Solution:**
- Check server logs
- Verify environment variables are set in production

## Testing the API Directly

You can test if your API is working by running:

```bash
# Test the API endpoint
curl -X POST https://www.reach974.com/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "followers": 3000,
    "targetLink": "test",
    "platforms": "instagram"
  }'
```

If this works, the API is deployed correctly. If not, you need to deploy your API routes.

## Quick Debug Checklist

- [ ] Check console logs using one of the methods above
- [ ] Verify the URL in logs matches your production API
- [ ] Test the API endpoint directly with curl
- [ ] Check if API routes are deployed to reach974.com
- [ ] Verify environment variables are set in production
- [ ] Check network connectivity on the device

