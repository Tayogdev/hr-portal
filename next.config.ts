/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        // If images are often nested in paths like /api/portraits/men/ or /api/portraits/women/,
        // you might want to add a more specific pathname, e.g., pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        // Google User Content paths can be complex, so a broad pathname might be needed
        // pathname: '/**', // This allows any path from lh3.googleusercontent.com
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com', // Added this based on your previous code for the Google icon
      },
    ],
  },
};

module.exports = nextConfig;