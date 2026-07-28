'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const get_port_1 = __importDefault(require('get-port'));
const module_1 = require('./module');
jest.setTimeout(120000);
const dotenv_1 = require('dotenv');
(0, dotenv_1.config)();
describe('Should create API', () => {
  let port;
  beforeAll(async () => {
    port = await (0, get_port_1.default)({
      port: parseInt(process.env.TEST_SERVER_PORT || '50321', 10),
    });
    await (0, module_1.startTestServer)(port);
  });
  test('Should receive response when accessing unknown path', async () => {
    const res = await fetch(`${(0, module_1.getEndpoint)()}/`, {
      method: 'GET',
    });
    const response = await res.json();
    expect(response.message).toContain('Unknown endpoint accessed');
  });
  test('Should receive response and support parameters', async () => {
    const res = await fetch(`${(0, module_1.getEndpoint)()}/echo?message=abc`);
    const response = await res.json();
    expect(response.message).toContain('abc');
  });
  afterAll(async () => {
    await (0, module_1.stopTestServer)();
  });
});
//# sourceMappingURL=api.spec.js.map
