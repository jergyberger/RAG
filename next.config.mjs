// REMOVE output, basePath, assetPrefix for Vercel
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
