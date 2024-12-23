/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

const { join } = require('path');

const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: join(__dirname, '../../../../'),
  },
};

module.exports = nextConfig;
