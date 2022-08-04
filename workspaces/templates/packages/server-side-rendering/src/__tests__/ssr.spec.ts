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
    console.log('RUN TEST', getEndpoint());
    const res = await fetch(`${getEndpoint()}/`);
    const response = await res.text();
    expect(response).toContain('Hi there');
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 20000);
    // });
  });

  afterAll(async () => {
    await stopTestServer();
  });
});
