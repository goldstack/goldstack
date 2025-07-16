import {
  connect,
  stopAllLocalDynamoDB,
  stopLocalDynamoDB,
} from './../src/table';
import * as readline from 'readline';
import { createServer } from 'dynamodb-admin';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { info, warn } from '@goldstack/utils-log';

(async () => {
  const clientInner = await connect();
  if (!clientInner.config.endpoint || !clientInner.config.region) {
    throw new Error(
      'DynamoDB client object does not have required configuration properties: endpoint, region'
    );
  }
  const endpointConfig = await clientInner.config.endpoint();
  const endpoint = `${endpointConfig.protocol}//${endpointConfig.hostname}:${endpointConfig.port}${endpointConfig.path}`;
  const client = new DynamoDB({
    region: 'eu-central-1',
    endpoint: endpoint, // 'http://localhost:8000',
    credentials: {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy',
    },
  });
  let localAdminServer: undefined | any ;
  await new Promise<void>(async (resolve, reject) => {
    const localAdmin = await createServer(
      client as any, // otherwise strange type error occurs
      new DynamoDB.DocumentClient({ service: client })
    );
    const adminPort = process.env.DYNAMODB_ADMIN_PORT || '8001';
    localAdminServer = localAdmin.listen(adminPort, 'localhost');
    const server = localAdminServer;
    localAdminServer.on('listening', () => {
      const address = server.address();
      if (!address) {
        throw new Error('Local admin server not started successfully.');
      }
      info(`DynamoDB Admin started on http://localhost:${address.port}`);
      resolve();
    });
    localAdminServer.on('error', () => {
      warn(
        `Cannot start admin server on port ${adminPort}. Possibly admin server already started.`
      );
      resolve();
    });
  });
  await new Promise((resolve) => {
    const prompt = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    prompt.question('Press enter to shutdown DynamoDB database', () => {
      resolve(null);
      prompt.close();
    });
  });
  if (localAdminServer) {
    info('Shutting down local DynamoDB admin ...');
    await new Promise<void>((resolve, reject) => {
      localAdminServer.close(() => resolve());
    });
    info('  Local admin server shut down successfully');
  }
  info('Shutting down local DynamoDB ...');
  await stopLocalDynamoDB();
  await stopAllLocalDynamoDB();
  info('  Local DynamoDB shut down successfully');
})();
