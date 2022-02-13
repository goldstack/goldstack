/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');
const getLocalPackages = require('./scripts/getLocalPackages');

const localPackages = getLocalPackages.getLocalPackages();
const withTM = require('next-transpile-modules')(localPackages);
// const withTM = require('next-transpile-modules')([
//   '@goldstack/utils-track',
//   '@goldstack/toc-generator',
//   '@goldstack/utils-sh',
// ]);
const nextConfig = {
  webpack: (config, options) => {
    return config;
  },
  eslint: {
    // ESLint managed on the workspace level
    ignoreDuringBuilds: true,
  },
  images: {
    disableStaticImages: true,
  },
  async redirects() {
    return [
      {
        source: '/docs/modules/app-nextjs-bootstrap',
        destination: '/docs/templates/app-nextjs-bootstrap',
        permanent: true,
      },
      {
        source: '/docs/modules/lambda-api',
        destination: '/docs/templates/serverless-api',
        permanent: true,
      },
      {
        source: '/docs/modules/app-nextjs',
        destination: '/docs/templates/app-nextjs',
        permanent: true,
      },
      {
        source: '/docs/modules/lambda-express',
        destination: '/docs/templates/lambda-express',
        permanent: true,
      },
      {
        source: '/docs/modules/email-send',
        destination: '/docs/templates/email-send',
        permanent: true,
      },
      {
        source: '/docs/modules/static-website-aws',
        destination: '/docs/templates/static-website-aws',
        permanent: true,
      },
      {
        source: '/docs/modules/s3',
        destination: '/docs/templates/s3',
        permanent: true,
      },
      {
        source: '/docs/modules/lambda-go-gin',
        destination: '/docs/templates/lambda-go-gin',
        permanent: true,
      },
    ];
  },
};

const config = withPlugins(
  [
    [withTM()],
    [
      optimizedImages,
      {
        // optimisation disabled by default, to enable check https://github.com/cyrilwanner/next-optimized-images
        optimizeImages: false,
      },
    ],
  ],
  nextConfig
);
module.exports = config;
