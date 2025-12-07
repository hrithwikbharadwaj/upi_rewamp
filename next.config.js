/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // API route configuration
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Set max body size to 10MB
    },
    responseLimit: "10mb",
  },
};

module.exports = nextConfig;
