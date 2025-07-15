/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Vercel compatibility
  reactStrictMode: true,
  swcMinify: true,
  
  // Configure images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
