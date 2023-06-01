// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./../../jest.config');

module.exports = {
  ...base,
  coveragePathIgnorePatterns: ['/goldstackLocal/'],
  modulePathIgnorePatterns: ['/goldstackLocal/'],
  testPathIgnorePatterns: ['/goldstackLocal/'],
};
