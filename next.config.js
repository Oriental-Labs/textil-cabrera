/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'textilcabrera.com.uy',
      },
    ],
  },
};

module.exports = nextConfig;
