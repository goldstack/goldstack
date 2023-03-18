import { connect, getTableName } from '@goldstack/dynamodb';

jest.setTimeout(120000);

it('Should connect to DynamoDB table', async () => {
  const table = await connect();

  const res = await table
    .describeTable({
      TableName: await getTableName(),
    })
    .promise();

  expect(res.Table?.TableName?.length).toBeGreaterThan(2);
  expect(table).toBeDefined();
});
