'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const client_dynamodb_1 = require('@aws-sdk/client-dynamodb');
const lib_dynamodb_1 = require('@aws-sdk/lib-dynamodb');
const assert_1 = __importDefault(require('assert'));
const dynamodb_toolbox_1 = require('dynamodb-toolbox');
const entities_1 = require('./entities');
const table_1 = require('./table');
// needs to be long to download Docker image etc.
jest.setTimeout(120000);
describe('DynamoDB Table', () => {
  beforeAll(async () => {
    await (0, table_1.startLocalDynamoDB)();
  });
  it('Should connect to local table', async () => {
    var _a;
    const tableName = await (0, table_1.getTableName)();
    (0, assert_1.default)(tableName);
    const dynamoDB = await (0, table_1.connect)();
    (0, assert_1.default)(dynamoDB);
    const tableInfo = await dynamoDB.send(
      new client_dynamodb_1.DescribeTableCommand({
        TableName: tableName,
      }),
    );
    (0, assert_1.default)(
      ((_a = tableInfo.Table) === null || _a === void 0 ? void 0 : _a.TableStatus) === 'ACTIVE',
    );
    const dynamoDB2 = await (0, table_1.connect)();
    (0, assert_1.default)(dynamoDB2);
  });
  it('Should be able to instantiate Toolbox table', async () => {
    const dynamoDB = await (0, table_1.connect)();
    const table1 = await (0, table_1.connectTable)({ client: dynamoDB });
    (0, assert_1.default)(table1);
    const table2 = await (0, table_1.connectTable)({
      documentClient: lib_dynamodb_1.DynamoDBDocument.from(dynamoDB),
    });
    (0, assert_1.default)(table2);
    const table3 = await (0, table_1.connectTable)();
    (0, assert_1.default)(table3);
  });
  it('Should be able to write and read an entity with native toolbox methods', async () => {
    const table = new dynamodb_toolbox_1.Table({
      name: await (0, table_1.getTableName)(),
      partitionKey: {
        name: 'pk',
        type: 'string',
      },
      sortKey: {
        name: 'sk',
        type: 'string',
      },
      documentClient: lib_dynamodb_1.DynamoDBDocument.from(await (0, table_1.connect)()),
    });
    const e = new dynamodb_toolbox_1.Entity({
      name: 'User',
      schema: (0, dynamodb_toolbox_1.item)({
        pk: (0, dynamodb_toolbox_1.string)().key(),
        sk: (0, dynamodb_toolbox_1.string)().key(),
        name: (0, dynamodb_toolbox_1.string)().required(),
        emailVerified: (0, dynamodb_toolbox_1.boolean)().required(),
      }),
      table,
    });
    await e
      .build(dynamodb_toolbox_1.PutItemCommand)
      .item({
        pk: 'joe@email.com',
        sk: 'admin',
        name: 'Joe',
        emailVerified: true,
      })
      .send();
    const { Item: user } = await e
      .build(dynamodb_toolbox_1.GetItemCommand)
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
    const table = await (0, table_1.connectTable)();
    const Users = (0, entities_1.createUserEntity)(table);
    const data = {
      userId: 'user-123',
      name: 'Joe',
      email: 'joe@email.com',
      emailVerified: true,
    };
    await Users.build(dynamodb_toolbox_1.PutItemCommand).item(data).send();
    const { Item: item } = await Users.build(dynamodb_toolbox_1.GetItemCommand)
      .key({ userId: 'user-123' })
      .send();
    if (!item) {
      throw new Error('Result not found');
    }
    // this cast not really required but illustrates how we can pass
    // values obtained from the database around.
    const user = item;
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
    const table = await (0, table_1.connectTable)();
    const Users1 = (0, entities_1.createUserEntity)(table);
    await Users1.build(dynamodb_toolbox_1.PutItemCommand)
      .item({
        userId: 'user-456',
        name: 'Joe',
        email: 'joe@email.com',
        emailVerified: true,
      })
      .send();
    const Users2 = (0, entities_1.createUserEntity)(table);
    const { Item: user } = await Users2.build(dynamodb_toolbox_1.GetItemCommand)
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
    const table = await (0, table_1.connectTable)();
    const Users = (0, entities_1.createUserEntity)(table);
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
      await Users.build(dynamodb_toolbox_1.PutItemCommand).item(user).send();
    }
    // Query the GSI for users with email 'alice@example.com'
    const client = await (0, table_1.connect)();
    const queryResult = await client.send(
      new client_dynamodb_1.QueryCommand({
        TableName: await (0, table_1.getTableName)(),
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
    const emails = queryResult.Items.map((item) => {
      var _a;
      return (_a = item.email) === null || _a === void 0 ? void 0 : _a.S;
    }).sort();
    expect(emails).toEqual(['alice@example.com', 'alice@example.com']);
    // Check names
    const names = queryResult.Items.map((item) => {
      var _a;
      return (_a = item.name) === null || _a === void 0 ? void 0 : _a.S;
    }).sort();
    expect(names).toEqual(['Alice', 'Charlie']);
  });
  afterAll(async () => {
    // no need for us to do this, we rely on `scripts/globalTeardown.ts`
    // await stopLocalDynamoDB();
  });
});
//# sourceMappingURL=table.spec.js.map
