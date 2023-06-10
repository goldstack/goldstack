/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const getLocalPackages = require('./scripts/getLocalPackages');

const localPackages = getLocalPackages.getLocalPackages();

const nextConfig = {
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
    { ...nextConfig }
  );
};
