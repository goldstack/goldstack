/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('./../../jest.config');

module.exports = {
  ...base,
  // see https://stackoverflow.com/a/73364357/270662
  moduleNameMapper: {
    '#node-web-compat': './node-web-compat-node.js',
  },
  transform: {
    ...base.transform,
    '.+\\.(style|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '\\.(css)$': '<rootDir>/scripts/cssTransformer.js',
  },
};
