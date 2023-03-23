import {
  connect,
  getTableName,
  startLocalDynamoDB,
  stopLocalDynamoDB,
} from '@goldstack/dynamodb';

jest.setTimeout(120000);

it('Should connect to DynamoDB table', async () => {
  await startLocalDynamoDB();

  const table = await connect();

  const res = await table
    .describeTable({
      TableName: await getTableName(),
    })
    .promise();

  expect(res.Table?.TableName?.length).toBeGreaterThan(2);
  expect(table).toBeDefined();

  await stopLocalDynamoDB();
});
