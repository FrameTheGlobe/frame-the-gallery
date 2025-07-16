# 🚀 FrameTheGallery Deployment Guide

## Vercel Deployment Setup

### ✅ Pre-Deployment Checklist

Your app is **ready for deployment**! Here's what's already configured:

- ✅ **Build Configuration**: `vite.config.js` properly configured
- ✅ **Package Scripts**: `build`, `preview`, and `serve` commands ready
- ✅ **Vercel Config**: `vercel.json` with optimal settings
- ✅ **Static Assets**: All SVG icons and images in place
- ✅ **Farcaster Manifest**: Properly configured at `/.well-known/farcaster.json`
- ✅ **No Environment Variables**: App runs entirely client-side
- ✅ **Build Test**: Successfully builds to `dist/` folder

### 🎯 Deployment Steps

#### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: frame-the-gallery
# - Directory: ./
# - Override settings? No
```

#### Option 2: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import from GitHub: `https://github.com/FrameTheGlobe/frame-the-gallery`
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click "Deploy"

### 🔧 Vercel Configuration

The `vercel.json` includes:
- **SPA Routing**: All routes redirect to `index.html`
- **Caching Headers**: Optimized for static assets
- **Farcaster Manifest**: Proper content-type headers
- **Build Settings**: Vite framework detection

### 🌐 Post-Deployment

After deployment, you'll get a URL like: `https://frame-the-gallery-xyz.vercel.app`

#### Update Farcaster Manifest (Important!)
Once deployed, update the URLs in `public/.well-known/farcaster.json`:

```json
{
  "miniapp": {
    "iconUrl": "https://YOUR-DOMAIN.vercel.app/icon.svg",
    "homeUrl": "https://YOUR-DOMAIN.vercel.app/",
    "imageUrl": "https://YOUR-DOMAIN.vercel.app/splash.svg",
    "splashImageUrl": "https://YOUR-DOMAIN.vercel.app/splash.svg"
  }
}
```

Then redeploy or use Vercel's environment variables for dynamic URLs.

### 🎨 Custom Domain (Optional)
1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain
3. Update Farcaster manifest URLs accordingly
4. Update `accountAssociation.payload` domain in manifest

### 🧪 Testing Deployment

1. **Basic Functionality**: Visit your deployed URL
2. **Farcaster Manifest**: Check `https://your-domain.vercel.app/.well-known/farcaster.json`
3. **Portfolio Creation**: Test drag & drop upload
4. **Responsive Design**: Test on mobile devices
5. **Farcaster Integration**: Test in Farcaster client developer mode

### 🔒 Security Notes

- ✅ **No API Keys**: App is fully client-side
- ✅ **No Backend**: No server-side vulnerabilities
- ✅ **Static Assets**: All resources served statically
- ✅ **HTTPS**: Vercel provides SSL by default

### 📊 Performance Optimizations

Already included:
- **Asset Caching**: 1-year cache for static assets
- **Gzip Compression**: Automatic via Vercel
- **Image Optimization**: SVG icons for scalability
- **Code Splitting**: Vite handles automatically
- **Lazy Loading**: Images load on demand

### 🐛 Troubleshooting

**Build Fails?**
```bash
# Test build locally
npm run build
npm run preview
```

**Manifest Issues?**
- Ensure all URLs use HTTPS
- Check JSON syntax validity
- Verify domain ownership for accountAssociation

**Routing Issues?**
- SPA routing is configured in `vercel.json`
- All routes redirect to `index.html`

### 🚀 Ready to Deploy!

Your app is production-ready with:
- Portfolio-style photo galleries
- Farcaster Mini App SDK integration
- Beautiful responsive UI
- Drag & drop photo uploads
- Social sharing capabilities

No environment variables or additional configuration needed!
