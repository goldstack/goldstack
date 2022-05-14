import assert from 'assert';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Entity, Table } from 'dynamodb-toolbox';
import { User, UserEntity, UserKey } from './entities';
import {
  getTableName,
  connect,
  stopLocalDynamoDB,
  connectTable,
} from './table';

// needs to be long to download Docker image etc.
jest.setTimeout(60000);

describe('DynamoDB Table', () => {
  it('Should get table name', async () => {
    const tableName = await getTableName('prod');
    expect(tableName).toEqual('goldstack-test-dynamodb-table');
  });

  it('Should get local table name', async () => {
    const tableName = await getTableName();
    expect(tableName).toEqual('local-dynamodb');
  });

  it('Should connect to local table', async () => {
    const tableName = await getTableName();
    assert(tableName);
    const dynamoDB = await connect();
    assert(dynamoDB);
    const tableInfo = await dynamoDB
      .describeTable({ TableName: tableName })
      .promise();

    assert(tableInfo.Table?.TableStatus === 'ACTIVE');
    const dynamoDB2 = await connect();
    assert(dynamoDB2);
    await stopLocalDynamoDB();
  });
  it('Should be able to write and read an entity with native toolbox methods', async () => {
    // const table = await connectTable();
    // const Users = UserEntity(table);

    const table = new Table({
      name: await getTableName(),
      partitionKey: 'pk',
      sortKey: 'sk',
      DocumentClient: new DynamoDB.DocumentClient({ service: await connect() }),
    });

    const e = new Entity({
      name: 'User',
      attributes: {
        pk: { partitionKey: true },
        sk: { hidden: true, sortKey: true },
        name: { type: 'string', required: true },
        emailVerified: { type: 'boolean', required: true },
      },
      table,
    } as const);

    await e.put({
      pk: 'joe@email.com',
      sk: 'd',
      name: 'Joe',
      emailVerified: true,
    });

    const { Item: user } = await e.get(
      { pk: 'joe@email.com', sk: 'd' },
      { attributes: ['name', 'pk'] }
    );

    expect(user.name).toEqual('Joe');
    await stopLocalDynamoDB();
  });
});
