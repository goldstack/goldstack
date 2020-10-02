/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = {
  entry: './dist/run.js',
  output: {
    path: path.resolve(__dirname, 'distImg'),
    filename: 'run.js',
  },
  target: 'node',
  resolve: {
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
};
