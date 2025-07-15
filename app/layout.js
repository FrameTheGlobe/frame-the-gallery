import './globals.css'

export const metadata = {
  title: 'FrameTheGallery - Professional Photography Portfolio',
  description: 'A sophisticated photo gallery platform for professional photographers. Showcase your work with precision and elegance.',
  keywords: 'photography, portfolio, professional, gallery, leica, fine art, exhibition, showcase',
  authors: [{ name: 'FrameTheGallery Professional' }],
  metadataBase: new URL('https://frametheglobe.xyz'),
  openGraph: {
    title: 'FrameTheGallery - Professional Photography Portfolio',
    description: 'Showcase your photography with precision and elegance',
    url: 'https://frametheglobe.xyz',
    siteName: 'FrameTheGallery Professional',
    images: [
      {
        url: 'https://frametheglobe.xyz/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrameTheGallery - Professional Photography Portfolio',
    description: 'Showcase your photography with precision and elegance',
    images: ['https://frametheglobe.xyz/og-image.png'],
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  alternates: {
    canonical: 'https://frametheglobe.xyz',
  },
  robots: {
    index: true,
    follow: true,
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
