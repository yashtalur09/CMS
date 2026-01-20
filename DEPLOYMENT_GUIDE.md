# 🚀 Complete Deployment Guide

This guide will help you deploy your Conference Management System with:
- **MongoDB Atlas** (Database)
- **Render** (Backend API)
- **Vercel** (Frontend)

---

## 📋 Prerequisites

Before starting, make sure you have:
- [x] Git repository pushed to GitHub
- [x] Accounts created on:
  - MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
  - Render (https://render.com)
  - Vercel (https://vercel.com)

---

## Part 1: MongoDB Atlas Setup (Database) 🗄️

### Step 1: Create MongoDB Atlas Account and Cluster

1. **Sign up/Login** to MongoDB Atlas
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Start Free" and create an account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Select **M0 FREE** tier
   - Choose a cloud provider (AWS recommended)
   - Select a region closest to your users
   - Cluster Name: `cms-cluster` (or any name you prefer)
   - Click "Create"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: `cms-admin` (or your choice)
   - Password: Generate a secure password (SAVE THIS!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm
   - ⚠️ For production, you should restrict this to specific IPs

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Driver: Node.js
   - Version: 5.5 or later
   - Copy the connection string (looks like):
     ```
     mongodb+srv://cms-admin:<password>@cms-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database password
   - Add your database name before the `?`, example:
     ```
     mongodb+srv://cms-admin:yourpassword@cms-cluster.xxxxx.mongodb.net/cms-production?retryWrites=true&w=majority
     ```

6. **Save Your Connection String**
   - Keep this connection string safe - you'll need it for Render

---

## Part 2: Backend Deployment on Render 🖥️

### Step 1: Prepare Backend for Deployment

The backend is already configured, but let's verify:

1. **Check `package.json`** - Should have:
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```
   ✅ Already configured!

2. **Verify Node Version** - Create `.node-version` file in backend folder

### Step 2: Create Render Account and Deploy

1. **Sign up/Login to Render**
   - Go to https://render.com
   - Sign up with GitHub (recommended)

2. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository
   - Select your `CMS_V2` repository

3. **Configure Web Service**
   - **Name**: `cms-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Add Environment Variables**
   Click "Advanced" and add these environment variables:

   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-connection-string-here
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   EMAIL_FROM=noreply@yourconference.com
   FRONTEND_URL=https://your-app.vercel.app
   ```

   **Important Notes:**
   - Replace `MONGODB_URI` with your Atlas connection string from Part 1
   - Generate a strong `JWT_SECRET` (at least 32 characters)
   - For Gmail, use App-Specific Password (see email setup below)
   - We'll update `FRONTEND_URL` after deploying frontend

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Once deployed, you'll get a URL like: `https://cms-backend.onrender.com`
   - **SAVE THIS URL** - you'll need it for frontend!

6. **Test Your Backend**
   - Visit: `https://your-backend-url.onrender.com/api/public/health`
   - You should see a health check response

### Email Setup for Gmail (Optional but Recommended)

If using Gmail for email notifications:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → 2-Step Verification
3. Scroll to "App passwords"
4. Generate new app password
5. Use this password in `EMAIL_PASS` environment variable

---

## Part 3: Frontend Deployment on Vercel 🌐

### Step 1: Prepare Frontend for Deployment

We need to configure the frontend to use your deployed backend:

1. **Environment Variables**
   - We'll configure this in Vercel dashboard

### Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub (recommended)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the `CMS_V2` repository

3. **Configure Project**
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

   Replace with your actual Render backend URL from Part 2!

5. **Deploy**
   - Click "Deploy"
   - Wait for build (3-5 minutes)
   - Once deployed, you'll get a URL like: `https://your-app.vercel.app`

6. **Update Backend Environment Variable**
   - Go back to Render dashboard
   - Open your backend service
   - Go to "Environment"
   - Update `FRONTEND_URL` with your Vercel URL
   - Save changes (this will redeploy)

---

## Part 4: Post-Deployment Configuration 🔧

### Step 1: Update CORS Settings

Your backend `server.js` should already have CORS configured, but verify it allows your frontend URL.

### Step 2: Test Full Application

1. **Visit your Vercel frontend URL**
2. **Test Registration**: Create a new account
3. **Test Login**: Login with your account
4. **Test API Connectivity**: Navigate through the app

### Step 3: Custom Domain (Optional)

#### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

#### For Render (Backend):
1. Go to Service Settings → Custom Domain
2. Add your custom domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed

---

## 🔐 Security Checklist

- [x] MongoDB Atlas user password is strong
- [x] JWT_SECRET is at least 32 characters
- [x] Environment variables are set in Render
- [x] CORS is configured correctly
- [x] MongoDB Network Access is configured
- [ ] (Optional) Restrict MongoDB IP access to Render's IPs
- [ ] (Optional) Set up custom domains with SSL

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Render logs: Service → Logs
- Verify all environment variables are set
- Verify MongoDB connection string is correct

**Problem**: Database connection fails
- Check MongoDB Atlas cluster is running
- Verify connection string format
- Verify database user credentials
- Check Network Access settings

**Problem**: 500 errors
- Check Render logs for specific errors
- Verify all required environment variables

### Frontend Issues

**Problem**: Can't connect to backend
- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for CORS errors
- Verify backend is running on Render

**Problem**: Build fails
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Check for syntax errors

### Free Tier Limitations

**Render Free Tier**:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

**MongoDB Atlas Free Tier**:
- 512MB storage
- Shared CPU
- Sufficient for small to medium projects

**Vercel Free Tier**:
- 100GB bandwidth/month
- Unlimited deployments
- Custom domains supported

---

## 📊 Monitoring

### Render
- View logs: Service → Logs
- View metrics: Service → Metrics
- Set up alerts: Service → Settings → Notifications

### Vercel
- View deployment logs: Deployments → Select deployment → View logs
- Analytics: Project → Analytics (Pro plan)

### MongoDB Atlas
- Metrics: Cluster → Metrics
- Real-time performance: Cluster → Real-Time

---

## 🔄 Continuous Deployment

Both Render and Vercel support automatic deployments:

1. **Push to GitHub**: 
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Automatic Deployment**:
   - Vercel: Deploys automatically on every push
   - Render: Deploys automatically on every push
   - Both can be configured to deploy only on specific branches

---

## 📝 Important URLs to Save

After deployment, save these URLs:

```
Frontend URL: https://your-app.vercel.app
Backend URL: https://cms-backend.onrender.com
MongoDB Atlas: https://cloud.mongodb.com

Render Dashboard: https://dashboard.render.com
Vercel Dashboard: https://vercel.com/dashboard
Atlas Dashboard: https://cloud.mongodb.com/
```

---

## 🎉 Next Steps

1. Share your app URL with users
2. Monitor logs for any errors
3. Set up custom domains (optional)
4. Configure email settings for notifications
5. Test all features in production
6. Set up backups for MongoDB Atlas

---

## 💡 Tips

1. **Keep Environment Variables Secure**: Never commit `.env` files to Git
2. **Monitor Your App**: Check logs regularly for errors
3. **Free Tier Limits**: Be aware of usage limits on free tiers
4. **Database Backups**: MongoDB Atlas free tier has automated backups
5. **SSL**: Both Vercel and Render provide free SSL certificates
6. **Cold Starts**: Render free tier sleeps after inactivity - first request may be slow

---

## 📞 Support

If you encounter issues:

- **Render**: https://docs.render.com
- **Vercel**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

**Good luck with your deployment! 🚀**
