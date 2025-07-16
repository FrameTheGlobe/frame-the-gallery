# FrameTheGallery 🖼️

A beautiful photo gallery mini app built for the Farcaster ecosystem. Upload, view, and share your favorite photos with the Farcaster community.

## Features

- 📸 **Photo Upload**: Upload multiple photos with drag-and-drop support
- 🔍 **Gallery Views**: Switch between grid and list views
- 🔄 **Sorting Options**: Sort by newest, oldest, or name
- 🔗 **Farcaster Integration**: Seamless authentication and sharing
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations
- 🚀 **Fast Performance**: Optimized loading and rendering

## Farcaster Mini App Features

- ✅ **SDK Integration**: Built with @farcaster/miniapp-sdk
- 🔐 **Quick Auth**: Seamless Farcaster authentication
- 📢 **Cast Sharing**: Share photos directly to Farcaster
- 👤 **User Context**: Access to user profile and data
- 🎯 **Manifest Configuration**: Proper mini app discovery setup

## Getting Started

### Prerequisites

- Node.js 22.11.0 or higher
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frame-the-gallery
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deployment

This app is configured for deployment on Vercel, but can be deployed to any static hosting service.

For Vercel deployment:
```bash
npm run build
vercel --prod
```

## Farcaster Mini App Setup

### Manifest Configuration

The app includes a proper Farcaster manifest at `public/.well-known/farcaster.json` with:

- Account association for domain verification
- Mini app metadata (name, icons, URLs)
- Proper versioning and categorization

### SDK Integration

The app uses the official Farcaster Mini App SDK for:

- User authentication (`sdk.actions.signIn()`)
- App lifecycle management (`sdk.actions.ready()`)
- Cast composition (`sdk.actions.composeCast()`)
- Context access for user data

### Testing in Farcaster

1. Enable Developer Mode in Farcaster
2. Deploy your app to a public URL
3. Update the manifest URLs to match your deployment
4. Test the app within the Farcaster client

## Project Structure

```
frame-the-gallery/
├── public/
│   └── .well-known/
│       └── farcaster.json     # Farcaster manifest
├── index.html                 # Main HTML file
├── app.js                     # Main application logic
├── styles.css                 # Styling and animations
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Key Components

### FrameTheGallery Class
The main application class that handles:
- Photo management and rendering
- User authentication
- File uploads
- Modal interactions
- Farcaster SDK integration

### Photo Management
- Local storage of uploaded photos
- Sample photos for demonstration
- Sorting and filtering capabilities
- Grid and list view modes

### Farcaster Integration
- Seamless authentication flow
- User profile display
- Photo sharing to Farcaster
- Context-aware features

## Customization

### Adding New Features

1. **Photo Filters**: Add image filtering capabilities
2. **Albums**: Organize photos into collections
3. **Comments**: Add commenting system
4. **Likes**: Implement photo rating system
5. **Search**: Add photo search functionality

### Styling

The app uses CSS custom properties for easy theming. Key variables:
- `--primary-color`: Main brand color
- `--secondary-color`: Secondary accent color
- `--background-gradient`: Main background gradient

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Create an issue on GitHub
- Reach out on Farcaster (@pirosb3, @linda, @deodad)

## Acknowledgments

- Built with the Farcaster Mini App SDK
- Uses Unsplash for sample photos
- Inspired by the Farcaster community

---

**FrameTheGallery** - Bringing beautiful photo sharing to the Farcaster ecosystem! 🖼️✨
