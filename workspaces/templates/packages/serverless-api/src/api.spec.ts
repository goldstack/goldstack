import getPort from 'get-port';

import { getEndpoint, startTestServer, stopTestServer } from './module';

jest.setTimeout(120000);

import { config } from 'dotenv';

config();

describe('Should create API', () => {
  let port: undefined | number;

  beforeAll(async () => {
    port = await getPort({ port: parseInt(process.env.TEST_SERVER_PORT || '50321', 10) });
    await startTestServer(port);
  });

  test('Should receive response when accessing unknown path', async () => {
    const res = await fetch(`${getEndpoint()}/`, {
      method: 'GET',
    });
    const response = await res.json();
    expect(response.message).toContain('Unknown endpoint accessed');
  });

  test('Should receive response and support parameters', async () => {
    const res = await fetch(`${getEndpoint()}/echo?message=abc`);
    const response = (await res.json()) as { message: string };
    expect(response.message).toContain('abc');
  });

  afterAll(async () => {
    await stopTestServer();
  });
});
