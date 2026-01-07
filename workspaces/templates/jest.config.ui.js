// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./jest.config');

module.exports = {
  ...base,
  testEnvironment: 'jsdom',
  testRegex: '\\.(uispec|spec)\\.ts[x]?$',
  // No moduleNameMapper for react to avoid issues with React 19
};
