/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better error catching
  reactStrictMode: true,
  
  // Configure images to work with Vercel
  images: {
    domains: ['localhost', 'frametheglobe.xyz'],
    formats: ['image/webp'],
  },
  
  // Add security headers for Farcaster frame compatibility
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
