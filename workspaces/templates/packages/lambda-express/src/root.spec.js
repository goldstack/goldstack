'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('@jest-mock/express');
const root_1 = require('./root');
describe('Root Endpoint', () => {
  const { res, clearMockRes } = (0, express_1.getMockRes)();
  beforeEach(() => {
    clearMockRes();
  });
  it('Return dummy response', async () => {
    const req = (0, express_1.getMockReq)({ body: {} });
    await (0, root_1.rootHandler)(req, res);
    expect(res.json).toHaveBeenCalled();
    const resVal = res.json.mock.calls[0][0];
    expect(resVal).toBe('success');
  });
});
//# sourceMappingURL=root.spec.js.map
