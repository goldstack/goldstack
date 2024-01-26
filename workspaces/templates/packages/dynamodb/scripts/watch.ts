import { connect, stopLocalDynamoDB } from './../src/table';
import * as readline from 'readline';
import { createServer } from 'dynamodb-admin';
import DynamoDB from 'aws-sdk/clients/dynamodb';

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
  let localAdminServer: undefined | any = undefined;
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
      console.log(`DynamoDB Admin started on http://localhost:${address.port}`);
      resolve();
    });
    localAdminServer.on('error', () => {
      console.warn(
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
    console.log('Shutting down local DynamoDB admin ...');
    await new Promise<void>((resolve, reject) => {
      localAdminServer.close(() => resolve());
    });
    console.log('  Local admin server shut down successfully');
  }
  console.log('Shutting down local DynamoDB ...');
  await stopLocalDynamoDB();
  console.log('  Local DynamoDB shut down successfully');
})();
