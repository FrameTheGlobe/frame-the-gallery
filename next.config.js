/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set output to export for static deployment
  output: 'export',
  
  // Basic image configuration
  images: {
    domains: ['localhost', 'frametheglobe.xyz'],
    unoptimized: true, // Required for export output
  },
  
  // Disable trailing slashes
  trailingSlash: false,
  
  // Add headers for Farcaster frame compatibility
  // Note: headers only work in non-export mode, but keeping for reference
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
