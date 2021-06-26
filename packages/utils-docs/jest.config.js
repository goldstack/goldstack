// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('../../../templates/jest.config');

module.exports = {
  ...base,
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
};
