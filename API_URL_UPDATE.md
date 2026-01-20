# 🔄 API URL Update Summary

## Changes Made

All localhost API URLs have been replaced with your production Render backend URL:
**`https://cms-backend-fjdo.onrender.com/api`**

---

## Files Updated

### 1. **frontend/src/utils/api.js**
- ✅ Updated default API URL from `http://localhost:5000/api` to `https://cms-backend-fjdo.onrender.com/api`
- This is the main API configuration file that all API calls use

### 2. **frontend/.env**
- ✅ Changed `REACT_APP_API_BASE` to `REACT_APP_API_URL`
- ✅ Set value to `https://cms-backend-fjdo.onrender.com/api`

### 3. **frontend/.env.example**
- ✅ Updated example to show production URL
- ✅ Added comments for both production and local development

### 4. **frontend/src/pages/Reviewer/ReviewPaper.js**
- ✅ Updated fallback URL from `http://localhost:5000` to `https://cms-backend-fjdo.onrender.com`

### 5. **frontend/src/pages/Reviewer/BrowseConferences.js**
- ✅ Updated fallback URL from `http://localhost:5000` to `https://cms-backend-fjdo.onrender.com`

### 6. **frontend/src/pages/Author/SubmissionDetails.js**
- ✅ Updated file URL construction to use production backend

### 7. **frontend/src/pages/Organizer/ViewSubmissions.js**
- ✅ Updated file URL construction to use production backend

---

## How It Works

The application now uses your production backend URL in two ways:

1. **Environment Variable (Recommended)**:
   ```bash
   REACT_APP_API_URL=https://cms-backend-fjdo.onrender.com/api
   ```
   - Set in `.env` file
   - Can be overridden in Vercel environment variables

2. **Fallback (Default)**:
   - If no environment variable is set, it defaults to: `https://cms-backend-fjdo.onrender.com/api`
   - This ensures the app always points to your production backend

---

## Testing

To verify the changes are working:

1. **Clear cache and rebuild**:
   ```bash
   cd frontend
   rm -rf node_modules/.cache
   npm start
   ```

2. **Check Network Tab**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Perform any action (login, register, etc.)
   - All API calls should go to: `https://cms-backend-fjdo.onrender.com/api/*`

3. **Verify in Code**:
   - Open browser console (F12)
   - Type: `process.env.REACT_APP_API_URL`
   - Should show: `https://cms-backend-fjdo.onrender.com/api`

---

## For Local Development

If you want to use localhost for local development:

1. Create `.env.local` file in `frontend` folder:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```

2. This will override the production URL only on your local machine
3. `.env.local` is gitignored, so it won't affect production

---

## For Deployment (Vercel)

When deploying to Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add or update:
   ```
   Name:  REACT_APP_API_URL
   Value: https://cms-backend-fjdo.onrender.com/api
   ```

3. Redeploy your application

---

## File Download URLs

The following features will now use the production backend for file access:

- ✅ Submission paper downloads (Author dashboard)
- ✅ Paper reviews (Reviewer dashboard)
- ✅ Paper viewing (Organizer submissions)
- ✅ Certificate downloads
- ✅ Any uploaded files

All file URLs are automatically constructed as:
```
https://cms-backend-fjdo.onrender.com/uploads/...
```

---

## Next Steps

1. **Rebuild Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Test Locally** (optional):
   ```bash
   npm start
   ```
   - Check that API calls go to Render backend
   - Test login, registration, file uploads

3. **Deploy to Vercel**:
   - Push changes to GitHub:
     ```bash
     git add .
     git commit -m "Update API URLs to production Render backend"
     git push origin main
     ```
   - Vercel will auto-deploy

4. **Verify Production**:
   - Visit your Vercel URL
   - Test all features
   - Check browser console for any errors
   - Verify API calls in Network tab

---

## Troubleshooting

### Issue: Still seeing localhost URLs
**Solution**: 
- Clear browser cache
- Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Rebuild the app: `npm run build`

### Issue: CORS errors
**Solution**: 
- Check that your Render backend has correct CORS configuration
- Verify `FRONTEND_URL` is set in Render environment variables

### Issue: 404 on API calls
**Solution**: 
- Verify backend is running: Visit `https://cms-backend-fjdo.onrender.com/api/public/health`
- Check that URL doesn't have double slashes
- Verify environment variable is set correctly

---

## Rollback (if needed)

If you need to revert to localhost:

1. Edit `frontend/.env`:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```

2. Restart the development server

---

**All Done! Your frontend now points to your production Render backend! 🎉**
