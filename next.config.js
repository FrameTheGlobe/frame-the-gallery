/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only add what's absolutely necessary
  images: {
    domains: ['localhost', 'frametheglobe.xyz'],
  },
  
  // Add Farcaster frame headers
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
