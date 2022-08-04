import goldstackConfig from './../goldstack.json';

import { excludeInBundle } from '@goldstack/utils-esbuild';

import { register } from 'node-css-require';

register();

const cors = process.env.CORS;

let testServerPort: null | number = null;

let testServer: any = null;

if (process.env.TEST_SERVER_PORT) {
  testServerPort = parseInt(process.env.TEST_SERVER_PORT);
}

export const startTestServer = async (port?: number): Promise<any> => {
  port = port || 3047;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { startServer } = require(excludeInBundle(
    '@goldstack/utils-aws-http-api-local'
  ));
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

export const stopTestServer = async (): Promise<void> => {
  return testServer.shutdown();
};

export const getEndpoint = (deploymentName?: string): string => {
  if (!deploymentName) {
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    const port = testServerPort || 3047;

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
