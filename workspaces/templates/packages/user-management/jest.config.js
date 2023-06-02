// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./../../jest.config');

module.exports = {
  ...base,
  // issue in AWS library, see https://github.com/awslabs/aws-jwt-verify/issues/69#issuecomment-1236225304
  moduleNameMapper: {
    '#node-web-compat': './node-web-compat-node.js',
  },
};
