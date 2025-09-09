# Car Rental Pro - Deployment Guide

## Connecting Vercel Frontend to Render Backend

### Backend Deployment on Render

#### 1. Prepare Your Repository
- Push your code to GitHub/GitLab
- Ensure all changes are committed

#### 2. Create PostgreSQL Database on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "PostgreSQL"
3. Configure your database:
   - Name: `car-rental-db`
   - Region: Choose closest to your users
   - Plan: Free tier available
4. Note down the connection details provided

#### 3. Deploy Flask Backend
1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `car-rental-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free tier available

#### 4. Set Environment Variables
In your Render web service settings, add these environment variables:
```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432
FLASK_ENV=production
```

### Frontend Configuration on Vercel

#### 1. Update Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-render-backend-url.onrender.com`
   - **Environment**: Production, Preview, Development

#### 2. Redeploy Frontend
After adding the environment variable:
```bash
npx vercel --prod
```

### Testing the Connection

1. **Backend Health Check**:
   - Visit: `https://your-render-backend-url.onrender.com/`
   - Should return: "Hello from my Car Rental Website!"

2. **Frontend API Connection**:
   - Visit your Vercel app
   - Try logging in or registering
   - Check browser console for any CORS or connection errors

### Troubleshooting

#### Common Issues:

1. **CORS Errors**:
   - Ensure `flask-cors` is installed
   - Verify CORS is enabled in `app.py`

2. **Database Connection Issues**:
   - Check environment variables are set correctly
   - Verify database credentials
   - Ensure database is running

3. **API Not Found (404)**:
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check Render backend URL is accessible

4. **Build Failures**:
   - Check `requirements.txt` includes all dependencies
   - Verify Python version compatibility

### Important Notes

- **Free Tier Limitations**: Render free tier services sleep after 15 minutes of inactivity
- **Database Persistence**: Free PostgreSQL databases are deleted after 90 days
- **HTTPS**: Both Vercel and Render provide HTTPS by default
- **Environment Variables**: Never commit `.env` files to version control

### URLs After Deployment

- **Frontend (Vercel)**: `https://car-rental-cemenff9p-satti-asrith-reddys-projects.vercel.app`
- **Backend (Render)**: `https://your-render-backend-url.onrender.com`
- **Database**: Managed by Render PostgreSQL service

### Next Steps

1. Deploy backend to Render following the steps above
2. Update Vercel environment variables with your Render backend URL
3. Test the full application flow
4. Monitor logs for any issues

For support, check the logs in both Vercel and Render dashboards.