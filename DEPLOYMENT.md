# Deployment Guide

This guide will help you deploy your Photo Gallery app to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Git installed on your machine

## Step 1: Push to GitHub

1. Initialize a git repository:
```bash
git init
git add .
git commit -m "Initial commit: Photo Gallery app"
```

2. Create a new repository on GitHub (don't initialize with README)

3. Add the remote and push:
```bash
git remote add origin https://github.com/yourusername/photo-gallery-app.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project? **N**
   - What's your project's name? **photo-gallery-app**
   - In which directory is your code located? **./**
   - Want to override the settings? **N**

### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Click "Deploy"

## Step 3: Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click on "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Environment Variables

This app doesn't require any environment variables for basic functionality.

## Performance Optimization

The app is already optimized with:
- Next.js Image optimization
- Tailwind CSS for minimal bundle size
- Client-side image compression
- Lazy loading

## Monitoring

- Check deployment status in Vercel dashboard
- View analytics and performance metrics
- Monitor function invocations and errors

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure Node.js version compatibility (18+)
- Review build logs in Vercel dashboard

### Runtime Errors
- Check browser console for client-side errors
- Review function logs in Vercel dashboard
- Ensure image uploads work correctly

### Performance Issues
- Monitor Core Web Vitals in Vercel Analytics
- Optimize image sizes before upload
- Consider implementing image compression

## Updates

To update your deployed app:

1. Make changes locally
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Update: description of changes"
git push
```

3. Vercel will automatically redeploy

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Issues](https://github.com/yourusername/photo-gallery-app/issues)
