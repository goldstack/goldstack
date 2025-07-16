import { findFreePorts } from 'find-free-ports';
import fetch from 'node-fetch';
import { startServer, type StartServerResult } from './utilsAwsHttpApiLocal';

describe('Should create API', () => {
  let port: undefined | number;
  let server: undefined | StartServerResult;

  beforeAll(async () => {
    [port] = await findFreePorts(1);
    server = await startServer({
      port: `${port}`,
      routesDir: './testData/routes',
    });
  });

  test('Should receive response and support parameters', async () => {
    const res = await fetch(`http://localhost:${port}/echo?message=abc`);
    expect(await res.text()).toContain('abc');
  });

  test('Should support non-success status codes and empty body', async () => {
    const res = await fetch(`http://localhost:${port}/keepOut`);
    expect(res.status).toEqual(401);
    expect(res.bodyUsed).toBeFalsy();
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
    const response = await res.json();
    expect(response.message).toContain('order [abcd]');
  });

  test('Should support index', async () => {
    const res = await fetch(`http://localhost:${port}/userRepo`);
    expect(await res.json()).toHaveProperty('users');
  });

  test('Should support greedy paths', async () => {
    const res = await fetch(`http://localhost:${port}/admin/my/nested/path`);
    const response = await res.json();
    expect(response.message).toContain('[my/nested/path]');
  });

  test('Should support greedy paths', async () => {
    const res = await fetch(`http://localhost:${port}/admin/short`);
    const response = await res.json();
    expect(response.message).toContain('[short]');
  });

  test('Should not match root for greedy paths', async () => {
    const res = await fetch(`http://localhost:${port}/admin`);
    const response = await res.json();
    expect(response.message).toContain('Unknown endpoint');
  });

  test('Should pass request body', async () => {
    const res = await fetch(`http://localhost:${port}/echoBody`, {
      method: 'post',
      body: JSON.stringify({ message: 'The body.' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(await res.text()).toContain('The body.');
  });

  test('Should return headers', async () => {
    const res = await fetch(`http://localhost:${port}/echoBody`);
    expect(await res.headers.get('location')).toContain('/echoBody');
  });

  afterAll(async () => {
    if (server) {
      await server.shutdown();
    }
  });
});
