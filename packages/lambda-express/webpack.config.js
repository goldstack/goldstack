/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = {
  entry: './dist/src/lambda.js',
  output: {
    path: path.resolve(__dirname, 'distLambda'),
    filename: 'lambda.js',
    libraryTarget: 'umd',
  },
  target: 'node',
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  module: {
    rules: [
      // this is required to load source maps of libraries
      {
        test: /\.(js|js\.map|map)$/,
        enforce: 'pre',
        use: [require.resolve('source-map-loader')],
      },
    ],
  },
};
