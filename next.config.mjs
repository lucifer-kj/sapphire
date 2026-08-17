/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@resvg/resvg-js", "satori"],
  },
};

export default nextConfig;
