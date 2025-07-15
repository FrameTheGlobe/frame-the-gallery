/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Vercel
  images: {
    domains: ['localhost', 'frametheglobe.xyz'],
  },
  // Keep the Farcaster frame meta tags in layout.js instead of using headers
}

module.exports = nextConfig
