/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const withPlugins = require('next-compose-plugins');
const images = require('next-images');

const nextConfig = {
  webpack: (config, options) => {
    return config;
  },
  eslint: {
    // ESLint managed on the workspace level
    ignoreDuringBuilds: true,
  },
  // fixing issues with Next.js default loader and using next export
  // https://github.com/vercel/next.js/issues/21079
  images: {
    loader: 'imgix',
    path: '/',
  },
};

const config = withPlugins([[images]], nextConfig);

module.exports = config;
