import getPort from 'find-free-port';
import fetch from 'node-fetch';
import { startServer, StartServerResult } from './utilsAwsHttpApiLocal';

describe('Should create API', () => {
  let port: undefined | number = undefined;
  let server: undefined | StartServerResult = undefined;

  beforeAll(async () => {
    port = await new Promise<number>((resolve, reject) => {
      getPort(50121, (err: any, p1: number) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(p1);
      });
    });
    server = await startServer({
      port: `${port}`,
      routesDir: './testData/routes',
    });
  });

  test('Should receive response and support parameters', async () => {
    const res = await fetch(`http://localhost:${port}/echo?message=abc`);
    expect(await res.text()).toContain('abc');
  });

  test('Should support fallback', async () => {
    const res = await fetch(`http://localhost:${port}/unknownEndpoint`);
    expect(await res.text()).toContain('Unknown endpoint');
  });

  test('Should support path parameters', async () => {
    const res = await fetch(`http://localhost:${port}/cart/123456/items`);
    expect(await res.text()).toContain('cart [123456]');
  });

  test('Should support path parameters at end of path', async () => {
    const res = await fetch(`http://localhost:${port}/order/abcd`);
    expect(await res.text()).toContain('order [abcd]');
  });

  test('Should support index', async () => {
    const res = await fetch(`http://localhost:${port}/userRepo`);
    expect(JSON.parse(await res.json())).toHaveProperty('users');
  });

  test('Should support greedy paths', async () => {
    const res = await fetch(`http://localhost:${port}/admin/my/nested/path`);
    expect(JSON.parse(await res.text())).toContain('[my/nested/path]');
  });

  test('Should support greedy paths', async () => {
    const res = await fetch(`http://localhost:${port}/admin/short`);
    expect(JSON.parse(await res.text())).toContain('[short]');
  });

  test('Should not match root for greedy paths', async () => {
    const res = await fetch(`http://localhost:${port}/admin`);
    expect(JSON.parse(await res.text())).toContain('Unknown endpoint');
  });

  afterAll(async () => {
    if (server) {
      await server.shutdown();
    }
  });
});
