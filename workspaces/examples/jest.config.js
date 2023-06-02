module.exports = {
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/goldstackLocal/',
    '/distWeb/',
    '/distLambda/',
    '.d.ts',
  ],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
