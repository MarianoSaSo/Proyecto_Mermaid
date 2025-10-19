/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false, // en el navegador ignorar canvas
      };
    }
    return config;
  },
};

export default nextConfig;
