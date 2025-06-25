# Deployment Guide

## Backend Deployment (Render)

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub.

### 2. Deploy on Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your repository
5. Configure the service:
   - **Name**: `app-quiz-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Environment Variables

In the Render dashboard, add these environment variables:

- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will set this automatically)
- `JWT_SECRET`: Generate a random secret (e.g., use a password generator)
- `DATABASE_URL`: Your Supabase connection string

### 4. Get Your Backend URL

After deployment, you'll get a URL like: `https://app-quiz-backend.onrender.com`

## Frontend Deployment (Netlify)

### 1. Update API URL

1. Edit `frontend/netlify.toml`
2. Replace `https://your-backend-app.onrender.com` with your actual Render URL

### 2. Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Deploy!

### 3. Update CORS Settings

1. Edit `backend/server.js`
2. Replace `https://your-frontend-app.netlify.app` with your actual Netlify URL
3. Redeploy the backend

## Environment Variables Summary

### Backend (Render)

```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-random-secret-here
DATABASE_URL=your-supabase-connection-string
```

### Frontend (Netlify)

```
VITE_API_URL=https://your-backend-app.onrender.com
```

## Post-Deployment Steps

1. Test user registration/login
2. Test question creation/editing
3. Test the game functionality
4. Check that all API calls work correctly

## Troubleshooting

### Common Issues:

- **CORS errors**: Make sure frontend URL is added to backend CORS settings
- **Database connection**: Verify Supabase connection string is correct
- **API calls failing**: Check that VITE_API_URL is set correctly
- **Build failures**: Ensure all dependencies are in package.json

### Logs:

- **Backend logs**: Check Render dashboard → Logs
- **Frontend logs**: Check Netlify dashboard → Functions → Deploy logs
