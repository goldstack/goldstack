// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./../../jest.config.ui');

module.exports = {
  ...base,
  // only run uispec tests since SSR tests do not run in jsdom environment
  testRegex: '\\.(uispec)\\.ts[x]?$',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  // see https://stackoverflow.com/a/73364357/270662
  moduleNameMapper: {
    '#node-web-compat': './node-web-compat-node.js',
  },
  transform: {
    '.+\\.(css|style|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '\\.(css)$': '<rootDir>/scripts/cssTransformer.js',
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
};
