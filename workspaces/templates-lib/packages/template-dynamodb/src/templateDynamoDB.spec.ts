import { startLocalDynamoDB, stopLocalDynamoDB } from './templateDynamoDBTable';
import { ThisPackage } from './types/DynamoDBPackage';
import { check } from 'tcp-port-used';
import { connect } from './templateDynamoDBTable';
import { PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { createTestMigrations } from './testUtils/testMigrations';

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

  afterEach(async () => {
    // Clean up both instances if they exist
    try {
      await stopLocalDynamoDB(mockConfig1, mockSchema, 'local');
    } catch (e) {
      // Ignore errors if instance wasn't running
    }
    try {
      await stopLocalDynamoDB(mockConfig2, mockSchema, 'local');
    } catch (e) {
      // Ignore errors if instance wasn't running
    }
  });

  it('should be able to run two DynamoDB instances with different tables on different ports', async () => {
    // Start first instance on port 8000
    await startLocalDynamoDB(mockConfig1, mockSchema, 8000, 'local');
    expect(await check(8000)).toBe(true);

    // Start second instance on port 8001
    await startLocalDynamoDB(mockConfig2, mockSchema, 8001, 'local');
    expect(await check(8001)).toBe(true);

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
      id: { S: 'test-id' },
      data: { S: 'test-data' },
    };

    await client1.send(
      new PutItemCommand({
        TableName: 'test-table-1',
        Item: testItem,
      })
    );

    // Try to read from first table - should succeed
    const response1 = await client1.send(
      new GetItemCommand({
        TableName: 'test-table-1',
        Key: {
          id: { S: 'test-id' },
        },
      })
    );
    expect(response1.Item).toEqual(testItem);

    // Try to read from second table - should not find the item
    const response2 = await client2.send(
      new GetItemCommand({
        TableName: 'test-table-2',
        Key: {
          id: { S: 'test-id' },
        },
      })
    );
    expect(response2.Item).toBeUndefined();

    // Stop first instance
    await stopLocalDynamoDB(mockConfig1, mockSchema, 'local');
    expect(await check(8000)).toBe(false);

    // Verify second instance is still running
    expect(await check(8001)).toBe(true);

    // Stop second instance
    await stopLocalDynamoDB(mockConfig2, mockSchema, 'local');
    expect(await check(8001)).toBe(false);
  }, 30000); // Increase timeout to 30s since starting DynamoDB instances can take time
});
