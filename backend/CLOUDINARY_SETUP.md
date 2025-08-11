# Cloudinary Setup Guide

To store actual Cloudinary image URLs instead of placeholder URLs, you need to configure Cloudinary in your environment variables.

## Steps to Set Up Cloudinary:

### 1. Create a Cloudinary Account
- Go to [https://cloudinary.com/](https://cloudinary.com/)
- Sign up for a free account
- Verify your email

### 2. Get Your Cloudinary Credentials
After signing in to your Cloudinary dashboard:
- Go to **Dashboard**
- Copy your **Cloud Name**
- Copy your **API Key**
- Copy your **API Secret**

### 3. Configure Environment Variables
Create a `.env` file in your backend directory (if it doesn't exist) and add:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Replace the values with your actual Cloudinary credentials.

### 4. Restart Your Server
After adding the environment variables, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm start
# or
node server.js
```

### 5. Test Image Upload
Now when you upload images through the product creation form, they will be:
- Uploaded to Cloudinary
- Stored with actual Cloudinary URLs in MongoDB
- Optimized and transformed automatically
- Securely served via HTTPS

## What Changed:
- ✅ Images are now uploaded to Cloudinary instead of using placeholder URLs
- ✅ Real Cloudinary URLs are stored in the database
- ✅ Images are optimized and transformed automatically
- ✅ Better error handling for missing Cloudinary configuration
- ✅ Secure HTTPS URLs for all uploaded images

## Troubleshooting:
If you see "Image upload service not configured" error:
1. Check that your `.env` file exists in the backend directory
2. Verify that all three Cloudinary environment variables are set
3. Make sure there are no extra spaces or quotes in the values
4. Restart your server after making changes

## Free Tier Limits:
Cloudinary's free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- 25,000 transformations per month
- Perfect for development and small projects
