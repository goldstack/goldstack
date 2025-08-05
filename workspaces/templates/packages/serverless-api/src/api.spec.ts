import getPort from 'find-free-port';

import { getEndpoint, startTestServer, stopTestServer } from './module';

jest.setTimeout(120000);

import { config } from 'dotenv';

config();

describe('Should create API', () => {
  let port: undefined | number;

  beforeAll(async () => {
    port = await new Promise<number>((resolve, reject) => {
      getPort(process.env.TEST_SERVER_PORT || '50321', (err: any, p1: number) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(p1);
      });
    });
    await startTestServer(port);
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
