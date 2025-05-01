In order to make use of the DynamoDB package we principally want to do two things:

- Define the schema for our table
- Write application logic to work with the data in the table

In this template, the former will be done within the DynamoDB package but the latter can either happen in other packages. For instance, if you have included a [Serverless API](https://goldstack.party/templates/lambda-api) template in your project, you can define your logic for working with the data in DynamoDB in that package. However, you can also write additional code in the DynamoDB package and define a lightweight DOA layer.

#### Defining the Schema

While DynamoDB is a NoSQL data store and strictly speaking does not require a database schema in the traditional sense, it is strongly recommended to define some basic schema for the data we want to store. This template provides and easy way to define a schema using [DynamoDB Toolbox](https://github.com/jeremydaly/dynamodb-toolbox). Note though that this is optional.

The entities we want to store in the table are defined in the file `entities.ts` which is included in the DynamoDB package:

```typescript
import { boolean, Entity, schema, string, Table } from 'dynamodb-toolbox';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import memoizee from 'memoizee';
import { Key } from 'dynamodb-toolbox/dist/esm/table/types';

export function createTable(
  dynamoDB: DynamoDBDocumentClient,
  tableName: string
): Table<Key<string, 'string'>, Key<string, 'string'>> {
  const table = new Table({
    name: tableName,
    partitionKey: {
      name: 'pk',
      type: 'string',
    },
    sortKey: {
      name: 'sk',
      type: 'string',
    },
    documentClient: dynamoDB,
  });
  return table;
}

export function UserEntityFn(
  table: Table<Key<string, 'string'>, Key<string, 'string'>>
) {
  const entity = new Entity({
    name: 'User',
    schema: schema({
      email: string().key().savedAs('pk'),
      type: string().key().default('user').savedAs('sk'),
      name: string().required(),
      emailVerified: boolean().required(),
    }),
    table: table,
  } as const);

  return entity;
}

export const UserEntity = memoizee(UserEntityFn);
```

You can edit and extend these entities. Note though that it is recommended not to change the name of the `partionKey` (`pk`) and `sortKey` (`sk`).

This template is based on the assumption that all entities are defined in the same DynamoDB table. This is the recommended way to define a schema in DynamoDB.

One key aspect of developing with DynamoDB is to build efficient indices to access your data. This is done using so called Global Secondary Indices (GSI). If you want to define these, you should do so as part of a migration.

Data migrations are defined in the file `migrations.ts` which is included in the template:

```typescript
import { InputMigrations } from 'umzug/lib/types';
import { DynamoDBContext } from '@goldstack/template-dynamodb';

import { marshall } from '@aws-sdk/util-dynamodb';

/**
 * Umzug migrations applied during connection see https://github.com/sequelize/umzug#migrations
 */
export const createMigrations = (): InputMigrations<DynamoDBContext> => {
  return [
    {
      name: '00-dummy-migration',
      async up({ context }) {
        await context.client
          .putItem({
            TableName: context.tableName,
            Item: marshall({
              pk: '#DUMMY',
              sk: 'hello-world',
            }),
          })
          .promise();
      },
      async down({ context }) {
        await context.client
          .deleteItem({
            TableName: context.tableName,
            Key: marshall({
              pk: '#DUMMY',
              sk: 'hello-world',
            }),
          })
          .promise();
      },
    },
  ];
};
```

Change the included migration or add a migration to create GSIs using the Node.js SDK using the [`updateTable`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateTable-property) command.

#### Example: Add GSI

```typescript

export const createMigrations = (): InputMigrations<DynamoDBContext> => {
  return [
    {
      name: '00-add-gs1-index',
      async up({ context }) {
        try {
          // First, check if the GSI already exists
          const tableDescription = await context.client.send(
            new DescribeTableCommand({
              TableName: context.tableName,
            })
          );
          // Check if the gs1 index already exists
          const indexExists =
            tableDescription.Table?.GlobalSecondaryIndexes?.some(
              (index) => index.IndexName === 'gs1'
            );
          // Only create the index if it doesn't exist
          if (!indexExists) {
            const newAttributes: AttributeDefinition[] = [
              ...(tableDescription.Table?.AttributeDefinitions || []),
              {
                AttributeName: 'gs1_pk',
                AttributeType: 'S',
              },
              {
                AttributeName: 'gs1_sk',
                AttributeType: 'S',
              },
            ];
            // console.log(newAttributes);

            await context.client.send(
              new UpdateTableCommand({
                TableName: context.tableName,
                AttributeDefinitions: newAttributes,
                GlobalSecondaryIndexUpdates: [
                  {
                    Create: {
                      IndexName: 'gs1',
                      KeySchema: [
                        {
                          AttributeName: 'gs1_pk',
                          KeyType: 'HASH',
                        },
                        {
                          AttributeName: 'gs1_sk',
                          KeyType: 'RANGE',
                        },
                      ],
                      Projection: {
                        ProjectionType: 'ALL',
                      },
                    },
                  },
                ],
              })
            );
          }

          let active = false;
          let retriesLeft = 60;
          debug('Waiting for GSI to become active...');
          while (!active && retriesLeft > 0) {
            const describe = await context.client.send(
              new DescribeTableCommand({ TableName: context.tableName })
            );

            const gsi = describe.Table?.GlobalSecondaryIndexes?.find(
              (idx) => idx.IndexName === 'gs1'
            );

            debug('Index status: ' + gsi?.IndexStatus);
            active = gsi?.IndexStatus === 'ACTIVE';
            if (!active) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            retriesLeft--;
          }

          // you may want to migrate existing data to match to the GSI fields 
        } catch (e) {
          error('Error running migration: ' + e.message, { error: e });
          throw e;
        }
      },
      async down({ context }) {
        const tableDescription = await context.client.send(
          new DescribeTableCommand({
            TableName: context.tableName,
          })
        );

        // Check if the gs1 index already exists
        const indexExists =
          tableDescription.Table?.GlobalSecondaryIndexes?.some(
            (index) => index.IndexName === 'gs1'
          );

        // Nothing to do if index does not exist
        if (!indexExists) {
          return;
        }

        await context.client.send(
          new UpdateTableCommand({
            TableName: context.tableName,
            GlobalSecondaryIndexUpdates: [
              {
                Delete: {
                  IndexName: 'gs1',
                },
              },
            ],
          })
        );
      },
    },
  ];
};
```

#### Write Application Logic

There are two different ways in which you can define application logic: using the DynamoDB Toolbox entities (see previous section) or using the classes from the Node.js SDK.

If you want to use the DynamoDB Toolbox entities, you can utilise the method `connectTable` which is include in package:

```typescript
import { UserEntity, connectTable } from 'your-dynamodb-package';
```

You can then use the return object to instantiate your entities:

```typescript
const table = await connectTable();
const Users = new Entity({ ...deepCopy(UserEntity), table } as const);

await Users.build(PutItemCommand)
  .item({
    email: 'joe@email.com',
    name: 'Joe',
    emailVerified: true,
  })
  .send();
```

Note that the attributes defined in `UserEntity` need to be copied due to a bug in DynamoDBToolbox: [jeremydaly/dynamodb-toolbox#310](https://github.com/jeremydaly/dynamodb-toolbox/issues/310).

If you want to use the plain Node.js SDK method, you can utilise the methods `getTableName` and `connect` which are also included in the package:

```typescript
import { getTableName, connect } from 'your-dynamodb-package';
```

The `connect` method will return an instance of [`AWS.DynamoDB`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html) and we can use this to work with our table:

```typescript
const tableName = await getTableName();
const dynamoDB = await connect();
const tableInfo = await dynamoDB
  .describeTable({ TableName: tableName })
  .promise();
```

Note that if you are after an instance of [`AWS.DynamoDB.DocumentClient`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html), you can instantiate this using the `connect()` method as well:

```typescript
const documentClient = new DynamoDB.DocumentClient({
  service: await connect(),
});
```

#### Testing

To run test, you can use the methods `startLocalDynamoDB` and `stopLocalDynamoDB`:

```
it('Should connect to DynamoDB table', async () => {
  await startLocalDynamoDB();

  const table = await connect();

  const res = await table.send(
    new DescribeTableCommand({
      TableName: await getTableName(),
    })
  );

  expect(res.Table?.TableName?.length).toBeGreaterThan(2);
  expect(table).toBeDefined();

  await stopLocalDynamoDB();
});

```

You can specify a port where the local DynamoDB server should run:

```
await startLocalDynamoDB(8080);
```

By default the port `8000` will be used or the value of the environment variable `DYNAMODB_LOCAL_PORT)`.

Since starting local DynamoDB instances takes a long time, it is recommended, to only call the `startLocalDynamoDB` in your tests or test suites.

Then call `stopAllLocalDynamoDB` in a global teardown:

`scripts/globalTeardown.ts`:

```typescript
import { info } from '@goldstack/utils-log';
import { stopAllLocalDynamoDB } from './../src/table';

export default async () => {
  info(
    'Jest global teardown: Stopping all left over local DynamoDB instances.'
  );
  await stopAllLocalDynamoDB();
};
```

`jest.config.js`:

```javascript
// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./../../jest.config');

module.exports = {
  ...base,
  globalTeardown: '<rootDir>/scripts/globalTeardown.ts',
};
```
