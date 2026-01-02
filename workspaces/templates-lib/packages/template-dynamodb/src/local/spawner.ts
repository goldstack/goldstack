import { info, warn } from '@goldstack/utils-log';
import { commandExists, execAsync } from '@goldstack/utils-sh';
import * as dynamoDBLocal from 'dynamo-db-local';
import { check } from 'tcp-port-used';
import waitPort from 'wait-port';
import type { DynamoDBInstance } from './localDynamoDB';

/**
 * Options for spawning a DynamoDB instance
 */
interface SpawnOptions {
  port: number;
  path?: string | null;
  detached?: boolean;
}

/**
 * Spawns a new DynamoDB instance using either Java or Docker
 */
export async function spawnInstance(options: SpawnOptions): Promise<DynamoDBInstance> {
  if (await check(options.port)) {
    warn(
      `Port ${options.port} is already in use. Assuming another instance of DynamoDB is already running.`,
    );
    return {
      port: options.port,
    };
  }

  // Try Java first
  const javaInstance = await tryJavaSpawn(options);
  if (javaInstance) {
    return javaInstance;
  }

  // Fallback to Docker
  const dockerInstance = await tryDockerSpawn(options);
  if (dockerInstance) {
    return dockerInstance;
  }

  throw new Error('Either Docker or Java needs to be installed to run local DynamoDB');
}

async function tryJavaSpawn(options: SpawnOptions): Promise<DynamoDBInstance | null> {
  let javaViable = commandExists('java');

  if (javaViable) {
    try {
      await execAsync('java -version');
    } catch (e) {
      warn(
        "'java' command is available but it does not work. This is common on never versions of Mac OS X without Java installed.\n" +
          'To use Java, please install it.',
      );
      javaViable = false;
    }
  }

  if (!javaViable) {
    return null;
  }

  info(`Starting local DynamoDB with Java on port ${options.port}`);
  const pr = dynamoDBLocal.spawn({
    port: options.port,
    path: options.path,
    detached: options.detached,
  });

  if (!pr.pid) {
    throw new Error('Process id cannot be identified.');
  }

  await Promise.all([
    await waitPort({
      host: 'localhost',
      port: options.port,
      output: 'silent',
    }),
    await new Promise<void>((resolve) => {
      pr.stdout.once('data', () => resolve());
    }),
  ]);

  info(`Started local DynamoDB with Java on port ${options.port}`);
  return {
    port: options.port,
    processId: pr.pid,
  };
}

async function tryDockerSpawn(options: SpawnOptions): Promise<DynamoDBInstance | null> {
  if (!commandExists('docker')) {
    return null;
  }

  info('Starting local DynamoDB with Docker');
  const detached = global['CI'] ? true : false;
  const hash = Date.now();
  const containerName = 'goldstack-local-dynamodb-' + hash;

  const pr = dynamoDBLocal.spawn({
    port: options.port,
    command: 'docker',
    name: containerName,
    path: options.path,
    detached,
  });

  if (detached) {
    pr.unref();
  }

  await waitPort({
    host: 'localhost',
    port: options.port,
    output: 'silent',
  });

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 5000);
  });

  return {
    port: options.port,
    dockerContainerId: containerName,
  };
}
