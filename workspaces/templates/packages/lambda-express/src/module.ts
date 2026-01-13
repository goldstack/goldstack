import { excludeInBundle } from '@goldstack/utils-esbuild';
import goldstackConfig from './../goldstack.json';

let testServerPort: null | number = null;

// biome-ignore lint/suspicious/noExplicitAny: Dynamic server instance from require()
let testServer: any = null;

if (process.env.TEST_SERVER_PORT) {
  testServerPort = parseInt(process.env.TEST_SERVER_PORT, 10);
}

/**
 * Starts a test server for local development and testing of Express.js applications.
 *
 * @param port - The port number to start the server on.
 * @returns {Promise<void>} A promise that resolves when the server has started.
 */
export const startTestServer = async (port: number): Promise<void> => {
  const server = require(excludeInBundle('./server.ts'));
  testServer = await server.start(port);
  testServerPort = port;
};

/**
 * Stops the test server if it's running.
 *
 * @returns {Promise<void>} A promise that resolves when the server has been stopped.
 */
export const stopTestServer = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    testServer.close((err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

/**
 * Gets the endpoint URL for the Express.js Lambda deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns The endpoint URL string.
 * * @returns {string} The endpoint URL for the Express.js Lambda deployment.
 *
 * @throws {Error} If the deployment cannot be found.
 */
export const getEndpoint = (deploymentName?: string): string => {
  if (!deploymentName) {
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    const port = testServerPort || 3030;

    return `http://localhost:${port}`;
  }
  const deployment = goldstackConfig.deployments.find(
    // biome-ignore lint/suspicious/noExplicitAny: Deployment configuration has dynamic properties
    (deployment) => (deployment as any).name === deploymentName,
  );
  if (!deployment) {
    throw new Error(`Cannot find deployment with name ${deploymentName}`);
  }
  // biome-ignore lint/suspicious/noExplicitAny: Deployment configuration has dynamic properties
  return `https://${(deployment as any).configuration.apiDomain}`;
};
