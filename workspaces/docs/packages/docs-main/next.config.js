/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const getLocalPackages = require('./scripts/getLocalPackages');

const localPackages = getLocalPackages.getLocalPackages();

const nextConfig = {
  output: 'export',
  distDir: 'webDist/',
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.svg/,
      use: {
        loader: 'svg-url-loader',
      },
    });
    config.module.rules.push({
      test: /\.(png|jpe?g|gif)$/i,
      use: {
        loader: 'file-loader',
        options: {
          name: '[path][name].[hash].[ext]',
          publicPath: '/_next/static',
          outputPath: 'static',
          emitFile: !options.isServer,
        },
      },
    });
    return config;
  },
  eslint: {
    // ESLint managed on the workspace level
    ignoreDuringBuilds: true,
  },
  images: {
    disableStaticImages: true,
  },
  transpilePackages: localPackages,
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

const plugins = [];

module.exports = (_phase, {}) => {
  return plugins.reduce(
    (acc, plugin) => {
      if (Array.isArray(plugin)) {
        return plugin[0](acc, plugin[1]);
      }
      return plugin(acc);
    },
    { ...nextConfig },
  );
};
