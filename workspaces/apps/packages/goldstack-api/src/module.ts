import type { Server } from 'http';
import { debug } from '@goldstack/utils-log';
import goldstackConfig from './../goldstack.json';

let testServerPort: null | number = null;

let testServer: Server | null = null;

export const startTestServer = async (port?: number): Promise<void> => {
  const usePort = port ?? 0;
  debug(`Starting test server on port ${usePort === 0 ? '(auto)' : usePort}...`);
  // The below is preventing webpack from bundling up the server - it is only required for local tests.
  // biome-ignore lint/security/noGlobalEval: Required for test server isolation
  testServer = await eval(
    `var server = require('./server.ts'); var promise = server.start(${usePort}); promise;`,
  );
  const addr = testServer?.address();
  testServerPort = typeof addr === 'object' && addr ? addr.port : usePort;
  debug(`Test server started on port ${testServerPort}`);
};

export const stopTestServer = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (!testServer) {
      debug('No test server to stop');
      resolve();
      return;
    }
    debug(`Stopping test server on port ${testServerPort}...`);
    if (typeof testServer.closeAllConnections === 'function') {
      testServer.closeAllConnections();
    }
    testServer.close((err) => {
      if (err) {
        debug(`Error stopping test server: ${err.message}`);
        reject(err);
        return;
      }
      debug('Test server stopped');
      resolve();
    });
  });
};

export const getEndpoint = (deploymentName?: string): string => {
  if (!deploymentName) {
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    const port = testServerPort;

    return `http://localhost:${port || '8731'}`;
  }
  const deployment = goldstackConfig.deployments.find(
    (deployment) => deployment.name === deploymentName,
  );
  if (!deployment) {
    throw new Error(`Cannot find deployment with name ${deploymentName}`);
  }
  return `https://${deployment.configuration.apiDomain}`;
};
