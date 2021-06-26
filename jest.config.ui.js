// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./jest.config');

module.exports = {
  ...base,
  testEnvironment: 'jsdom',
  testRegex: '\\.uispec\\.tsx$',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.ui.json',
    },
  },
};
