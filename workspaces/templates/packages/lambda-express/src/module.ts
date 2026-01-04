import { Server } from 'http';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import goldstackConfig from './../goldstack.json';

let testServerPort: null | number = null;

let testServer: Server | null = null;

if (process.env.TEST_SERVER_PORT) {
  testServerPort = parseInt(process.env.TEST_SERVER_PORT);
}

/**
 * Starts a test server for local development and testing of Express.js applications.
 *
 * @param port - The port number to start the server on.
 * @returns A promise that resolves when the server has started.
 */
export const startTestServer = async (port: number): Promise<void> => {
  const server = require(excludeInBundle('./server.ts'));
  testServer = await server.start(port);
  testServerPort = port;
};

/**
 * Stops the test server if it's running.
 *
 * @returns A promise that resolves when the server has been stopped.
 */
export const stopTestServer = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (!testServer) {
      return resolve();
    }
    testServer.close((err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

interface Deployment {
  name: string;
  configuration: {
    apiDomain: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Gets the endpoint URL for the Express.js Lambda deployment.
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
    const port = testServerPort || 3030;

    return `http://localhost:${port}`;
  }
  const deployment = goldstackConfig.deployments.find(
    (deployment) => (deployment as Deployment).name === deploymentName,
  );
  if (!deployment) {
    throw new Error(`Cannot find deployment with name ${deploymentName}`);
  }
  return 'https://' + (deployment as Deployment).configuration.apiDomain;
};
