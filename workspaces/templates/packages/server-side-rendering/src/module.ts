import { excludeInBundle } from '@goldstack/utils-esbuild';
import { register } from 'node-css-require';
import goldstackConfig from './../goldstack.json';

register();

const cors = process.env.CORS;

let testServerPort: null | number = null;

let testServer: any = null;

if (process.env.TEST_SERVER_PORT) {
  testServerPort = parseInt(process.env.TEST_SERVER_PORT);
}

/**
 * Starts a test server for local development and testing of server-side rendered applications.
 *
 * @param port - Optional port number to start the server on. Defaults to 3047.
 * @returns A promise that resolves with the test server instance.
 */
export const startTestServer = async (port?: number): Promise<any> => {
  port = port || 3047;

  const { startServer } = require(excludeInBundle('@goldstack/utils-aws-http-api-local'));
  testServer = await startServer({
    port: port,
    routesDir: './src/routes',
    cors,
    staticRoutes: {
      '/_goldstack/static': 'static',
      '/_goldstack/public': 'public',
      '/': 'public',
    },
  });
  testServerPort = port;
  return testServer;
};

/**
 * Stops the test server if it's running.
 *
 * @returns A promise that resolves when the server has been stopped.
 */
export const stopTestServer = async (): Promise<void> => {
  return testServer.shutdown();
};

/**
 * Gets the endpoint URL for the server-side rendering deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns The endpoint URL string.
 * @throws {Error} If the deployment cannot be found.
 */
export const getEndpoint = (deploymentName?: string): string => {
  if (!deploymentName) {
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    const port = testServerPort || 3047;

    return `http://localhost:${port}`;
  }
  const deployment = goldstackConfig.deployments.find(
    (deployment) => (deployment as any).name === deploymentName,
  );
  if (!deployment) {
    throw new Error(`Cannot find deployment with name ${deploymentName}`);
  }
  return 'https://' + (deployment as any).configuration.apiDomain;
};
