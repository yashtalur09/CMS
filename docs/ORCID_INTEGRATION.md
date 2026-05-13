# ORCID Integration - Quick Reference

## 🎉 What Was Implemented

This document provides a quick overview of the ORCID authentication integration. For detailed setup instructions, see [ORCID_SETUP.md](ORCID_SETUP.md).

---

## 📋 Files Created/Modified

### Backend Changes

#### **New/Modified Files:**
1. **`backend/models/User.js`**
   - Added `orcid` field (ORCID iD)
   - Added `orcidAccessToken` field (for API access)
   - Added `affiliation` field (institution/organization)
   - Made `passwordHash` optional for ORCID users

2. **`backend/routes/auth.js`**
   - Added `axios` import
   - Added `POST /api/auth/orcid/callback` endpoint
   - Exchanges authorization code for access token
   - Fetches user profile from ORCID
   - Creates or updates user in database

3. **`backend/package.json`**
   - Added `axios` dependency for HTTP requests

4. **`backend/.env.example`**
   - Added `ORCID_CLIENT_ID`
   - Added `ORCID_CLIENT_SECRET`
   - Added `ORCID_REDIRECT_URI`

### Frontend Changes

#### **New Files:**
1. **`frontend/src/components/OrcidButton.js`**
   - Reusable ORCID login button component
   - Handles redirect to ORCID authorization
   - Includes official ORCID logo

2. **`frontend/src/pages/OrcidCallback.js`**
   - Handles ORCID OAuth callback
   - Exchanges code with backend
   - Shows loading and error states
   - Redirects to dashboard on success

#### **Modified Files:**
1. **`frontend/src/pages/Login.js`**
   - Added ORCID login button
   - Added "Or continue with" divider
   - Imports OrcidButton component

2. **`frontend/src/pages/Register.js`**
   - Added ORCID registration button
   - Added "Or register with" divider
   - Imports OrcidButton component

3. **`frontend/src/App.js`**
   - Added `/auth/orcid/callback` route
   - Imports OrcidCallback component

4. **`frontend/.env.example`**
   - Added `REACT_APP_ORCID_CLIENT_ID`
   - Added `REACT_APP_ORCID_REDIRECT_URI`

---

## 🚀 Quick Setup (3 Steps)

### 1. Get ORCID Credentials
- Visit: https://orcid.org/developer-tools
- Register your application
- Get Client ID and Client Secret
- Set redirect URI: `http://localhost:3000/auth/orcid/callback`

### 2. Configure Backend
```bash
cd backend
npm install  # Installs axios
cp .env.example .env
```

Edit `backend/.env`:
```env
ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXX
ORCID_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback
```

### 3. Configure Frontend
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXX
REACT_APP_ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback
```

---

## 🔄 How It Works

```
1. User clicks "Login with ORCID" button
   ↓
2. Redirect to ORCID authorization page
   ↓
3. User authorizes application
   ↓
4. ORCID redirects back with authorization code
   ↓
5. Frontend sends code to backend /api/auth/orcid/callback
   ↓
6. Backend exchanges code for access token with ORCID
   ↓
7. Backend fetches profile data (name, affiliation)
   ↓
8. Backend creates/updates user in database
   ↓
9. Backend returns JWT token
   ↓
10. Frontend redirects to dashboard
```

---

## 📊 Database Schema Changes

### User Model - New Fields:
```javascript
{
  orcid: String,              // "0000-0002-1825-0097"
  orcidAccessToken: String,   // For API access (not returned in JSON)
  affiliation: String,        // "University of Example"
  passwordHash: {             // Now optional if orcid exists
    required: function() {
      return !this.orcid;
    }
  }
}
```

---

## 🛠️ API Endpoints

### New Backend Route:

**POST `/api/auth/orcid/callback`**

**Request:**
```json
{
  "code": "authorization_code_from_orcid",
  "role": "author"  // Optional: organizer|author|reviewer|participant
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "ORCID authentication successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Dr. Alice Smith",
      "email": "0000000218250097@orcid.user",
      "orcid": "0000-0002-1825-0097",
      "affiliation": "MIT",
      "role": "author"
    },
    "token": "jwt_token_here",
    "isNewUser": true
  }
}
```

---

## 🔐 Security Notes

### ✅ What's Secure:
- Client Secret never exposed to frontend
- ORCID access token stored securely (not in JSON responses)
- JWT tokens used for session management
- Password validation bypassed for ORCID users (no password needed)

### ⚠️ Remember:
- **Never commit `.env` files** to version control
- Use HTTPS in production
- Validate redirect URIs strictly
- Store secrets in environment variables
- Implement rate limiting on auth endpoints

---

## 🧪 Testing Checklist

- [ ] ORCID button appears on login page
- [ ] ORCID button appears on register page
- [ ] Clicking button redirects to ORCID
- [ ] Can authorize on ORCID
- [ ] Redirects back to callback page
- [ ] Shows loading state during authentication
- [ ] Creates new user in database
- [ ] Stores ORCID iD correctly
- [ ] Fetches name and affiliation
- [ ] Returns JWT token
- [ ] Redirects to correct dashboard
- [ ] Can login again with same ORCID
- [ ] Error handling works (denied access, network issues)

---

## 🐛 Common Issues

### "Invalid client credentials"
→ Check `ORCID_CLIENT_ID` and `ORCID_CLIENT_SECRET` in backend/.env

### "Redirect URI mismatch"
→ Ensure all three match exactly:
  - ORCID developer portal
  - `backend/.env`: `ORCID_REDIRECT_URI`
  - `frontend/.env`: `REACT_APP_ORCID_REDIRECT_URI`

### ORCID button doesn't work
→ Restart frontend after changing `.env` file
→ Check browser console for errors
→ Verify `REACT_APP_ORCID_CLIENT_ID` is set

### User created without name/affiliation
→ ORCID profile may be private
→ Check ORCID privacy settings
→ User can update profile manually

---

## 📚 Resources

- **Full Setup Guide:** [ORCID_SETUP.md](ORCID_SETUP.md)
- **ORCID API Docs:** https://info.orcid.org/documentation/api-tutorials/
- **OAuth Guide:** https://info.orcid.org/documentation/integration-guide/
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)

---

## 🎯 What Users Get

### Benefits of ORCID Login:
- ✅ No password to remember
- ✅ Single sign-on with ORCID account
- ✅ Auto-filled profile from ORCID
- ✅ Verified researcher identity
- ✅ Connected to academic credentials
- ✅ Easy to link publications

### User Flow:
1. Click "Login with ORCID"
2. Authorize on ORCID (once)
3. Automatically logged in
4. Profile pre-filled with ORCID data

---

## 📝 Next Steps

After basic setup, consider:

1. **Display ORCID iD on profiles**
   - Show verified badge
   - Link to ORCID profile

2. **Fetch publications from ORCID**
   - Display user's works
   - Auto-fill submission forms

3. **Link existing accounts**
   - Allow email users to add ORCID
   - Merge accounts

4. **Production deployment**
   - Switch to production ORCID API
   - Use HTTPS
   - Update redirect URIs

---

**Ready to integrate?** Follow [ORCID_SETUP.md](ORCID_SETUP.md) for detailed instructions!
