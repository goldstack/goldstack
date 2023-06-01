// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('../../jest.config');

module.exports = {
  ...base,
  resolver: require.resolve('jest-pnp-resolver'),
};
