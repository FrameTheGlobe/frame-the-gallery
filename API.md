# Photo Gallery App - Technical Documentation

## Architecture Overview

This is a client-side React application built with Next.js 14 that allows photographers to create and showcase photo portfolios.

## Key Components

### 1. PhotoUpload Component (`/app/components/PhotoUpload.jsx`)

**Purpose**: Handles file upload functionality with drag & drop support

**Key Features**:
- Drag and drop file upload
- File type validation (images only)
- Maximum 10 photos limit
- Preview grid with remove functionality
- Local storage integration

**Props**:
- `photos`: Array of photo objects
- `setPhotos`: State setter function
- `maxPhotos`: Maximum number of photos (default: 10)

**Photo Object Structure**:
```javascript
{
  id: number,           // Unique identifier
  file: File,          // Original file object
  url: string,         // Object URL for preview
  name: string         // File name
}
```

### 2. PhotoGallery Component (`/app/components/PhotoGallery.jsx`)

**Purpose**: Displays photos in a responsive grid with lightbox functionality

**Key Features**:
- Responsive grid layout
- Lightbox modal for full-size viewing
- Navigation between photos
- Download and share functionality
- Keyboard navigation support

**Props**:
- `photos`: Array of photo objects to display

### 3. Main Page Component (`/app/page.js`)

**Purpose**: Main application container with tab navigation

**Key Features**:
- Tab-based navigation (Upload/Gallery)
- Local storage persistence
- Share portfolio functionality
- Clear all photos option

## Data Flow

1. **Upload Flow**:
   - User selects/drops files
   - Files are validated and processed
   - Object URLs created for preview
   - Photos added to state array
   - State persisted to localStorage

2. **Display Flow**:
   - Photos loaded from localStorage on mount
   - Gallery component renders grid
   - Lightbox opens on photo click
   - Navigation and actions available

## Local Storage

**Key**: `portfolio-photos`
**Format**: JSON array of photo objects

```javascript
[
  {
    "id": 1642123456789,
    "url": "blob:http://localhost:3000/...",
    "name": "photo1.jpg"
  }
]
```

## Styling

- **Framework**: Tailwind CSS
- **Design System**: Custom color palette with primary blue theme
- **Responsive**: Mobile-first approach
- **Animations**: Smooth transitions and hover effects

## Performance Considerations

1. **Memory Management**:
   - Object URLs are revoked when photos are removed
   - Cleanup on component unmount

2. **Image Optimization**:
   - Next.js Image component for optimized loading
   - Lazy loading for gallery images

3. **Bundle Size**:
   - Minimal dependencies
   - Tree-shaking enabled
   - Tailwind CSS purging

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+
- **Features Used**:
  - File API
  - Drag & Drop API
  - Local Storage
  - Object URLs
  - Web Share API (with fallback)

## Deployment

**Platform**: Vercel (recommended)
**Build Command**: `npm run build`
**Output Directory**: `.next`

## Environment Variables

None required for basic functionality.

## Future Enhancements

1. **Backend Integration**:
   - User authentication
   - Cloud storage (AWS S3, Cloudinary)
   - Database persistence

2. **Advanced Features**:
   - Image editing tools
   - Metadata extraction
   - Social sharing
   - Portfolio themes

3. **Performance**:
   - Image compression
   - Progressive loading
   - CDN integration

## Security Considerations

1. **File Validation**:
   - File type checking
   - File size limits
   - Malicious file detection

2. **XSS Prevention**:
   - Sanitized file names
   - Safe URL handling

3. **Privacy**:
   - Client-side only storage
   - No server-side data collection
