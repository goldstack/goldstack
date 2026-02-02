In order to make use of the DynamoDB package we principally want to do two things:

- Define the schema for our table
- Write application logic to work with the data in the table

In this template, the former will be done within the DynamoDB package but the latter can either happen in other packages. For instance, if you have included a [Serverless API](https://goldstack.party/templates/lambda-api) template in your project, you can define your logic for working with the data in DynamoDB in that package. However, you can also write additional code in the DynamoDB package and define a lightweight DOA layer.

#### Defining the Schema

While DynamoDB is a NoSQL data store and strictly speaking does not require a database schema in the traditional sense, it is strongly recommended to define some basic schema for the data we want to store. This template provides and easy way to define a schema using [DynamoDB Toolbox](https://github.com/jeremydaly/dynamodb-toolbox). Note though that this is optional.

The entities we want to store in the table are defined in the file `entities.ts` which is included in the DynamoDB package:

```typescript
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  boolean,
  Entity,
  type InputValue,
  item,
  string,
  Table as ToolboxTable,
  type TransformedValue,
  type ValidValue,
} from 'dynamodb-toolbox';

export type Table = ToolboxTable<
  {
    name: 'pk';
    type: 'string';
  },
  {
    name: 'sk';
    type: 'string';
  },
  {},
  '_et'
>;

export function createTable(dynamoDB: DynamoDBDocumentClient, tableName: string): Table {
  const table = new ToolboxTable({
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

/**
 * Schema for User entity that defines user metadata
 */
export const UserSchema = item({
  userId: string().key(),
  name: string().required(),
  email: string().required(),
  emailVerified: boolean().required(),
});

export type InputUserValue = InputValue<typeof UserSchema>;

export type ValidUserValue = ValidValue<typeof UserSchema>;

export type TransformedUserValue = TransformedValue<typeof UserSchema>;

export type ValidUser = ValidUserValue & { entity: 'User' };

/**
 * Creates a new User entity for the given DynamoDB table
 * @param table The DynamoDB table to create the entity for
 * @returns A new User entity
 */
export function createUserEntity(table: Table) {
  const entity = new Entity({
    name: 'User',
    schema: UserSchema,
    table: table,
    computeKey: ({ userId }) => ({
      pk: `USER#${userId}`,
      sk: `self`,
    }),
  });

  return entity;
}
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

Extend the schema with the attributes required for the Global Secondary Index:

```typescript
import { list } from 'dynamodb-toolbox/schema/list';

const BaseSchema = item({
  userId: string().key(),
  relationId: string().key(),
  databaseId: string().key(),
  possibleCreationDuplicates: list(string()).optional(),
  possibleUpdateDuplicates: list(string()).optional(),
});

export const DatabaseStateSchema = item({
  ...BaseSchema.props,
  gs1_pk: string()
    .optional()
    .link<typeof BaseSchema>(
      ({ databaseId }) => `DATABASE_STATE#${databaseId}`
    ),
  gs1_sk: string()
    .optional()
    .link<typeof BaseSchema>(({ relationId }) => `${relationId}`),
});
```

Then create the index in a migration using the GSI utility functions from the `template-dynamodb-cli` package (this will ensure it is available for local testing). The utilities handle checking for existing GSIs, creating new ones, and waiting for activation automatically.

```typescript
import { debug, error } from '@goldstack/utils-log';
import { gsiExists, getExistingAttributes, createGsi, deleteGsi } from 'template-dynamodb-cli';

export const createMigrations = (): InputMigrations<DynamoDBContext> => {
  return [
    {
      name: '00-add-gs1',
      async up({ context }) {
        try {
          debug('Starting migration 00-add-gs1');

          // Check if GSI already exists
          const exists = await gsiExists(context, 'gs1');
          if (exists) {
            debug('GSI gs1 already exists, skipping migration');
            return;
          }

          debug('GSI gs1 does not exist, proceeding with creation');

          // Get existing attributes
          const existingAttributes = await getExistingAttributes(context);
          debug(`Found ${existingAttributes.length} existing attribute definitions`);

          // Create the GSI
          await createGsi(context, 'gs1', existingAttributes);

          debug('Migration 00-add-gs1 completed successfully');
        } catch (e) {
          error(`Error running migration 00-add-gs1: ${e.message}`, { error: e });
          throw e;
        }
      },
      async down({ context }) {
        try {
          debug('Starting migration 00-add-gs1 down (deleting gs1)');

          // Check if GSI exists
          const exists = await gsiExists(context, 'gs1');
          if (!exists) {
            debug('GSI gs1 does not exist, skipping deletion');
            return;
          }

          debug('GSI gs1 exists, proceeding with deletion');

          // Delete the GSI
          await deleteGsi(context, 'gs1');

          debug('Migration 00-add-gs1 down completed successfully');
        } catch (e) {
          error(`Error running migration 00-add-gs1 down: ${e.message}`, { error: e });
          throw e;
        }
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

For local development and testing, you can use the `watch` script to start a DynamoDB Admin interface for monitoring your local database:

```bash
yarn watch
```

This starts the DynamoDB Admin web interface on port 8001 (configurable via `DYNAMODB_ADMIN_PORT`), connects to your local DynamoDB instance, and waits for you to press Enter to shut it down.

To manually start and stop local DynamoDB instances, use:

```bash
yarn start-local  # Starts on port 8000, logs to dynamodb-local.log
yarn stop-local   # Stops all local instances
```

For automated testing with Jest, you can use the methods `startLocalDynamoDB` and `stopLocalDynamoDB`:

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

#### Upgrading from DynamoDB Toolbox v1 to v2

This template uses DynamoDB Toolbox v2, which introduced several breaking changes from v1. If you're upgrading an existing project, here are the key changes you need to make:

##### Schema Creation

**v1:**
```typescript
import { schema } from 'dynamodb-toolbox';

const UserSchema = schema({
  email: string().key().savedAs('pk'),
  type: string().key().default('user').savedAs('sk'),
  name: string().required(),
  emailVerified: boolean().required(),
});
```

**v2:**
```typescript
import { item } from 'dynamodb-toolbox';

const UserSchema = item({
  email: string().key().savedAs('pk'),
  type: string().key().default('user').savedAs('sk'),
  name: string().required(),
  emailVerified: boolean().required(),
});
```

##### Entity Type Definitions

**v1:**
```typescript
export type UserEntity = Entity<
  'User',
  Table,
  typeof UserSchema,
  'entity',
  TimestampsDefaultOptions,
  true
>;
```

**v2:**
```typescript
export type UserEntity = Entity;
```

##### Entity Constructor

**v1:**
```typescript
const entity = new Entity({
  name: 'User',
  schema: UserSchema,
  table: table,
});
```

**v2:**
```typescript
const entity = new Entity({
  name: 'User',
  schema: UserSchema,
  table: table,
});
// computeKey is no longer required when schema defines keys with .key()
```

##### Key Operations

When performing key-based operations, ensure all key attributes are provided:

**v2:**
```typescript
// For entities with email and type as keys
await Users.build(GetItemCommand)
  .key({
    email: 'user@example.com',
    type: 'user',
  })
  .send();
```

##### Import Changes

Update your imports to use the new structure:

**v1:**
```typescript
import { boolean, Entity, schema, string, Table } from 'dynamodb-toolbox';
```

**v2:**
```typescript
import { boolean, Entity, item, string, Table as ToolboxTable } from 'dynamodb-toolbox';
```

##### Migration Steps

1. Update package.json to use `"dynamodb-toolbox": "^2.7.2"`
2. Change all `schema({...})` calls to `item({...})`
3. Update imports: replace `schema` with `item`
4. Simplify Entity type definitions to just `Entity`
5. Remove `computeKey` from Entity constructors (unless you have custom key computation)
6. Ensure all `.key()` calls in queries include all required key attributes
7. Update any custom schema extensions (like GSI examples) to use v2 syntax

The v2 API is more streamlined and provides better TypeScript support while maintaining the same core functionality.
