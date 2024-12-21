import {
  getTableName,
  startLocalDynamoDB,
  stopAllLocalDynamoDB,
  stopLocalDynamoDB,
} from './templateDynamoDBTable';
import { ThisPackage } from './types/DynamoDBPackage';
import { check } from 'tcp-port-used';
import { connect } from './templateDynamoDBTable';
import { PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { createTestMigrations } from './testUtils/testMigrations';
import { findFreePorts } from 'find-free-ports';
import { debug } from '@goldstack/utils-log';

jest.setTimeout(240000);

describe('DynamoDB Template', () => {
  const mockConfig1: ThisPackage = {
    name: 'test-dynamodb-1',
    template: 'dynamodb',
    templateVersion: '0.1.0',
    $schema: '../schemas/package.schema.json',
    configuration: {
      // Package level configuration if needed
    },
    deployments: [
      {
        name: 'local',
        awsRegion: 'us-east-1',
        awsUser: 'local',
        configuration: {
          tableName: 'test-table-1',
        },
      },
    ],
  };

  const mockConfig2: ThisPackage = {
    name: 'test-dynamodb-2',
    template: 'dynamodb',
    templateVersion: '0.1.0',
    $schema: '../schemas/package.schema.json',
    configuration: {
      // Package level configuration if needed
    },
    deployments: [
      {
        name: 'local',
        awsRegion: 'us-east-1',
        awsUser: 'local',
        configuration: {
          tableName: 'test-table-2',
        },
      },
    ],
  };

  const mockSchema = {
    type: 'object',
    properties: {},
  };

  it('should handle reference counting and port-specific stopping correctly', async () => {
    // Get two free ports for our DynamoDB instances
    const [port1, port2] = await findFreePorts(2);

    // Start first instance on first free port
    await startLocalDynamoDB(mockConfig1, mockSchema, port1, 'local');
    expect(await check(port1)).toBe(true);

    // Start second instance on second free port
    await startLocalDynamoDB(mockConfig2, mockSchema, port2, 'local');
    expect(await check(port2)).toBe(true);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 5000);
    });
    // Create clients for both instances
    const client1 = await connect({
      goldstackConfig: mockConfig1,
      packageSchema: mockSchema,
      migrations: createTestMigrations(),
      deploymentName: 'local',
    });

    const client2 = await connect({
      goldstackConfig: mockConfig2,
      packageSchema: mockSchema,
      migrations: createTestMigrations(),
      deploymentName: 'local',
    });

    // Write item to first table
    const testItem = {
      pk: { S: 'test-id' },
      sk: { S: 'test-data' },
    };

    const tableName1 = await getTableName(mockConfig1, mockSchema, 'local');
    const tableName2 = await getTableName(mockConfig2, mockSchema, 'local');

    await client1.send(
      new PutItemCommand({
        TableName: tableName1,
        Item: testItem,
      })
    );

    // Try to read from first table - should succeed
    const response1 = await client1.send(
      new GetItemCommand({
        TableName: tableName1,
        Key: {
          pk: { S: 'test-id' },
          sk: { S: 'test-data' },
        },
      })
    );
    expect(response1.Item).toEqual(testItem);

    // Try to read from second table - should not find the item
    const response2 = await client2.send(
      new GetItemCommand({
        TableName: tableName2,
        Key: {
          pk: { S: 'test-id' },
          sk: { S: 'test-data' },
        },
      })
    );
    expect(response2.Item).toBeUndefined();

    // Start first instance again to test reference counting
    await startLocalDynamoDB(mockConfig1, mockSchema, port1, 'local');
    expect(await check(port1)).toBe(true);

    // First stop call should not actually stop the instance due to reference count
    await stopLocalDynamoDB(mockConfig1, mockSchema, port1, 'local');
    expect(await check(port1)).toBe(true);

    // Second stop call should stop the instance as reference count reaches 0
    await stopLocalDynamoDB(mockConfig1, mockSchema, port1, 'local');
    expect(await check(port1)).toBe(false);

    // Verify second instance is still running
    expect(await check(port2)).toBe(true);

    // Stop second instance with port parameter
    await stopLocalDynamoDB(mockConfig2, mockSchema, port2, 'local');
    expect(await check(port2)).toBe(false);
  });

  it('should handle default port when no port specified', async () => {
    const [customPort] = await findFreePorts(1);

    const defaultPort = 8000;
    // Start an instance on the default port with multiple references
    await startLocalDynamoDB(mockConfig1, mockSchema, undefined, 'local');
    await startLocalDynamoDB(mockConfig1, mockSchema, undefined, 'local');
    expect(await check(defaultPort)).toBe(true);

    // Start another instance on a custom port
    await startLocalDynamoDB(mockConfig2, mockSchema, customPort, 'local');
    expect(await check(customPort)).toBe(true);

    // First stop call without port should only decrement default port counter
    await stopLocalDynamoDB(mockConfig1, mockSchema, 'local');
    expect(await check(defaultPort)).toBe(true); // Still running due to second reference
    expect(await check(customPort)).toBe(true); // Unaffected

    // Second stop call without port should stop default port instance
    await stopLocalDynamoDB(mockConfig1, mockSchema, 'local');
    debug('Stop local dynamoDB completed');
    expect(await check(defaultPort)).toBe(false); // Stopped as counter reached 0
    expect(await check(customPort)).toBe(true); // Still unaffected

    // Clean up custom port instance
    await stopLocalDynamoDB(mockConfig2, mockSchema, customPort, 'local');
    expect(await check(customPort)).toBe(false);
  });

  afterAll(async () => {
    await stopAllLocalDynamoDB(mockConfig1, mockSchema, 'local');
  });
});
