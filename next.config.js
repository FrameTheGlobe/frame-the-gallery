/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true, // For static export compatibility
  },
  // Enable static export for Vercel
  output: 'standalone',
}

module.exports = nextConfig
