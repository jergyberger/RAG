const nextConfig = {
  output: "export",             // ✅ Required for static HTML
  reactStrictMode: false,
  images: {
    unoptimized: true,          // ✅ Required for GitHub Pages
  },
  basePath: "/RAG",             // ✅ Must match your repo name
};

export default nextConfig;
