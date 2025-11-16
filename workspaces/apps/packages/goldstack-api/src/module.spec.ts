import { getEndpoint, startTestServer, stopTestServer } from './module';

describe('The module', () => {
  process.env.PORT = '8737';
  beforeAll(async () => {
    process.env.GOLDSTACK_DEPLOYMENT = 'local';
    console.log('Starting test server');
    await startTestServer(parseInt(process.env.PORT || '', 10));
    console.log('Test server started');
  });
  it('Should get correct endpoint for tests', async () => {
    const endpoint = getEndpoint();
    expect(endpoint).toEqual('http://localhost:8737');
  });
  afterAll(async () => {
    await stopTestServer();
  });
});
