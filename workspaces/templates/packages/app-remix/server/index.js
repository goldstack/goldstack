// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createRequestHandler } = require('@remix-run/architect');
exports.handler = createRequestHandler({
  build: require('./build'),
});
