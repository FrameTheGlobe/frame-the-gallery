import './globals.css'

export const metadata = {
  title: 'FrameTheGallery - Professional Photography Portfolio',
  description: 'A sophisticated photo gallery platform for professional photographers. Showcase your work with precision and elegance.',
  keywords: 'photography, portfolio, professional, gallery, leica, fine art, exhibition, showcase',
  authors: [{ name: 'FrameTheGallery Professional' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#27272a" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-leica-50 via-leica-100/50 to-accent-50/30">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
