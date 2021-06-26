import { getMockReq, getMockRes } from '@jest-mock/express';
import { rootHandler } from './root';

describe('Root Endpoint', () => {
  const { res, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
  });

  it('Return dummy response', async () => {
    const req = getMockReq({ body: {} });
    await rootHandler(req, res);

    expect(res.json).toHaveBeenCalled();
    const resVal = res.json.mock.calls[0][0];
    expect(resVal).toBe('success');
  });
});
