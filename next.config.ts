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
      // Add this new pattern for googleusercontent.com
      {
        protocol: 'http', // Use http as specified in your error message
        hostname: 'googleusercontent.com',
      },
    ],
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

module.exports = nextConfig;