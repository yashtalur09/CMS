# Google Authentication Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Authentication Failed - An error occurred during authentication"

This error typically occurs due to one of the following reasons:

---

## ✅ Solution 1: Verify Google Cloud Console Configuration (MOST COMMON)

### Step-by-Step Instructions:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID:
     - Client ID: `653031296442-rrfbk5bri1s0r3omrhqvbagj7n4a7llh.apps.googleusercontent.com`

3. **Check Authorized Redirect URIs**
   
   Under **Authorized redirect URIs**, you MUST have **EXACTLY**:
   ```
   http://localhost:3000/auth/google/callback
   ```
   
   ⚠️ **Critical Requirements:**
   - No trailing slash
   - Exact URL: `http://localhost:3000/auth/google/callback`
   - Port must be 3000
   - Must use `http://` (not `https://`) for localhost

4. **Check Authorized JavaScript Origins**
   
   You should also have:
   ```
   http://localhost:3000
   ```

5. **Save Changes**
   - Click **SAVE** at the bottom
   - Wait 5-10 minutes for changes to propagate

---

## ✅ Solution 2: Verify Environment Variables

### Backend `.env` (d:\5th sem EL\CMF\CMS\backend\.env)
```env
GOOGLE_CLIENT_ID=653031296442-rrfbk5bri1s0r3omrhqvbagj7n4a7llh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Frontend `.env` (d:\5th sem EL\CMF\CMS\frontend\.env)
```env
REACT_APP_GOOGLE_CLIENT_ID=653031296442-rrfbk5bri1s0r3omrhqvbagj7n4a7llh.apps.googleusercontent.com
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

✅ **Both files are currently configured correctly!**

---

## ✅ Solution 3: Restart Both Servers

After making changes to `.env` files or Google Cloud Console:

### 1. Stop both servers (Ctrl+C in each terminal)

### 2. Restart Backend:
```powershell
cd "d:\5th sem EL\CMF\CMS\backend"
npm start
```

### 3. Restart Frontend:
```powershell
cd "d:\5th sem EL\CMF\CMS\frontend"
npm start
```

---

## ✅ Solution 4: Clear Browser Cache & Cookies

1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Clear:
   - **Local Storage** for `http://localhost:3000`
   - **Cookies** for `localhost` and `accounts.google.com`
4. Close and reopen the browser

---

## ✅ Solution 5: Check Browser Console for Detailed Errors

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try logging in with Google again
4. Look for detailed error messages:
   - Red error messages
   - Network errors
   - CORS errors

Common console errors and their solutions:

### Error: "redirect_uri_mismatch"
**Solution:** The redirect URI in Google Cloud Console doesn't match. Follow Solution 1.

### Error: "invalid_client"
**Solution:** Google Client ID or Secret is incorrect. Check your `.env` files.

### Error: "Network Error" or "ERR_CONNECTION_REFUSED"
**Solution:** Backend server is not running or not accessible.
- Check if backend is running on port 5000
- Run: `netstat -ano | findstr :5000`

### Error: "CORS policy"
**Solution:** Already configured correctly, but restart servers if you see this.

---

## ✅ Solution 6: Test the Authentication Flow

### Manual Test Steps:

1. **Test Backend Health:**
   ```powershell
   curl http://localhost:5000/api/health
   ```
   Expected: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend Access:**
   - Open: http://localhost:3000
   - Should load the application

3. **Check Network Tab During Login:**
   - Open DevTools → Network tab
   - Click "Continue with Google"
   - Watch for:
     - Redirect to `accounts.google.com` ✅
     - Redirect back to `localhost:3000/auth/google/callback` ✅
     - POST request to `http://localhost:5000/api/auth/google/callback` ✅
     - Response with token ✅

---

## 📝 Debugging Checklist

- [ ] Google Cloud Console has exact redirect URI: `http://localhost:3000/auth/google/callback`
- [ ] Waited 5-10 minutes after saving Google Cloud Console changes
- [ ] Both `.env` files have correct Google credentials
- [ ] Backend server is running on port 5000
- [ ] Frontend server is running on port 3000
- [ ] Browser cache and cookies cleared
- [ ] No CORS errors in browser console
- [ ] Internet connection is working

---

## 🔍 Still Not Working?

### Check Browser Console Logs:

The updated GoogleCallback component now logs detailed error information. Check the console for:

```javascript
Google callback error: [error object]
Error details: {
  status: [HTTP status code],
  data: [response data],
  message: [error message]
}
```

### Check Backend Logs:

Look at the terminal running the backend for error messages like:
- `Google authentication error:`
- Stack traces
- Token exchange errors

---

## 📞 Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| "No authorization code received from Google" | Google didn't return a code. Check redirect URI in Google Console. |
| "Failed to retrieve access token from Google" | Google rejected the token exchange. Check Client ID and Secret. |
| "Failed to retrieve Google ID" | Google API response is missing data. Check OAuth scopes. |
| "Malformed auth code" | The authorization code is invalid or expired. Try logging in again. |

---

## 🎯 Quick Fix (Most Likely Solution)

**The #1 most common issue is the redirect URI mismatch in Google Cloud Console.**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Add or update **Authorized redirect URIs** to: `http://localhost:3000/auth/google/callback`
4. Click **SAVE**
5. Wait 5 minutes
6. Try again

---

## Need More Help?

If you're still experiencing issues after following this guide, please provide:
1. Browser console error messages
2. Backend terminal error logs
3. Screenshot of Google Cloud Console OAuth configuration
