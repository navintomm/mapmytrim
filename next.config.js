/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'undici': 'commonjs undici',
      });
    }
    return config;
  },
}

module.exports = nextConfig
