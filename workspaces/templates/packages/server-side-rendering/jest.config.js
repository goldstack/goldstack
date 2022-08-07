/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('./../../jest.config');

module.exports = {
  ...base,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  transform: {
    '.+\\.(style|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '\\.(css)$': '<rootDir>/scripts/cssTransformer.js',
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
};
