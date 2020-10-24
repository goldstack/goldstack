import goldstackConfig from './../goldstack.json';
import assert from 'assert';

let testServerPort: null | number = null;

if (process.env.PORT) {
  testServerPort = parseInt(process.env.PORT);
} else {
  testServerPort = 5030 + Math.floor(Math.random() * 969 + 1);
}

let testServer: any = null;

export const startTestServer = async (port: number): Promise<void> => {
  // The below is preventing webpack from bundling up the server - it is only required for local tests.
  testServer = await eval(
    `var server = require('./server.ts'); var promise = server.start(${port}); promise;`
  );
  testServerPort = port;
};

export const stopTestServer = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    testServer.close((err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

export const getEndpoint = (deploymentName?: string): string => {
  assert(
    testServerPort,
    'Port for test server not defined. Specify environment variable PORT.'
  );
  if (!deploymentName) {
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    const port = testServerPort;

    return `http://localhost:${port}`;
  }
  const deployment = goldstackConfig.deployments.find(
    (deployment) => deployment.name === deploymentName
  );
  if (!deployment) {
    throw new Error(`Cannot find deployment with name ${deploymentName}`);
  }
  return 'https://' + deployment.configuration.apiDomain;
};
