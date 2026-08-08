/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      root: '../../',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.formula1.com' },
      { protocol: 'https', hostname: 'e0.365dm.com' },
      { protocol: 'https', hostname: 'e1.365dm.com' },
      { protocol: 'https', hostname: 'e2.365dm.com' },
      { protocol: 'https', hostname: 'e3.365dm.com' },
    ],
  },
};

export default nextConfig;
