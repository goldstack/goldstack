'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const utils_log_1 = require('@goldstack/utils-log');
const module_1 = require('./module');
describe('The module', () => {
  beforeAll(async () => {
    process.env.GOLDSTACK_DEPLOYMENT = 'local';
    (0, utils_log_1.debug)('Starting test server...');
    await (0, module_1.startTestServer)();
    (0, utils_log_1.debug)('Test server started');
  });
  it('Should get correct endpoint for tests', async () => {
    const endpoint = (0, module_1.getEndpoint)();
    expect(endpoint).toMatch(/^http:\/\/localhost:\d+$/);
  });
  afterAll(async () => {
    await (0, module_1.stopTestServer)();
  });
});
//# sourceMappingURL=module.spec.js.map
