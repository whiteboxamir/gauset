/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['better-sqlite3'],
  distDir: process.env.NODE_ENV === 'development' ? '.next-local' : '.next',
};

export default nextConfig;
