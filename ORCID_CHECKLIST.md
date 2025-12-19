# ✅ ORCID Integration Checklist

Use this checklist to ensure proper ORCID authentication setup.

---

## 📋 Pre-Implementation (Already Done ✅)

- [x] User model updated with ORCID fields
- [x] Auth routes created for ORCID callback
- [x] ORCID button component created
- [x] ORCID callback page created
- [x] Login page updated
- [x] Register page updated
- [x] App routes updated
- [x] Dependencies added (axios)
- [x] Environment templates updated

---

## 🔧 Setup Tasks (Your Action Required)

### 1. Get ORCID Credentials
- [ ] Visit https://orcid.org/developer-tools
- [ ] Sign in with ORCID account (or create one)
- [ ] Click "Register for the free ORCID public API"
- [ ] Fill in application details:
  - [ ] Name: Conference Management System
  - [ ] Website: http://localhost:3000
  - [ ] Redirect URI: http://localhost:3000/auth/orcid/callback
- [ ] Save your credentials securely:
  - [ ] Client ID: `APP-________________`
  - [ ] Client Secret: `____-____-____-____`

### 2. Backend Configuration
- [ ] Navigate to `backend` directory
- [ ] Run `npm install` (installs axios)
- [ ] Create `backend/.env` (copy from `.env.example` if needed)
- [ ] Open `backend/.env` in text editor
- [ ] Add/Update these values:
  ```env
  ORCID_CLIENT_ID=APP-________________
  ORCID_CLIENT_SECRET=____-____-____-____
  ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback
  ```
- [ ] Save the file

### 3. Frontend Configuration
- [ ] Navigate to `frontend` directory
- [ ] Create `frontend/.env` (copy from `.env.example` if needed)
- [ ] Open `frontend/.env` in text editor
- [ ] Add/Update these values:
  ```env
  REACT_APP_ORCID_CLIENT_ID=APP-________________
  REACT_APP_ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback
  ```
- [ ] Save the file
- [ ] **Important:** Client ID must match backend!

### 4. Start Application
- [ ] Ensure MongoDB is running
- [ ] Open Terminal 1 - Backend:
  ```bash
  cd backend
  npm run dev
  ```
- [ ] Wait for: "MongoDB Connected" and "Server running on port 5000"
- [ ] Open Terminal 2 - Frontend:
  ```bash
  cd frontend
  npm start
  ```
- [ ] Wait for browser to open at http://localhost:3000

---

## 🧪 Testing Tasks

### Basic Functionality
- [ ] Navigate to http://localhost:3000/login
- [ ] Verify "Login with ORCID" button is visible
- [ ] Button has ORCID logo (green circle with iD)
- [ ] Navigate to http://localhost:3000/register
- [ ] Verify "Register with ORCID" button is visible

### ORCID Login Flow
- [ ] Click "Login with ORCID" button
- [ ] Redirected to ORCID authorization page
- [ ] URL starts with `https://orcid.org/oauth/authorize`
- [ ] Sign in with ORCID credentials
- [ ] Click "Authorize access" button
- [ ] Redirected back to your app
- [ ] See loading screen briefly
- [ ] Redirected to dashboard
- [ ] User is logged in

### Database Verification
- [ ] Open MongoDB (mongo shell or Compass)
- [ ] Connect to database: `use cms`
- [ ] Find user: `db.users.findOne({ orcid: { $exists: true } })`
- [ ] Verify user document has:
  - [ ] `orcid` field with your ORCID iD
  - [ ] `name` field (from ORCID profile)
  - [ ] `affiliation` field (if available)
  - [ ] `email` field (generated from ORCID)
  - [ ] `role` field
  - [ ] NO `passwordHash` field

### Second Login
- [ ] Logout from application
- [ ] Click "Login with ORCID" again
- [ ] Authorize on ORCID
- [ ] Verify you're logged into same account
- [ ] Check MongoDB - user count should still be 1

---

## 🚨 Error Testing

### Test Error Scenarios
- [ ] Click ORCID login, then click "Deny access"
  - [ ] Should show error message
  - [ ] Should have "Back to Login" button
- [ ] Enter wrong Client ID in backend/.env
  - [ ] Restart backend
  - [ ] Try ORCID login
  - [ ] Should show "Invalid credentials" error
- [ ] Enter wrong Redirect URI in ORCID portal
  - [ ] Try ORCID login
  - [ ] Should show "Redirect URI mismatch" error

---

## 🎨 UI/UX Verification

### Login Page
- [ ] ORCID button below regular login form
- [ ] Divider text: "Or continue with"
- [ ] ORCID logo clearly visible
- [ ] Button responsive on mobile
- [ ] Button has hover effect

### Register Page
- [ ] ORCID button below regular registration form
- [ ] Divider text: "Or register with"
- [ ] Same styling as login page
- [ ] Works on mobile

### Callback Page
- [ ] Shows loading spinner
- [ ] Shows status message
- [ ] On error, shows red error icon
- [ ] Error message is clear
- [ ] "Back to Login" button works

---

## 🔐 Security Verification

### Backend Security
- [ ] Client Secret in backend/.env only (not in frontend)
- [ ] backend/.env NOT committed to git
- [ ] Check .gitignore includes `.env`
- [ ] ORCID access token not in API responses
- [ ] User JSON doesn't include `orcidAccessToken`

### Frontend Security
- [ ] frontend/.env NOT committed to git
- [ ] No secrets in browser console
- [ ] No secrets in network requests (check DevTools)
- [ ] JWT token stored in localStorage only

---

## 📚 Documentation Review

- [ ] Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- [ ] Read [ORCID_SETUP.md](ORCID_SETUP.md) - especially troubleshooting
- [ ] Read [ORCID_INTEGRATION.md](ORCID_INTEGRATION.md) - quick reference
- [ ] Bookmark ORCID API docs: https://info.orcid.org/documentation/

---

## 🎯 Production Preparation (For Later)

When ready to deploy to production:

### ORCID Portal Updates
- [ ] Get production ORCID credentials (not sandbox)
- [ ] Register production redirect URIs (HTTPS)
- [ ] Update application details in ORCID portal
- [ ] Test with production credentials

### Application Updates
- [ ] Change all URLs from HTTP to HTTPS
- [ ] Update ORCID_REDIRECT_URI to production URL
- [ ] Update REACT_APP_ORCID_REDIRECT_URI to production URL
- [ ] Set strong JWT_SECRET
- [ ] Use environment variables (not .env files)

### Security Hardening
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Implement logging
- [ ] Add monitoring
- [ ] Update privacy policy
- [ ] Add terms of service

---

## 🎉 Completion

Once all checkboxes above are complete:

- ✅ ORCID authentication is fully functional
- ✅ Users can login/register with ORCID
- ✅ Profile data auto-filled
- ✅ Ready for production (after production prep)

---

## 📞 Need Help?

### Common Issues
1. **"Invalid client credentials"**
   - Check CLIENT_ID and CLIENT_SECRET in backend/.env
   - Verify credentials from ORCID portal

2. **"Redirect URI mismatch"**
   - Ensure all three match EXACTLY:
     - ORCID developer portal
     - backend/.env
     - frontend/.env

3. **ORCID button doesn't redirect**
   - Restart frontend after .env changes
   - Check browser console for errors
   - Verify REACT_APP_ORCID_CLIENT_ID is set

4. **User created without name**
   - ORCID profile might be private
   - Check ORCID privacy settings
   - User can update profile manually

### Resources
- **Setup Guide:** [ORCID_SETUP.md](ORCID_SETUP.md)
- **Quick Reference:** [ORCID_INTEGRATION.md](ORCID_INTEGRATION.md)
- **ORCID Docs:** https://info.orcid.org/documentation/
- **ORCID Support:** support@orcid.org

---

**Status Tracking:**

- [ ] Setup Started
- [ ] Credentials Obtained
- [ ] Backend Configured
- [ ] Frontend Configured
- [ ] Application Running
- [ ] Basic Tests Passed
- [ ] Error Tests Passed
- [ ] UI/UX Verified
- [ ] Security Verified
- [ ] Documentation Reviewed
- [ ] **Ready for Use! 🚀**

---

*Last Updated: December 19, 2025*
