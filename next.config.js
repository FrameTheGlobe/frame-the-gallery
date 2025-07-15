/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration for Vercel deployment
  images: {
    domains: ['localhost', 'frametheglobe.xyz'],
  },
  // Add headers for Farcaster frame compatibility
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
