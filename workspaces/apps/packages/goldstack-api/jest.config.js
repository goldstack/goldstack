// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./../../jest.config');

module.exports = {
  ...base,
  testPathIgnorePatterns: ['<rootDir>/goldstackLocal/'],
  transformIgnorePatterns: [
    '/node_modules/(?!sanitize-html|htmlparser2|domutils|domelementtype|domhandler|dom-serializer|entities)',
    '\\.pnp\\.[^\\/]+$',
  ],
  forceExit: true,
};
