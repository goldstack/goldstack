import getPort from 'find-free-port';
import fetch from 'node-fetch';
import {
  startServer,
  StartServerResult,
} from '@goldstack/utils-aws-http-api-local';

describe('Should create API', () => {
  let port: undefined | number = undefined;
  let server: undefined | StartServerResult = undefined;

  beforeAll(async () => {
    port = await new Promise<number>((resolve, reject) => {
      getPort(
        process.env.TEST_SERVER_PORT || '50321',
        (err: any, p1: number) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(p1);
        }
      );
    });
    server = await startServer({
      port: `${port}`,
      routesDir: './src/routes',
    });
  });

  test('Should receive response and support parameters', async () => {
    const res = await fetch(`http://localhost:${port}/echo?message=abc`);
    const response = await res.json();
    expect(response.message).toContain('abc');
  });

  afterAll(async () => {
    if (server) {
      await server.shutdown();
    }
  });
});
