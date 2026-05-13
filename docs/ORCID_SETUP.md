# ORCID Integration Setup Guide

## Overview

This guide provides detailed instructions for integrating ORCID authentication into the Conference Management System (CMS). ORCID (Open Researcher and Contributor ID) provides a persistent digital identifier that distinguishes researchers and allows for secure authentication.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting ORCID OAuth Credentials](#getting-orcid-oauth-credentials)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Configuration](#frontend-configuration)
5. [Testing the Integration](#testing-the-integration)
6. [How ORCID Login Works](#how-orcid-login-works)
7. [Troubleshooting](#troubleshooting)
8. [Production Considerations](#production-considerations)

---

## Prerequisites

Before starting, ensure you have:
- A working CMS installation (see [QUICKSTART.md](QUICKSTART.md))
- Node.js v16+ installed
- MongoDB running
- An ORCID account (create one at https://orcid.org/register if needed)

---

## Getting ORCID OAuth Credentials

### Step 1: Register for ORCID Developer Tools

1. **Visit ORCID Developer Tools:**
   - Go to https://orcid.org/developer-tools
   - Sign in with your ORCID account

2. **Register Your Application:**
   - Click on "Register for the free ORCID public API"
   - Fill in the application details:
     - **Name:** Conference Management System (or your preferred name)
     - **Description:** Academic conference management platform with paper submission and review
     - **Website:** http://localhost:3000 (for development)
     - **Redirect URIs:** 
       ```
       http://localhost:3000/auth/orcid/callback
       ```
   - Accept the terms and submit

3. **Save Your Credentials:**
   After registration, you'll receive:
   - **Client ID:** e.g., `APP-XXXXXXXXXXXXXXXX`
   - **Client Secret:** e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   
   ⚠️ **IMPORTANT:** Store these credentials securely. Never commit them to version control.

### Step 2: Understand ORCID API Environments

ORCID provides two environments:

- **Sandbox (Development):** https://sandbox.orcid.org
  - For testing during development
  - Separate test accounts required
  - Register at: https://sandbox.orcid.org/register

- **Production:** https://orcid.org
  - For live applications
  - Uses real ORCID accounts
  - Follow the same registration process as above

---

## Backend Configuration

### Step 1: Install Required Dependencies

The backend needs `axios` for HTTP requests:

```bash
cd backend
npm install axios
```

### Step 2: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cd backend
   copy .env.example .env
   ```

2. **Edit `backend/.env` and add your ORCID credentials:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cms
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRES_IN=7d
   NODE_ENV=development

   # ORCID OAuth Configuration
   ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXX
   ORCID_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback
   ```

3. **Replace the placeholders:**
   - `ORCID_CLIENT_ID`: Your Client ID from ORCID
   - `ORCID_CLIENT_SECRET`: Your Client Secret from ORCID
   - `ORCID_REDIRECT_URI`: Must match exactly what you registered with ORCID

### Step 3: Verify Backend Files

Ensure these files have been updated (already done if you followed this guide):

- ✅ `backend/models/User.js` - Updated with ORCID fields
- ✅ `backend/routes/auth.js` - Added ORCID callback endpoint
- ✅ `backend/package.json` - Should include `axios` dependency

---

## Frontend Configuration

### Step 1: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cd frontend
   copy .env.example .env
   ```

2. **Edit `frontend/.env` and add your ORCID Client ID:**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api

   # ORCID OAuth Configuration
   REACT_APP_ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXX
   REACT_APP_ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback
   ```

3. **Important Notes:**
   - The `REACT_APP_ORCID_CLIENT_ID` should match your backend's `ORCID_CLIENT_ID`
   - The `REACT_APP_ORCID_REDIRECT_URI` must match exactly what's in backend and ORCID registration
   - Client Secret is NEVER exposed in frontend - it stays on the backend only

### Step 2: Verify Frontend Files

Ensure these files exist (already created if you followed this guide):

- ✅ `frontend/src/components/OrcidButton.js` - ORCID login button component
- ✅ `frontend/src/pages/OrcidCallback.js` - Callback handler page
- ✅ `frontend/src/pages/Login.js` - Updated with ORCID option
- ✅ `frontend/src/App.js` - Added ORCID callback route

---

## Testing the Integration

### Step 1: Start the Application

**Option A: Run Backend and Frontend Separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

**Option B: Run from Root (if configured)**
```bash
npm run dev
```

### Step 2: Test ORCID Login Flow

1. **Navigate to the login page:**
   - Open http://localhost:3000/login

2. **Click "Login with ORCID":**
   - You should be redirected to ORCID's authorization page

3. **Authorize the application:**
   - Sign in with your ORCID credentials
   - Click "Authorize access"
   - You'll be redirected back to your application

4. **Verify successful login:**
   - Check that you're redirected to the appropriate dashboard
   - Verify your profile shows ORCID information

### Step 3: Verify Database

Check MongoDB to see the user was created with ORCID data:

```bash
# Connect to MongoDB
mongo

# Switch to CMS database
use cms

# Find users with ORCID
db.users.find({ orcid: { $exists: true } }).pretty()
```

You should see:
- `orcid`: Your ORCID iD (e.g., "0000-0002-1825-0097")
- `name`: Pulled from ORCID profile
- `affiliation`: Your institution (if available in ORCID)
- `email`: Generated from ORCID iD
- `role`: Selected during login (or default "author")

---

## How ORCID Login Works

### Flow Diagram

```
User                Frontend              Backend              ORCID
 |                     |                     |                    |
 |--[1] Click Login--->|                     |                    |
 |                     |                     |                    |
 |<-[2] Redirect to ORCID------------------|                    |
 |                     |                     |                    |
 |--[3] Authorize------|---------------------|------------------>|
 |                     |                     |                    |
 |<-[4] Redirect with code]-----------------|<-------------------|
 |                     |                     |                    |
 |-----[5] Send code]->|--[6] Forward code]->|                    |
 |                     |                     |                    |
 |                     |                     |--[7] Exchange---->|
 |                     |                     |    code for token  |
 |                     |                     |                    |
 |                     |                     |<--[8] Return------|
 |                     |                     |    ORCID iD        |
 |                     |                     |    + token         |
 |                     |                     |                    |
 |                     |                     |--[9] Fetch------->|
 |                     |                     |    profile data    |
 |                     |                     |                    |
 |                     |                     |<--[10] Return-----|
 |                     |                     |    name, affiliation|
 |                     |                     |                    |
 |                     |                     |-[11] Save to DB]   |
 |                     |                     |                    |
 |                     |<--[12] Return JWT]--|                    |
 |<--[13] Redirect-----|                     |                    |
 |    to dashboard     |                     |                    |
```

### Detailed Steps

1. **User clicks "Login with ORCID"**
   - Frontend redirects to ORCID authorization URL with:
     - `client_id`: Your application's Client ID
     - `scope`: `/authenticate` (basic authentication)
     - `redirect_uri`: Where ORCID should redirect back
     - `state`: Optional role information

2. **User authorizes on ORCID**
   - ORCID shows authorization screen
   - User logs in and grants access

3. **ORCID redirects back with authorization code**
   - URL: `http://localhost:3000/auth/orcid/callback?code=XXXXXX`

4. **Frontend sends code to backend**
   - POST to `/api/auth/orcid/callback`
   - Includes: `code` and optional `role`

5. **Backend exchanges code for access token**
   - POST to `https://orcid.org/oauth/token`
   - Receives: `orcid` (the ORCID iD), `access_token`, `name`

6. **Backend fetches profile data (optional)**
   - GET `https://pub.orcid.org/v3.0/{orcid}/person`
   - Retrieves: Full name, affiliations, works

7. **Backend creates/updates user in database**
   - If new user: Creates account with ORCID data
   - If existing: Updates access token

8. **Backend returns JWT token**
   - Same format as regular login
   - Contains user ID, email, role

9. **Frontend stores token and redirects**
   - Stores JWT in localStorage
   - Redirects to role-based dashboard

---

## Troubleshooting

### Issue: "Invalid client credentials" error

**Cause:** Incorrect Client ID or Client Secret

**Solution:**
1. Verify credentials in ORCID developer portal
2. Check `backend/.env` has correct values
3. Ensure no extra spaces or quotes around credentials
4. Restart backend server after changing `.env`

### Issue: "Redirect URI mismatch" error

**Cause:** The redirect URI doesn't match what's registered

**Solution:**
1. Check `backend/.env`: `ORCID_REDIRECT_URI`
2. Check `frontend/.env`: `REACT_APP_ORCID_REDIRECT_URI`
3. Verify ORCID developer portal has the same URI
4. Must be exact match (including http/https, port, path)

### Issue: ORCID button doesn't redirect

**Cause:** Missing frontend environment variables

**Solution:**
1. Ensure `frontend/.env` exists and has:
   - `REACT_APP_ORCID_CLIENT_ID`
   - `REACT_APP_ORCID_REDIRECT_URI`
2. Restart frontend server (React requires restart for `.env` changes)
3. Clear browser cache

### Issue: "Cannot read property 'orcid' of undefined"

**Cause:** ORCID API response format changed or request failed

**Solution:**
1. Check backend logs for actual error
2. Verify you're using correct ORCID API endpoint
3. Test ORCID API directly with curl:
   ```bash
   curl -H "Accept: application/json" \
        https://pub.orcid.org/v3.0/0000-0002-1825-0097/person
   ```

### Issue: User created but missing name/affiliation

**Cause:** ORCID profile data not public or fetch failed

**Solution:**
1. Check ORCID privacy settings (profile must be public)
2. Backend logs will show "Could not fetch ORCID profile data"
3. User will be created with basic info (ORCID iD only)
4. User can update profile manually later

### Issue: MongoDB duplicate key error

**Cause:** ORCID iD or email already exists

**Solution:**
1. Check if user already exists:
   ```javascript
   db.users.findOne({ orcid: "0000-0002-1825-0097" })
   ```
2. If user exists, they should use existing login
3. If this is a test, delete test user:
   ```javascript
   db.users.deleteOne({ orcid: "0000-0002-1825-0097" })
   ```

---

## Production Considerations

### 1. Security Best Practices

**Environment Variables:**
```env
# Use strong, unique secrets
JWT_SECRET=use-a-long-random-string-minimum-32-characters

# Use production ORCID credentials (not sandbox)
ORCID_CLIENT_ID=APP-PROD-XXXXXXXX
ORCID_CLIENT_SECRET=prod-secret-here

# HTTPS required in production
ORCID_REDIRECT_URI=https://yourdomain.com/auth/orcid/callback
```

**Security Checklist:**
- ✅ Use HTTPS for all production URLs
- ✅ Store secrets in environment variables (never in code)
- ✅ Use production ORCID API (not sandbox)
- ✅ Implement rate limiting on auth endpoints
- ✅ Add CORS restrictions
- ✅ Validate and sanitize all inputs
- ✅ Use secure session management

### 2. Update ORCID Application Settings

1. **Log into ORCID developer portal**
2. **Update redirect URIs:**
   ```
   https://yourdomain.com/auth/orcid/callback
   https://www.yourdomain.com/auth/orcid/callback (if using www)
   ```
3. **Update website URL:** https://yourdomain.com
4. **Review privacy policy and terms of service**

### 3. Error Handling

Implement proper error logging and monitoring:

```javascript
// Backend: Add error tracking
const Sentry = require('@sentry/node');

app.post('/api/auth/orcid/callback', async (req, res) => {
  try {
    // ... existing code
  } catch (error) {
    Sentry.captureException(error);
    // ... error response
  }
});
```

### 4. Database Indexes

Add indexes for better performance:

```javascript
// In backend/models/User.js or via MongoDB
db.users.createIndex({ orcid: 1 }, { unique: true, sparse: true })
db.users.createIndex({ email: 1 }, { unique: true })
```

### 5. ORCID Token Refresh

Access tokens expire after 20 years, but for best practices:

```javascript
// Store token expiry
orcidTokenExpiry: Date

// Add refresh logic when needed
if (user.orcidTokenExpiry < Date.now()) {
  // Request new token
}
```

### 6. Testing in Sandbox First

Before production deployment:

1. **Test with ORCID Sandbox:**
   - Use https://sandbox.orcid.org
   - Create test accounts
   - Verify complete flow

2. **Test Error Scenarios:**
   - User denies access
   - Network failures
   - Invalid credentials
   - Duplicate accounts

---

## Additional Features

### Display ORCID iD on Profile

Update user profile pages to show ORCID iD:

```javascript
// In profile component
{user.orcid && (
  <div className="flex items-center">
    <img 
      src="https://orcid.org/sites/default/files/images/orcid_16x16.png" 
      alt="ORCID iD"
    />
    <a 
      href={`https://orcid.org/${user.orcid}`}
      target="_blank"
      rel="noopener noreferrer"
      className="ml-2"
    >
      {user.orcid}
    </a>
  </div>
)}
```

### Link Existing Account with ORCID

Allow users who registered with email/password to link ORCID:

```javascript
// Add new endpoint in backend/routes/auth.js
router.post('/link-orcid', auth, async (req, res) => {
  const { code } = req.body;
  // Exchange code for ORCID
  // Update user with ORCID iD
});
```

### Fetch and Display Publications

Use ORCID API to show user's publications:

```javascript
// Fetch works from ORCID
const works = await axios.get(
  `https://pub.orcid.org/v3.0/${orcid}/works`,
  {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${access_token}`
    }
  }
);
```

---

## Support and Resources

### Official Documentation
- **ORCID Public API:** https://info.orcid.org/documentation/api-tutorials/
- **OAuth Guide:** https://info.orcid.org/documentation/integration-guide/
- **API Reference:** https://pub.orcid.org/v3.0/

### CMS Documentation
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **Main README:** [README.md](README.md)
- **API Docs:** http://localhost:5000/api-docs (when implemented)

### Getting Help
- **ORCID Support:** support@orcid.org
- **GitHub Issues:** Open an issue in the CMS repository
- **Community Forum:** [Your forum link]

---

## Summary

You have successfully integrated ORCID authentication! Users can now:

✅ Login with their ORCID iD
✅ Auto-fill profile information from ORCID
✅ Maintain verified researcher identity
✅ Link publications and credentials

### Next Steps

1. **Test thoroughly** with different scenarios
2. **Update privacy policy** to mention ORCID usage
3. **Add ORCID branding** where appropriate
4. **Consider additional ORCID features** (publications, works)
5. **Plan for production deployment** with HTTPS

---

**Last Updated:** December 2025
**Version:** 1.0
**Maintainer:** CMS Development Team
