// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./../../jest.config.ui');

module.exports = {
  ...base,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    },
  },
  testEnvironment: 'node',
  preset: 'ts-jest',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  transform: {
    '^.+\\.svelte$': [ 'svelte-jester', { preprocess: './svelte.test.config.js'}],
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest',
    '^.+\\.js$': 'ts-jest',
    '^.+\\.jsx$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'svelte'],
};
