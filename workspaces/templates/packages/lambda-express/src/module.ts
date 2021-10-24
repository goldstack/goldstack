import goldstackConfig from './../goldstack.json';

let testServerPort: null | number = null;

let testServer: any = null;

if (process.env.TEST_SERVER_PORT) {
  testServerPort = parseInt(process.env.TEST_SERVER_PORT);
}

export const startTestServer = async (port: number): Promise<void> => {
  // The below is preventing webpack from bundling up the server - it is only required for local tests.
  testServer = await eval(
    `var server = require('./server.ts'); var promise = server.start(${port}); promise;`
  );
  testServerPort = port;
};

export const stopTestServer = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    testServer.close((err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

export const getEndpoint = (deploymentName?: string): string => {
  if (!deploymentName) {
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    const port = testServerPort || 3030;

    return `http://localhost:${port}`;
  }
  const deployment = goldstackConfig.deployments.find(
    (deployment) => (deployment as any).name === deploymentName
  );
  if (!deployment) {
    throw new Error(`Cannot find deployment with name ${deploymentName}`);
  }
  return 'https://' + (deployment as any).configuration.apiDomain;
};
