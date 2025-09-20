/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Solución para el problema de undici con Firebase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    config.externals = [...config.externals, { canvas: "canvas" }];
    return config;
  },
  transpilePackages: ['undici'],
}

module.exports = nextConfig