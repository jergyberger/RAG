/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "export", // Enables `next export`
  reactStrictMode: false,
  images: {
    unoptimized: true, // Required for GitHub Pages (disables automatic image optimization)
  },
  basePath: "/portfolio/rag", // Use your repo name here
};

export default nextConfig;
