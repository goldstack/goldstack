In order to make use of the DynamoDB package we principally want to do two things:

- Define the schema for our table
- Write application logic to work with the data in the table

In this template, the former will be done within the DynamoDB package but the latter can either happen in other packages. For instance, if you have included a [Serverless API](https://goldstack.party/templates/lambda-api) template in your project, you can define your logic for working with the data in DynamoDB in that package. However, you can also write additional code in the DynamoDB package and define a lightweight DOA layer.

#### Defining the Schema

While DynamoDB is a NoSQL data store and strictly speaking does not require a database schema in the traditional sense, it is strongly recommended to define some basic schema for the data we want to store. This template provides and easy way to define a schema using [DynamoDB Toolbox](https://github.com/jeremydaly/dynamodb-toolbox). Note though that this is optional.

The entities we want to store in the table are defined in the file `entities.ts` which is included in the DynamoDB package:

```typescript
import { Table } from 'dynamodb-toolbox';
import DynamoDB from 'aws-sdk/clients/dynamodb';

export function createTable<Name extends string>(
  dynamoDB: DynamoDB.DocumentClient,
  tableName: string
): Table<Name, 'pk', 'sk'> {
  return new Table({
    name: tableName,
    partitionKey: 'pk',
    sortKey: 'sk',
    DocumentClient: dynamoDB,
  });
}

export const UserEntity = {
  name: 'User',
  attributes: {
    email: { partitionKey: true },
    type: { sortKey: true, default: 'user' },
    name: { type: 'string', required: true },
    emailVerified: { type: 'boolean', required: true },
  },
} as const;
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

#### Write Application Logic

There are two different ways in which you can define application logic: using the DynamoDB Toolbox entities (see previous section) or using the classes from the Node.js SDK.

If you want to use the DynamoDB Toolbox entities, you can utilise the method `connectTable` which is include in package:

```typescript
import {
  User,
  UserEntity,
  UserKey
  connectTable,
} from 'your-dynamodb-package';
```

You can then use the return object to instantiate your entities:

```typescript
const table = await connectTable();
const Users = UserEntity(table);

await Users.put({
  email: 'joe@email.com',
  name: 'Joe',
  emailVerified: true,
});
```

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
