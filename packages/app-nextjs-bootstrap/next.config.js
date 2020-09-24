/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const withPlugins = require('next-compose-plugins');
const images = require('next-images');

const nextConfig = {
  webpack: (config, options) => {
    return config;
  },
};

const config = withPlugins([[images]], nextConfig);

module.exports = config;
