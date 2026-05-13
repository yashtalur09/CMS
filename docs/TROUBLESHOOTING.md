# 🔧 Deployment Troubleshooting Guide

Complete solutions for common deployment issues.

---

## 🚨 Backend Issues (Render)

### Issue 1: "Application failed to start"

**Symptoms:**
- Render shows "Deploy failed"
- Red error in logs
- Service won't go "Live"

**Solutions:**

**A. Check Build Logs**
1. Go to Render Dashboard → Your Service → Events
2. Look for the latest deployment
3. Click "View Logs"
4. Look for errors during `npm install` or startup

**B. Common Causes:**

**Missing Environment Variable:**
```
Error: JWT_SECRET is not defined
```
**Fix:**
- Go to Environment tab
- Add `JWT_SECRET` with a value
- Click "Save Changes"

**Wrong MongoDB URI:**
```
MongoServerError: bad auth
```
**Fix:**
- Check `MONGODB_URI` format:
  ```
  mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
  ```
- Verify username and password
- Ensure password doesn't have special characters (or URL encode them)
- Add database name before the `?`

**Wrong Start Command:**
```
Error: Cannot find module 'server.js'
```
**Fix:**
- Go to Settings → Build & Deploy
- Verify Root Directory: `backend`
- Verify Start Command: `npm start`

---

### Issue 2: "Connection to MongoDB timed out"

**Symptoms:**
```
MongooseServerSelectionError: connect ETIMEDOUT
```

**Solutions:**

**A. Check IP Whitelist:**
1. MongoDB Atlas → Network Access
2. Should have entry: `0.0.0.0/0` (allow from anywhere)
3. If not, click "Add IP Address" → "Allow Access from Anywhere"

**B. Check Connection String:**
- Must start with `mongodb+srv://` (not `mongodb://`)
- Must have database name: `.mongodb.net/DATABASE_NAME?`
- Password must be correct (no `<password>` placeholder)

**C. Check Cluster Status:**
1. MongoDB Atlas → Database
2. Cluster should show "Active" (green)
3. If not, wait a few minutes or check Atlas status

---

### Issue 3: "Port already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix:**
- This shouldn't happen on Render (Render assigns ports dynamically)
- Check your code uses: `process.env.PORT` or `5000`
- Verify `PORT` environment variable is set to `5000`

---

### Issue 4: "Module not found"

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solutions:**

**A. Check package.json:**
- Make sure `express` is in `dependencies` (not `devDependencies`)
- Missing dependencies should be added:
  ```bash
  cd backend
  npm install express --save
  git add package.json package-lock.json
  git commit -m "Add express dependency"
  git push
  ```

**B. Check Build Command:**
- Settings → Build & Deploy
- Build Command should be: `npm install`

---

### Issue 5: Backend works but returns 500 errors

**Symptoms:**
- Render shows "Live"
- Frontend gets 500 errors
- API calls fail

**Solutions:**

**A. Check Render Logs in Real-Time:**
1. Render Dashboard → Your Service → Logs
2. Keep this open
3. Try the action that fails on frontend
4. Watch for errors in logs

**B. Common Causes:**

**Database Query Error:**
```
ValidationError: Path `email` is required
```
**Fix:** Check your data model and ensure required fields are provided

**Authentication Error:**
```
JsonWebTokenError: jwt malformed
```
**Fix:**
- Verify `JWT_SECRET` is set and same as used to create tokens
- Check token is being sent correctly from frontend

---

## 🌐 Frontend Issues (Vercel)

### Issue 6: "Build failed"

**Symptoms:**
- Vercel shows "Failed"
- Red error in build logs

**Solutions:**

**A. Check Build Logs:**
1. Vercel Dashboard → Your Project → Deployments
2. Click on the failed deployment
3. Read the error message

**B. Common Causes:**

**Syntax Error:**
```
Module parse failed: Unexpected token
```
**Fix:**
- Check the file mentioned in error
- Fix syntax errors
- Test locally: `npm run build`
- Commit and push

**Missing Dependencies:**
```
Module not found: Can't resolve 'react-router-dom'
```
**Fix:**
```bash
cd frontend
npm install react-router-dom --save
git add package.json package-lock.json
git commit -m "Add react-router-dom"
git push
```

**Environment Variable in Code:**
```
process.env.REACT_APP_API_URL is not defined
```
**Fix:**
- Go to Vercel → Settings → Environment Variables
- Add `REACT_APP_API_URL` with your Render URL
- Redeploy

---

### Issue 7: Frontend loads but shows blank page

**Symptoms:**
- Website loads
- Just shows blank white page
- No visible errors

**Solutions:**

**A. Check Browser Console:**
1. Press F12
2. Go to Console tab
3. Look for red errors

**B. Common Causes:**

**Wrong Root Directory:**
- Vercel Settings → General
- Root Directory should be: `frontend`
- If wrong, update and redeploy

**Build Output Missing:**
- Settings → General → Build & Output Settings
- Output Directory should be: `build`

**React Router Issue:**
- Add `vercel.json` in frontend directory:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```
- Commit and push

---

### Issue 8: "Failed to load resource: net::ERR_CONNECTION_REFUSED"

**Symptoms:**
- Browser console shows connection errors
- API calls fail
- Network tab shows failed requests

**Solutions:**

**A. Check API URL:**
1. F12 → Network tab
2. Click on a failed request
3. Check the URL it's trying to reach
4. Should be your Render URL (not localhost!)

**B. Fix:**
1. Vercel → Settings → Environment Variables
2. Find `REACT_APP_API_URL`
3. Should be: `https://your-backend.onrender.com`
4. **No trailing slash!**
5. Save and redeploy

**C. Check in Code:**
- Open `frontend/src/utils/api.js`
- Look for `baseURL` or API URL
- Should use `process.env.REACT_APP_API_URL`

---

### Issue 9: CORS Error

**Symptoms:**
```
Access to fetch at 'https://backend...' from origin 'https://frontend...' has been blocked by CORS policy
```

**Solutions:**

**A. Check Backend CORS Configuration:**
1. Open `backend/server.js`
2. Should have:
```javascript
app.use(cors());
```

**B. If You Need Specific Origins:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**C. Update Environment Variable:**
1. Render → Environment tab
2. Update `FRONTEND_URL` to your Vercel URL
3. Must be exact (including https://)
4. No trailing slash
5. Save and wait for redeploy

---

### Issue 10: 404 on Refresh

**Symptoms:**
- Website works when navigating
- Refreshing on any page except home gives 404

**Solution:**

Create `vercel.json` in `frontend` directory:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Then:
```bash
cd frontend
git add vercel.json
git commit -m "Add Vercel rewrites for SPA routing"
git push
```

Vercel will auto-redeploy.

---

## 🗄️ MongoDB Atlas Issues

### Issue 11: "Authentication failed"

**Symptoms:**
```
MongoServerError: bad auth: Authentication failed
```

**Solutions:**

**A. Reset Database Password:**
1. MongoDB Atlas → Database Access
2. Click "Edit" on your user
3. "Edit Password"
4. Generate new password → **SAVE IT**
5. Update `MONGODB_URI` in Render with new password
6. Save Changes in Render

**B. Check Username:**
- Should be the database user (not your Atlas login)
- Found in: Database Access → Username column

---

### Issue 12: "IP not whitelisted"

**Symptoms:**
```
MongoServerError: connection refused by ip whitelist
```

**Solution:**

1. MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere"
4. IP: `0.0.0.0/0`
5. Confirm

⚠️ **For production, you should restrict this to Render's IPs**

---

### Issue 13: "Database doesn't exist"

**Symptoms:**
- Connections work but no data appears
- Collections not created

**Solution:**

This is normal! MongoDB creates database/collections on first write.

**To verify:**
1. MongoDB Atlas → Database → Browse Collections
2. You should see `cms-production` database after:
   - First user registration
   - First conference creation
   - Any write operation

If you don't see it:
- Make a test registration on your frontend
- Refresh Atlas Collections view

---

## 🔄 Deployment Issues

### Issue 14: "Changes not appearing"

**Symptoms:**
- Made code changes
- Pushed to GitHub
- Website still shows old version

**Solutions:**

**For Vercel:**
1. Vercel Dashboard → Deployments
2. Check latest deployment status
3. Should say "Ready" (not "Building" or "Failed")
4. If failed, check build logs

**Force Redeploy:**
1. Vercel → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"

**For Render:**
1. Render Dashboard → Your Service → Events
2. Check latest deployment
3. Should show recent git commit

**Manual Deploy:**
1. Render → Manual Deploy
2. Click "Clear build cache & deploy"

---

### Issue 15: "Build cache issues"

**Symptoms:**
- Random build failures
- "Module not found" but module exists
- Works locally, fails on deploy

**Solutions:**

**For Render:**
1. Settings
2. Scroll to "Build & Deploy"
3. Under "Advanced", find "Clear build cache & deploy"
4. Click it

**For Vercel:**
1. Settings → General
2. Find "Build & Development Settings"
3. Click "Override" on Build Command
4. Set to: `npm ci && npm run build`
5. Save

---

## 📊 Performance Issues

### Issue 16: "Backend is slow/timing out"

**Symptoms:**
- First request takes 30-60 seconds
- Subsequent requests are fast
- Then slow again after inactivity

**Explanation:**
This is normal on Render free tier!
- Free tier "spins down" after 15 minutes of inactivity
- First request wakes it up (cold start)
- Takes 30-60 seconds

**Solutions:**

**A. Keep-Alive Service (Free):**
Create a cron job to ping your backend every 14 minutes:
- Use services like cron-job.org or UptimeRobot
- Ping: `https://your-backend.onrender.com/api/public/health`
- Interval: Every 14 minutes

**B. Upgrade to Paid Plan ($7/month):**
- Render → Your Service → Settings
- Change Instance Type to "Starter"
- No cold starts

---

### Issue 17: "Frontend is slow"

**Symptoms:**
- Pages load slowly
- Large bundle size

**Solutions:**

**A. Check Bundle Size:**
```bash
cd frontend
npm run build
```
Look at the output - should show bundle sizes.

**B. Optimize:**
1. Remove unused dependencies
2. Code splitting
3. Lazy loading routes

**C. Vercel Analytics:**
- Vercel Dashboard → Your Project → Analytics
- Check performance metrics
- Identify slow pages

---

## 🔐 Environment Variable Issues

### Issue 18: "Environment variable not working"

**Symptoms:**
- Set environment variable
- Code shows `undefined`

**Solutions:**

**For Render (Backend):**
- Variables are available immediately
- **Must restart/redeploy** after adding
- Access with: `process.env.VARIABLE_NAME`

**For Vercel (Frontend):**
- Variables **must start with** `REACT_APP_`
- Must redeploy after adding
- Access with: `process.env.REACT_APP_VARIABLE_NAME`

**Common Mistake:**
```javascript
// ❌ Wrong - missing REACT_APP_ prefix
REACT_APP_API_URL=...  // In Vercel
const url = process.env.API_URL;  // undefined!

// ✅ Correct
REACT_APP_API_URL=...  // In Vercel
const url = process.env.REACT_APP_API_URL;  // works!
```

---

## 🆘 Emergency Checklist

If everything is broken:

1. **Check Service Status:**
   - [ ] MongoDB Atlas cluster is "Active" (green)
   - [ ] Render service is "Live" (green)
   - [ ] Vercel deployment is "Ready" (green)

2. **Check Logs:**
   - [ ] Render logs show "MongoDB Connected"
   - [ ] Render logs have no red errors
   - [ ] Vercel build logs show success
   - [ ] Browser console has no red errors

3. **Check URLs:**
   - [ ] Backend URL works: `https://backend.../api/public/health`
   - [ ] Frontend URL loads
   - [ ] `REACT_APP_API_URL` in Vercel matches Render URL exactly
   - [ ] `FRONTEND_URL` in Render matches Vercel URL exactly

4. **Check Environment Variables:**
   - [ ] All variables set in Render
   - [ ] `MONGODB_URI` is correct format
   - [ ] `JWT_SECRET` is set (32+ characters)
   - [ ] `REACT_APP_API_URL` is set in Vercel
   - [ ] No trailing slashes in URLs

5. **Check MongoDB:**
   - [ ] IP whitelist includes `0.0.0.0/0`
   - [ ] Database user exists
   - [ ] Password is correct in connection string

---

## 📞 Getting Help

**Still stuck?**

1. **Check Logs First:**
   - Render logs (real-time)
   - Browser console (F12)
   - Network tab (F12 → Network)

2. **Search Error Message:**
   - Copy exact error message
   - Google: "render [error message]"
   - Or: "vercel [error message]"

3. **Documentation:**
   - Render Docs: https://render.com/docs
   - Vercel Docs: https://vercel.com/docs
   - MongoDB Atlas: https://docs.atlas.mongodb.com

4. **Community:**
   - Render Community: https://community.render.com
   - Vercel Discussions: https://github.com/vercel/vercel/discussions
   - Stack Overflow (tag: render, vercel, mongodb-atlas)

---

## ✅ Quick Diagnostic Commands

Run these locally to test before deploying:

```bash
# Test backend locally
cd backend
npm install
npm start
# Visit: http://localhost:5000/api/public/health

# Test frontend locally
cd frontend
npm install
npm run build  # Should complete without errors
npm start
# Visit: http://localhost:3000

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check Node version
node --version  # Should be 18.x or higher

# Check npm version
npm --version
```

---

**Remember: Most issues are due to typos in environment variables or URLs! Double-check everything! 🔍**
