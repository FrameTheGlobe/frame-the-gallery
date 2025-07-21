# FrameTheGallery 📸

A professional photo portfolio miniapp for the Farcaster ecosystem. Create, manage, and share stunning photography portfolios with cloud storage and cross-device synchronization.

## ✨ Features

### 🎯 **Professional Portfolio Management**
- **Multiple Portfolios**: Create up to 10 portfolios with 10 photos each
- **Portfolio Metadata**: Add titles, descriptions, and organize by theme
- **Cloud Storage**: Persistent storage with Vercel Blob (images) + KV (metadata)
- **Cross-Device Sync**: Access portfolios from any device with Farcaster FID

### 📱 **Optimized Miniapp Experience**
- **Mobile-First Design**: Touch-friendly interface optimized for mobile
- **Safe Area Support**: Proper handling of device notches and home indicators
- **Performance Optimized**: Fast loading, smooth animations, efficient rendering
- **Progressive Enhancement**: Works offline with local storage fallback

### 🔗 **Farcaster Integration**
- **Native Authentication**: Seamless Farcaster FID-based user identification
- **Cast Sharing**: One-click portfolio sharing to Farcaster with rich previews
- **Public Portfolios**: Shareable URLs with view tracking and analytics
- **SDK Integration**: Built with @farcaster/miniapp-sdk for native experience

### 🛠️ **Technical Features**
- **Image Compression**: Automatic compression for Farcaster storage constraints
- **Upload Progress**: Real-time feedback during photo uploads
- **Error Handling**: Graceful fallbacks and comprehensive error management
- **Toast Notifications**: User-friendly feedback system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Vercel account (for cloud storage)
- Farcaster account (for testing)

### Local Development

```bash
# Clone the repository
git clone https://github.com/FrameTheGlobe/frame-the-gallery.git
cd frame-the-gallery

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup

Create `.env.local` with your Vercel credentials:

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token

# Vercel KV Storage
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

## 📋 Architecture

### Storage System
```
User Data Storage:
├── Vercel Blob (Images)
│   └── ${userFid}/${timestamp}_${filename}
└── Vercel KV (Metadata)
    ├── portfolios:${userFid} → Portfolio array
    ├── metadata:${userFid} → User analytics
    └── views:${userFid}:${portfolioId} → View counts
```

### Authentication Flow
```
1. Farcaster SDK → context.user.fid
2. Cloud Storage → portfolios:${fid}
3. Cross-Device Sync → Same FID = Same Data
4. Fallback → Session-based ID for testing
```

### API Endpoints
- `POST /api/upload-image` - Upload photos to Vercel Blob
- `GET /api/portfolios?userId=${fid}` - Get user's portfolios
- `POST /api/portfolios` - Save portfolio updates
- `DELETE /api/portfolios` - Delete specific portfolio
- `GET /api/portfolio/${userId}/${portfolioId}` - Public portfolio access

## 🎨 UI/UX Design

### Mobile-First Approach
- **Touch Targets**: Minimum 48px for accessibility
- **Safe Areas**: env(safe-area-inset-*) support
- **Performance**: Hardware-accelerated animations
- **Responsive**: Optimized breakpoints for all devices

### Visual Design
- **Clean Aesthetic**: Professional photojournalism theme
- **Typography**: Inter font family for readability
- **Color Scheme**: High contrast for accessibility
- **Loading States**: Smooth transitions and feedback

## 🔧 Deployment

### Vercel Deployment (Recommended)

```bash
# Deploy to Vercel
npm run build
vercel --prod

# Set up environment variables in Vercel dashboard
# Configure custom domain (optional)
```

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist/ folder to any static hosting
# Ensure API routes are configured for your platform
```

## 📱 Farcaster Integration

### Manifest Configuration
Located at `public/.well-known/farcaster.json`:

```json
{
  "miniapp": {
    "name": "FrameTheGallery",
    "url": "https://framethegallery.xyz",
    "description": "Professional photo portfolio creator",
    "iconUrl": "https://framethegallery.xyz/icon.svg"
  }
}
```

### Testing in Farcaster

1. **Deploy**: Deploy to public URL (Vercel, Netlify, etc.)
2. **Update Manifest**: Update all URLs in farcaster.json
3. **Developer Mode**: Enable in Farcaster client
4. **Test Features**: Portfolio creation, sharing, authentication

## 📚 Code Documentation

### Main Classes

#### `ProfessionalPortfolio`
- **Purpose**: Main application controller
- **Key Methods**: `init()`, `getUserContext()`, `createPortfolio()`, `sharePortfolio()`
- **State Management**: Portfolios, user data, UI state

#### `CloudStorageService`
- **Purpose**: Vercel Blob/KV integration
- **Key Methods**: `uploadImage()`, `savePortfolios()`, `loadPortfolios()`
- **Fallback**: Automatic localStorage fallback

### Key Features Implementation

#### User Authentication
```javascript
// Get Farcaster user context
const context = await sdk.context;
this.userFid = context.user.fid; // Unique identifier
```

#### Portfolio Sharing
```javascript
// Native Farcaster cast composer
await sdk.actions.composeCast({
    text: portfolioDescription,
    embeds: [publicPortfolioUrl]
});
```

#### Cloud Storage
```javascript
// Save to Vercel KV with user namespacing
await kv.set(`portfolios:${userId}`, portfolios);
```

## 🎯 Roadmap

### Version 1.0.2 (Current)
- [x] Comprehensive documentation
- [x] Mobile UI/UX optimizations
- [x] Performance improvements
- [x] Enhanced error handling

### Version 1.1.0 (Planned)
- [ ] Portfolio templates and themes
- [ ] Batch photo operations
- [ ] Advanced sharing options
- [ ] Analytics dashboard

### Version 1.2.0 (Future)
- [ ] Collaborative portfolios
- [ ] Photo editing tools
- [ ] Integration with other social platforms
- [ ] Advanced analytics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Setup
```bash
# Fork the repo, then:
git clone your-fork-url
cd frame-the-gallery
npm install
npm run dev
```

### Code Style
- **JavaScript**: ES6+, async/await preferred
- **CSS**: Mobile-first, BEM methodology
- **Documentation**: JSDoc for functions, inline comments for complex logic

## 📊 Performance

### Lighthouse Scores (Target)
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 95+

### Bundle Size
- **Main JS**: ~350KB (gzipped: ~100KB)
- **Main CSS**: ~18KB (gzipped: ~4KB)
- **Images**: Optimized WebP with lazy loading

## 🛡️ Security

- **Input Validation**: File type and size restrictions
- **CORS**: Proper cross-origin configuration
- **Data Privacy**: User data isolated by Farcaster FID
- **Error Handling**: No sensitive information in client errors

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Farcaster Team**: For the amazing miniapp SDK and ecosystem
- **Vercel**: For excellent cloud storage solutions
- **Inter Font**: For beautiful typography
- **Community**: Beta testers and feedback providers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/FrameTheGlobe/frame-the-gallery/issues)
- **Discussions**: [GitHub Discussions](https://github.com/FrameTheGlobe/frame-the-gallery/discussions)
- **Farcaster**: [@framethegallery](https://warpcast.com/framethegallery)

---

**FrameTheGallery v1.0.2** - Professional photo portfolios for the Farcaster ecosystem 📸✨