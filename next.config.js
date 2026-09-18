/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/webp'],
  },
};

module.exports = nextConfig;
