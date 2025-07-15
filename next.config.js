/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove appDir experimental flag as it's now stable in Next.js 14
  images: {
    domains: ['localhost', 'frametheglobe.xyz'],
    unoptimized: false, // Let Vercel optimize images
  },
  // Don't use standalone for Vercel deployment
  swcMinify: true,
  reactStrictMode: true,
}

module.exports = nextConfig
