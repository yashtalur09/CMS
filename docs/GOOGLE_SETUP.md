# Google OAuth Integration Setup Guide

## Overview

This guide provides detailed instructions for integrating Google Sign-In into the Conference Management System (CMS). Google OAuth provides a secure, familiar authentication method that allows users to sign in with their existing Google accounts.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Google OAuth Credentials](#getting-google-oauth-credentials)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Configuration](#frontend-configuration)
5. [Testing the Integration](#testing-the-integration)
6. [How Google Sign-In Works](#how-google-sign-in-works)
7. [Troubleshooting](#troubleshooting)
8. [Production Considerations](#production-considerations)

---

## Prerequisites

Before starting, ensure you have:
- A working CMS installation (see [QUICKSTART.md](QUICKSTART.md))
- Node.js v16+ installed
- MongoDB running
- A Google account (Gmail)

---

## Getting Google OAuth Credentials

### Step 1: Create a Google Cloud Project

1. **Visit Google Cloud Console:**
   - Go to https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project:**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: "Conference Management System" (or your preferred name)
   - Click "Create"
   - Wait for project creation to complete

3. **Select Your Project:**
   - Make sure your new project is selected in the dropdown

### Step 2: Enable Google+ API

1. **Navigate to APIs & Services:**
   - In the left sidebar, click "APIs & Services" → "Library"

2. **Search for Google+ API:**
   - Search for "Google+ API" or "Google People API"
   - Click on it and click "Enable"

### Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen:**
   - In the left sidebar, click "APIs & Services" → "OAuth consent screen"

2. **Choose User Type:**
   - Select "External" (for testing with any Google account)
   - Click "Create"

3. **Fill in App Information:**
   - **App name:** Conference Management System
   - **User support email:** Your email address
   - **App logo:** (Optional) Upload a logo
   - **App domain:** http://localhost:3000 (for development)
   - **Authorized domains:** localhost (for development)
   - **Developer contact information:** Your email address
   - Click "Save and Continue"

4. **Scopes:**
   - Click "Add or Remove Scopes"
   - Select these scopes:
     - `./auth/userinfo.email`
     - `./auth/userinfo.profile`
     - `openid`
   - Click "Update"
   - Click "Save and Continue"

5. **Test Users (for External apps):**
   - Click "Add Users"
   - Add your Gmail address and any test user emails
   - Click "Save and Continue"

6. **Summary:**
   - Review and click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials

1. **Navigate to Credentials:**
   - In the left sidebar, click "APIs & Services" → "Credentials"

2. **Create Credentials:**
   - Click "Create Credentials" → "OAuth client ID"

3. **Configure OAuth Client:**
   - **Application type:** Web application
   - **Name:** CMS Web Client
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/auth/google/callback
     ```
   - Click "Create"

4. **Save Your Credentials:**
   After creation, you'll see:
   - **Client ID:** `XXXXX.apps.googleusercontent.com`
   - **Client Secret:** `XXXXXX`
   
   ⚠️ **IMPORTANT:** Download the JSON or copy these credentials securely. Never commit them to version control.

---

## Backend Configuration

### Step 1: Environment Variables

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create .env file (if not exists):**
   ```bash
   copy .env.example .env
   ```

3. **Edit `backend/.env` and add Google credentials:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cms
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRES_IN=7d
   NODE_ENV=development

   # ORCID OAuth Configuration
   ORCID_CLIENT_ID=your_orcid_client_id_here
   ORCID_CLIENT_SECRET=your_orcid_client_secret_here
   ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=XXXXX.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=XXXXXX
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   ```

4. **Replace the placeholders:**
   - `GOOGLE_CLIENT_ID`: Your Client ID from Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: Your Client Secret
   - `GOOGLE_REDIRECT_URI`: Must match exactly what you registered

### Step 2: Verify Backend Files

Ensure these files have been updated (already done if you followed this guide):

- ✅ `backend/models/User.js` - Updated with Google fields
- ✅ `backend/routes/auth.js` - Added Google callback endpoint
- ✅ `backend/package.json` - Includes `axios` dependency

---

## Frontend Configuration

### Step 1: Environment Variables

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Create .env file (if not exists):**
   ```bash
   copy .env.example .env
   ```

3. **Edit `frontend/.env` and add Google Client ID:**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api

   # ORCID OAuth Configuration
   REACT_APP_ORCID_CLIENT_ID=your_orcid_client_id_here
   REACT_APP_ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback

   # Google OAuth Configuration
   REACT_APP_GOOGLE_CLIENT_ID=XXXXX.apps.googleusercontent.com
   REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   ```

4. **Important Notes:**
   - The `REACT_APP_GOOGLE_CLIENT_ID` should match your backend's `GOOGLE_CLIENT_ID`
   - The redirect URI must match exactly what's in backend and Google Console
   - Client Secret is NEVER in frontend - it stays on backend only

### Step 2: Verify Frontend Files

Ensure these files exist (already created if you followed this guide):

- ✅ `frontend/src/components/GoogleButton.js` - Google sign-in button
- ✅ `frontend/src/pages/GoogleCallback.js` - Callback handler
- ✅ `frontend/src/pages/Login.js` - Updated with Google option
- ✅ `frontend/src/pages/Register.js` - Updated with Google option
- ✅ `frontend/src/App.js` - Added Google callback route

---

## Testing the Integration

### Step 1: Start the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

### Step 2: Test Google Sign-In Flow

1. **Navigate to the login page:**
   - Open http://localhost:3000/login

2. **Click "Continue with Google":**
   - You should be redirected to Google's sign-in page

3. **Sign in with Google:**
   - Enter your Google account credentials
   - You may see a warning if the app is unverified (normal for development)
   - Click "Continue" or "Advanced" → "Go to Conference Management System"

4. **Grant Permissions:**
   - Review the requested permissions (email, profile)
   - Click "Allow" or "Continue"

5. **Verify successful login:**
   - You should be redirected back to your application
   - Check that you're logged in and redirected to dashboard
   - Verify your profile shows Google information

### Step 3: Verify Database

Check MongoDB to see the user was created with Google data:

```bash
# Connect to MongoDB
mongo

# Switch to CMS database
use cms

# Find users with Google ID
db.users.find({ googleId: { $exists: true } }).pretty()
```

You should see:
- `googleId`: Your Google user ID
- `name`: Your name from Google profile
- `email`: Your Gmail address
- `profilePicture`: Your Google profile picture URL
- `role`: Selected during login (or default "author")

---

## How Google Sign-In Works

### Flow Diagram

```
User                Frontend              Backend              Google
 |                     |                     |                    |
 |--[1] Click Google-->|                     |                    |
 |                     |                     |                    |
 |<-[2] Redirect to Google]-----------------|                    |
 |                     |                     |                    |
 |--[3] Sign In]-------|---------------------|------------------>|
 |                     |                     |                    |
 |<-[4] Redirect with code]-----------------|<-------------------|
 |                     |                     |                    |
 |-----[5] Send code]->|--[6] Forward code]->|                    |
 |                     |                     |                    |
 |                     |                     |--[7] Exchange---->|
 |                     |                     |    code for token  |
 |                     |                     |                    |
 |                     |                     |<--[8] Return------|
 |                     |                     |    tokens + email  |
 |                     |                     |                    |
 |                     |                     |--[9] Fetch------->|
 |                     |                     |    user profile    |
 |                     |                     |                    |
 |                     |                     |<--[10] Return-----|
 |                     |                     |    name, picture   |
 |                     |                     |                    |
 |                     |                     |-[11] Save to DB]   |
 |                     |                     |                    |
 |                     |<--[12] Return JWT]--|                    |
 |<--[13] Redirect-----|                     |                    |
 |    to dashboard     |                     |                    |
```

### Detailed Steps

1. **User clicks "Continue with Google"**
   - Frontend redirects to Google authorization URL with:
     - `client_id`: Your application's Client ID
     - `scope`: `openid email profile`
     - `redirect_uri`: Where Google should redirect back
     - `response_type`: `code`
     - `access_type`: `offline` (to get refresh token)

2. **User authenticates on Google**
   - Google shows sign-in screen
   - User logs in with Google credentials
   - Google shows permission consent screen

3. **Google redirects back with authorization code**
   - URL: `http://localhost:3000/auth/google/callback?code=XXXXXX`

4. **Frontend sends code to backend**
   - POST to `/api/auth/google/callback`
   - Includes: `code` and optional `role`

5. **Backend exchanges code for tokens**
   - POST to `https://oauth2.googleapis.com/token`
   - Receives: `access_token`, `refresh_token`, `id_token`

6. **Backend fetches user profile**
   - GET `https://www.googleapis.com/oauth2/v2/userinfo`
   - Retrieves: email, name, picture, verified_email

7. **Backend creates/updates user in database**
   - If new user: Creates account with Google data
   - If existing (by email): Links Google account
   - If existing (by Google ID): Updates tokens

8. **Backend returns JWT token**
   - Same format as regular login
   - Contains user ID, email, role

9. **Frontend stores token and redirects**
   - Stores JWT in localStorage
   - Redirects to role-based dashboard

---

## Troubleshooting

### Issue: "Error 400: redirect_uri_mismatch"

**Cause:** The redirect URI doesn't match what's registered in Google Cloud Console

**Solution:**
1. Check `backend/.env`: `GOOGLE_REDIRECT_URI`
2. Check `frontend/.env`: `REACT_APP_GOOGLE_REDIRECT_URI`
3. Check Google Cloud Console → Credentials → Your OAuth Client → Authorized redirect URIs
4. Must be exact match: `http://localhost:3000/auth/google/callback`

### Issue: "This app isn't verified"

**Cause:** Your app is in testing mode and not verified by Google

**Solution (Development):**
1. Click "Advanced"
2. Click "Go to Conference Management System (unsafe)"
3. This is normal for development - users you add as test users won't see this

**Solution (Production):**
1. Submit app for verification in Google Cloud Console
2. Or keep it in testing mode with specific test users

### Issue: Google button doesn't redirect

**Cause:** Missing frontend environment variables

**Solution:**
1. Ensure `frontend/.env` exists and has `REACT_APP_GOOGLE_CLIENT_ID`
2. Restart frontend server (React requires restart for .env changes)
3. Clear browser cache
4. Check browser console for errors

### Issue: "Error 401: invalid_client"

**Cause:** Incorrect Client ID or Client Secret

**Solution:**
1. Verify credentials in Google Cloud Console
2. Check `backend/.env` has correct values
3. Ensure no extra spaces or quotes
4. Restart backend server after changing .env

### Issue: User created without profile picture

**Cause:** User's Google profile picture is not public or fetch failed

**Solution:**
1. This is normal - profile pictures are optional
2. Backend logs will show if picture fetch failed
3. User can upload their own picture later

### Issue: "Error: access_denied"

**Cause:** User clicked "Cancel" or denied permissions

**Solution:**
1. This is user choice - show friendly error message
2. GoogleCallback page handles this automatically
3. User can try again by clicking Google button

---

## Production Considerations

### 1. Security Best Practices

**Environment Variables:**
```env
# Use strong, unique secrets
JWT_SECRET=use-a-long-random-string-minimum-32-characters

# Use production Google credentials
GOOGLE_CLIENT_ID=prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=prod-secret-here

# HTTPS required in production
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

**Security Checklist:**
- ✅ Use HTTPS for all production URLs
- ✅ Store secrets in environment variables (never in code)
- ✅ Implement rate limiting on auth endpoints
- ✅ Add CORS restrictions
- ✅ Validate and sanitize all inputs
- ✅ Use secure session management
- ✅ Request only necessary scopes
- ✅ Handle token refresh properly

### 2. Update Google Cloud Console

1. **OAuth Consent Screen:**
   - Update App domain to production URL
   - Add production authorized domains
   - Optionally submit for verification

2. **Update redirect URIs:**
   ```
   https://yourdomain.com/auth/google/callback
   https://www.yourdomain.com/auth/google/callback (if using www)
   ```

3. **Update JavaScript origins:**
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

### 3. Token Management

**Refresh Token Handling:**

The backend stores `googleRefreshToken` which can be used to get new access tokens:

```javascript
// Example: Refresh access token when expired
const refreshGoogleToken = async (refreshToken) => {
  const response = await axios.post(
    'https://oauth2.googleapis.com/token',
    {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }
  );
  return response.data.access_token;
};
```

### 4. Privacy Policy & Terms

Google requires apps to have:
- **Privacy Policy** - How you handle user data
- **Terms of Service** - User agreement

Update these in:
- Google Cloud Console → OAuth consent screen
- Your application footer/legal pages

### 5. Verification (Optional)

For public use without test user limitations:

1. **Prepare for verification:**
   - Complete privacy policy
   - Complete terms of service
   - Have a public domain
   - Detailed app description

2. **Submit for verification:**
   - Google Cloud Console → OAuth consent screen
   - Click "Publish App"
   - Fill verification form
   - Wait for Google review (can take weeks)

### 6. Monitoring & Logging

**Add comprehensive logging:**

```javascript
// Backend logging example
console.log('[Google Auth] User authenticated:', {
  googleId: user.googleId,
  email: user.email,
  timestamp: new Date().toISOString()
});

// Use proper logging service in production
const winston = require('winston');
logger.info('Google authentication successful', { userId: user._id });
```

---

## Additional Features

### Display Google Profile Picture

Update user profile pages to show Google profile picture:

```javascript
// In profile component
{user.profilePicture && (
  <img 
    src={user.profilePicture} 
    alt={user.name}
    className="w-16 h-16 rounded-full"
  />
)}
```

### Link Existing Account with Google

The current implementation automatically links accounts by email:
- User signs up with email/password
- Later signs in with Google (same email)
- Backend links Google account to existing user

### Account Unlinking

Add endpoint to unlink Google account:

```javascript
// In backend/routes/auth.js
router.post('/unlink-google', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.passwordHash && !user.orcid) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink Google - no other authentication method available'
      });
    }
    
    user.googleId = undefined;
    user.googleAccessToken = undefined;
    user.googleRefreshToken = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Google account unlinked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unlinking Google account'
    });
  }
});
```

---

## Support and Resources

### Official Documentation
- **Google OAuth 2.0:** https://developers.google.com/identity/protocols/oauth2
- **Google Sign-In:** https://developers.google.com/identity/sign-in/web
- **People API:** https://developers.google.com/people

### CMS Documentation
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **Main README:** [README.md](README.md)
- **ORCID Setup:** [ORCID_SETUP.md](ORCID_SETUP.md)

### Getting Help
- **Google Cloud Support:** https://cloud.google.com/support
- **Stack Overflow:** Tag `google-oauth`
- **GitHub Issues:** Open an issue in the CMS repository

---

## Summary

You have successfully integrated Google Sign-In! Users can now:

✅ Sign in with their Google account
✅ Auto-fill profile information from Google
✅ Use a familiar, secure authentication method
✅ Link Google to existing email accounts

### Next Steps

1. **Test thoroughly** with different scenarios
2. **Update privacy policy** to mention Google usage
3. **Consider app verification** for public use
4. **Plan for production deployment** with HTTPS

---

**Last Updated:** December 19, 2025
**Version:** 1.0
**Maintainer:** CMS Development Team
