import assert from 'assert';
import { getTableName, connect, stopLocalDynamoDB } from './table';

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
});
