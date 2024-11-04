import {
  getTableName,
  startLocalDynamoDB,
  stopLocalDynamoDB,
} from './templateDynamoDBTable';
import { ThisPackage } from './types/DynamoDBPackage';
import { check } from 'tcp-port-used';
import { connect } from './templateDynamoDBTable';
import { PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { createTestMigrations } from './testUtils/testMigrations';

jest.setTimeout(240000);

describe('DynamoDB Template', () => {
  it('should be able to run two DynamoDB instances with different tables on different ports', async () => {
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

    // Stop first instance
    await stopLocalDynamoDB(mockConfig1, mockSchema, 'local');
    expect(await check(8000)).toBe(false);

    // Verify second instance is still running
    expect(await check(8001)).toBe(true);

    // Stop second instance
    await stopLocalDynamoDB(mockConfig2, mockSchema, 'local');
    expect(await check(8001)).toBe(false);
  }); // Increase timeout to 30s since starting DynamoDB instances can take time
});
