/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['ai'],
  },
  eslint: {
    ignorePatterns: ['node_modules', '.next'],
  },
  allowedDevOrigins: ['*'],
};

module.exports = nextConfig;