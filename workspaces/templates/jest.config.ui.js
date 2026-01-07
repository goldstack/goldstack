// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./jest.config');

module.exports = {
  ...base,
  testEnvironment: 'jsdom',
  testRegex: '\\.(uispec|spec)\\.ts[x]?$',
  moduleNameMapper: {
    '^react$': require.resolve('react/cjs/react.development.js'),
    '^react-dom$': require.resolve('react-dom/cjs/react-dom.development.js'),
  },
};
