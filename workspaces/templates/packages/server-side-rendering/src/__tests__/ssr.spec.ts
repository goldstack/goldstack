import getPort from 'find-free-port';
import fetch from 'node-fetch';

import { startTestServer, stopTestServer, getEndpoint } from './../module';

jest.setTimeout(120000);

describe('Should create page', () => {
  let port: undefined | number = undefined;

  beforeAll(async () => {
    port = await new Promise<number>((resolve, reject) => {
      getPort(
        process.env.TEST_SERVER_PORT || '50331',
        (err: any, p1: number) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(p1);
        }
      );
    });
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
