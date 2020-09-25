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
  externals: {
    // SDK version for all dependencies locked to 2.721.0 to match version included in Lambda https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
    'aws-sdk': 'aws-sdk',
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
