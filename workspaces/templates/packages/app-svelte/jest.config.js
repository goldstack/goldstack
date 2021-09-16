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
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  transform: {
     "^.+\\.svelte$": [
      "svelte-jester",
      {
        "preprocess": true
      }
    ],
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'svelte'],
 "extensionsToTreatAsEsm": [".svelte"]
};
