/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
      },
    ],
  },
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
    // Turbopack configuration
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Reduce build memory usage
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

module.exports = nextConfig;
