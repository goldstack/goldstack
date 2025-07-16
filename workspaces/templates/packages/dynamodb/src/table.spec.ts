import assert from 'assert';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  boolean,
  Entity,
  GetItemCommand,
  PutItemCommand,
  schema,
  string,
  Table,
} from 'dynamodb-toolbox';

import { createUserEntity, type InputUser, type UserEntity, type ValidUserValue } from './entities';

import {
  getTableName,
  connect,
  stopLocalDynamoDB,
  startLocalDynamoDB,
  connectTable,
} from './table';

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
      schema: schema({
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
    const Users: UserEntity = createUserEntity(table);

    const data: InputUser = {
      email: 'joe@email.com',
      name: 'Joe',
      emailVerified: true,
    };

    await Users.build(PutItemCommand).item(data).send();

    const { Item: item } = await Users.build(GetItemCommand).key({ email: 'joe@email.com' }).send();

    if (!item) {
      throw new Error('Result not found');
    }

    // this cast not really required but illustrates how we can pass
    // values obtained from the database around.
    const user: ValidUserValue = item;
    expect(user.name).toEqual('Joe');
    expect(user.email).toEqual('joe@email.com');
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
        email: 'joe@email.com',
        name: 'Joe',
        type: 'user',
        emailVerified: true,
      })
      .send();

    const Users2 = createUserEntity(table);

    const { Item: user } = await Users2.build(GetItemCommand)
      .key({
        email: 'joe@email.com',
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

  afterAll(async () => {
    // no need for us to do this, we rely on `scripts/globalTeardown.ts`
    // await stopLocalDynamoDB();
  });
});
