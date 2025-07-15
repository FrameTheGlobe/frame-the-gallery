# 🖼️ FrameTheGallery - Visual Stories for Farcaster

A beautiful and elegant photo gallery app designed specifically for the Farcaster community. FrameTheGallery helps photographers and creators showcase their visual stories with a modern, community-focused design and custom logo branding.

## ✨ Features

- **🖼️ Custom Logo & Branding**: Beautiful FrameTheGallery logo with gradient design
- **📷 Easy Photo Upload**: Drag & drop up to 10 photos to frame your story
- **🎨 Elegant Gallery Display**: Responsive grid layout with smooth animations
- **🔍 Enhanced Lightbox**: Full-size viewing with navigation and sharing controls
- **💾 Local Storage**: Your framed moments persist across sessions
- **📱 Mobile Optimized**: Fully responsive design for all devices
- **🚀 Share Your Story**: Built-in sharing with community-focused messaging
- **⚡ Smooth Performance**: Optimized images and beautiful transitions
- **🎯 Farcaster Native**: Designed specifically for the Farcaster ecosystem

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **File Upload**: Native HTML5 File API
- **Image Optimization**: Next.js Image component
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd photo-gallery-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see FrameTheGallery in action.

## Deployment

This app is optimized for Vercel deployment:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click

## Usage

1. **Upload Photos**: Click the upload area or drag & drop up to 10 images
2. **Preview**: View your uploaded photos in the gallery
3. **Manage**: Remove photos by clicking the X button
4. **Share**: Share your portfolio URL with others

## 📁 Project Structure

```
photo-gallery-app/
├── app/
│   ├── components/
│   │   ├── Logo.jsx           # FrameTheGallery custom logo
│   │   ├── PhotoUpload.jsx    # Photo upload component
│   │   └── PhotoGallery.jsx   # Gallery display component
│   ├── globals.css            # Global styles with custom animations
│   ├── layout.js              # Root layout with FrameTheGallery branding
│   └── page.js                # Main page with hero section
├── public/                    # Static assets
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind with purple-pink theme
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own portfolio needs.
