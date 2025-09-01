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
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Turbopack specific configurations
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // Webpack configuration to handle Node.js modules (only for production builds)
  webpack: (config, { isServer, dev }) => {
    // Only apply webpack config for production builds or when not using Turbopack
    if (!isServer && !dev) {
      // Don't attempt to load Node.js modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Production optimizations
    if (!dev) {
      // Remove console.log in production
      config.optimization.minimize = true;
    }

    return config;
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;