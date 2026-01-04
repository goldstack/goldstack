import { DescribeTableCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import assert from 'assert';
import {
  boolean,
  Entity,
  GetItemCommand,
  item,
  PutItemCommand,
  string,
  Table,
} from 'dynamodb-toolbox';

import { createUserEntity, type InputUserValue } from './entities';

import { connect, connectTable, getTableName, startLocalDynamoDB } from './table';

// needs to be long to download Docker image etc.
jest.setTimeout(120000);

describe('DynamoDB Table', () => {
  beforeAll(async () => {
    await startLocalDynamoDB();
  });
  it('Should connect to local table', async () => {
    const tableName = await getTableName();
    assert(tableName);
    const dynamoDB = await connect();
    assert(dynamoDB);
    const tableInfo = await dynamoDB.send(
      new DescribeTableCommand({
        TableName: tableName,
      }),
    );

    assert(tableInfo.Table?.TableStatus === 'ACTIVE');
    const dynamoDB2 = await connect();
    assert(dynamoDB2);
  });

  it('Should be able to instantiate Toolbox table', async () => {
    const dynamoDB = await connect();
    const table1 = await connectTable({ client: dynamoDB });
    assert(table1);
    const table2 = await connectTable({
      documentClient: DynamoDBDocument.from(dynamoDB),
    });
    assert(table2);
    const table3 = await connectTable();
    assert(table3);
  });

  it('Should be able to write and read an entity with native toolbox methods', async () => {
    const table = new Table({
      name: await getTableName(),
      partitionKey: {
        name: 'pk',
        type: 'string',
      },
      sortKey: {
        name: 'sk',
        type: 'string',
      },
      documentClient: DynamoDBDocument.from(await connect()),
    });

    const e = new Entity({
      name: 'User',
      schema: item({
        pk: string().key(),
        sk: string().key(),
        name: string().required(),
        emailVerified: boolean().required(),
      }),
      table,
    } as const);

    await e
      .build(PutItemCommand)
      .item({
        pk: 'joe@email.com',
        sk: 'admin',
        name: 'Joe',
        emailVerified: true,
      })
      .send();

    const { Item: user } = await e
      .build(GetItemCommand)
      .key({
        pk: 'joe@email.com',
        sk: 'admin',
      })
      .options({
        attributes: ['name', 'pk'],
      })
      .send();

    if (!user) {
      throw new Error('Result not found');
    }
    expect(user.name).toEqual('Joe');
  });

  it('Should be able to write and read an entity with entities', async () => {
    const table = await connectTable();
    const Users = createUserEntity(table);

    const data: InputUserValue = {
      userId: 'user-123',
      name: 'Joe',
      email: 'joe@email.com',
      emailVerified: true,
    };

    await Users.build(PutItemCommand).item(data).send();

    const { Item: item } = await Users.build(GetItemCommand).key({ userId: 'user-123' }).send();

    if (!item) {
      throw new Error('Result not found');
    }

    // this cast not really required but illustrates how we can pass
    // values obtained from the database around.
    const user = item as InputUserValue;
    expect(user.name).toEqual('Joe');
    expect(user.email).toEqual('joe@email.com');
    expect(user.userId).toEqual('user-123');
  });

  /**
   * There was in earlier versions some strange behaviour when creating entities multiple times.
   * This seems to be resolved in version 1 of Dynamo DB Toolbox, but just keeping this test case
   * to rule out this could be happening in the future.
   * https://github.com/jeremydaly/dynamodb-toolbox/issues/366#issuecomment-1366311354
   */
  it('Should be able to instantiate entity with deepCopy', async () => {
    const table = await connectTable();
    const Users1 = createUserEntity(table);

    await Users1.build(PutItemCommand)
      .item({
        userId: 'user-456',
        name: 'Joe',
        email: 'joe@email.com',
        emailVerified: true,
      })
      .send();

    const Users2 = createUserEntity(table);

    const { Item: user } = await Users2.build(GetItemCommand)
      .key({
        userId: 'user-456',
      })
      .options({
        attributes: ['name', 'email'],
      })
      .send();

    if (!user) {
      throw new Error('Result not found');
    }
    expect(user.name).toEqual('Joe');
    expect(user.email).toEqual('joe@email.com');
  });

  it('Should be able to search users by email using GSI', async () => {
    const table = await connectTable();
    const Users = createUserEntity(table);

    // Create multiple users
    const users = [
      {
        userId: 'user-789',
        name: 'Alice',
        email: 'alice@example.com',
        emailVerified: true,
      },
      {
        userId: 'user-790',
        name: 'Bob',
        email: 'bob@example.com',
        emailVerified: false,
      },
      {
        userId: 'user-791',
        name: 'Charlie',
        email: 'alice@example.com', // Same email as Alice to test multiple users
        emailVerified: true,
      },
    ];

    for (const user of users) {
      await Users.build(PutItemCommand).item(user).send();
    }

    // Query the GSI for users with email 'alice@example.com'
    const client = await connect();
    const queryResult = await client.send(
      new QueryCommand({
        TableName: await getTableName(),
        IndexName: 'gs1',
        KeyConditionExpression: 'gs1_pk = :gs1_pk',
        ExpressionAttributeValues: {
          ':gs1_pk': { S: 'EMAIL#alice@example.com' },
        },
      }),
    );

    if (!queryResult.Items || queryResult.Items.length === 0) {
      throw new Error('No users found for email');
    }

    // Should find both Alice users
    expect(queryResult.Items.length).toBe(2);

    // Check that both have the correct email
    const emails = queryResult.Items.map((item) => item.email?.S).sort();
    expect(emails).toEqual(['alice@example.com', 'alice@example.com']);

    // Check names
    const names = queryResult.Items.map((item) => item.name?.S).sort();
    expect(names).toEqual(['Alice', 'Charlie']);
  });

  afterAll(async () => {
    // no need for us to do this, we rely on `scripts/globalTeardown.ts`
    // await stopLocalDynamoDB();
  });
});
