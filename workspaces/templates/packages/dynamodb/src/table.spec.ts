import assert from 'assert';
import { getTableName, connect } from './table';

describe('DynamoDB Table', () => {
  it('Should get table name', async () => {
    const tableName = await getTableName('prod');
    expect(tableName).toEqual('goldstack-test-dynamodb-table');
  });

  it('Should get local table name', async () => {
    const tableName = await getTableName();
    expect(tableName).toEqual('local-dynamodb');
  });

  it('Should connect to local bucket', async () => {
    const tableName = await getTableName();
    const dynamoDB = await connect();
    assert(tableName);
    assert(dynamoDB);
  });
});
