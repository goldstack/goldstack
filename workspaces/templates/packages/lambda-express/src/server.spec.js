'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const supertest_1 = __importDefault(require('supertest'));
const server_1 = require('./server');
describe('Express server', () => {
  it('Should be able to call root endpoint.', async () => {
    const res = await (0, supertest_1.default)(server_1.app).get('/').send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBe('success');
  });
});
//# sourceMappingURL=server.spec.js.map
