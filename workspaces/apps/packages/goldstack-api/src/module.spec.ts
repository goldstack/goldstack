import { debug } from '@goldstack/utils-log';
import { getEndpoint, startTestServer, stopTestServer } from './module';

describe('The module', () => {
  beforeAll(async () => {
    process.env.GOLDSTACK_DEPLOYMENT = 'local';
    debug('Starting test server...');
    await startTestServer();
    debug('Test server started');
  });
  it('Should get correct endpoint for tests', async () => {
    const endpoint = getEndpoint();
    expect(endpoint).toMatch(/^http:\/\/localhost:\d+$/);
  });
  afterAll(async () => {
    await stopTestServer();
  });
});
