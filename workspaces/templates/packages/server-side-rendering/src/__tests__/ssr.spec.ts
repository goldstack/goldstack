import getPort from 'get-port';

import { getEndpoint, startTestServer, stopTestServer } from './../module';

jest.setTimeout(120000);

describe('Should create page', () => {
  let port: undefined | number;

  beforeAll(async () => {
    port = await getPort({ port: parseInt(process.env.TEST_SERVER_PORT || '50331') });
    await startTestServer(port);
  });

  test('Should receive response and support parameters', async () => {
    const res = await fetch(`${getEndpoint()}/`);
    const response = await res.text();
    expect(response).toContain('Hi there');
    // ensure CSS is compiled correctly and correct class names injected
    expect(response).toContain('message');
  });

  afterAll(async () => {
    await stopTestServer();
  });
});
