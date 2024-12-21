<p align="right"><img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="12"> Generated with <a href="https://goldstack.party">Goldstack</a></p>

<p align="center">
  <a href="https://goldstack.party/templates/dynamodb">
    <img src="https://cdn.goldstack.party/img/202205/dynamodb.svg" height="80">
    <h1 align="center">DynamoDB Boilerplate</h1>
  </a>
</p>

Boilerplate for getting started with DynamoDB in Node.js using best practices from [DynamoDB Toolbox](https://github.com/jeremydaly/dynamodb-toolbox).

```typescript
const table = await connectTable();
const Users = UserEntity(table);

await Users.build(PutItemCommand)
  .item({
    email: 'joe@email.com',
    name: 'Joe',
    emailVerified: true,
  })
  .send();

const { Item: user } = await Users.build(GetItemCommand)
  .key({ email: 'joe@email.com' })
  .options({
    attributes: ['name', 'email'],
  })
  .send();
```

This boilerplate has been automatically generated from the template:

<table>
  <tbody>
    <tr>
      <td>
        <p align="center"><a href="https://goldstack.party/templates/dynamodb"><img width="50" src="https://cdn.goldstack.party/img/202205/dynamodb.svg"></a></p>
        <p><a href="https://goldstack.party/templates/dynamodb">DynamoDB</a></p>
      </td>
    </tr>
  </tbody>
</table>

Feel free to fork this repository and modify it for your needs, or use the [Goldstack project builder](https://goldstack.party/build) to generate a boilerplate specifically generated for your project.

⚠️ Before forking this boilerplate, consider if you would want to start with a project that contains a server template as well, such as [Serverless API](https://goldstack.party/templates/serverless-api) or [Serverless Express.js](https://goldstack.party/templates/express-lambda).

# Features

*   Create DynamoDB table
*   Run migrations using Umzug
*   Easy to use API
*   Strong typing using DynamoDB Toolbox
*   Easy local testing (recommended to install Java)
*   Supports multiple environments (development, production)
*   Provides way to extend infrastructure using Terraform

# Development

This boilerplate will come with a module that provides the functionalities for connecting to DynamoDB from Node.js. This module is defined in `packages/dynamodb-1`.

In order to make use of the DynamoDB package we principally want to do two things:

*   Define the schema for our table
*   Write application logic to work with the data in the table

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

    await startLocalDynamoDB(8080);

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

# Getting Started

Thank you for using this boilerplate. For any questions or feedback, please be welcome to [raise an issue on GitHub](https://github.com/goldstack/goldstack/issues) 🤗 .

## 1. Fork and clone the repository

Fork this repository and then clone the fork into your local machine.

For more information, see [GitHub documentation - Fork a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)

## 2. Install required local dependencies

A few dependencies need to be available in your development system. Please verify they are present or install them.

*   Node v20+
*   Yarn v1.22.5+
*   Docker v20+

Open a terminal and run the following commands:

```bash
node -v
yarn -v
docker --version
```

This should produce the following output:

![Confirming versions in the console](https://cdn.goldstack.party/img/202203/confirm_versions.png)

If you need to install or update any of the dependencies, please see the following guides:

*   [Downloading and installing Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
*   [Yarn Installation](https://yarnpkg.com/getting-started/install)
*   [Install Docker for Windows](https://docs.docker.com/docker-for-windows/install/) / [Install Docker for Mac](https://docs.docker.com/docker-for-mac/install/)

## 3. Initialise project and install NPM Dependencies

Run `yarn` in your project directory to install and download all dependencies.

The installation process should take around 3-10 minutes depending on the dependencies that need to be downloaded.

![Installing project dependencies](https://cdn.goldstack.party/img/202203/install_project.gif)

You can confirm everything was installed correctly by running `yarn -v`. This should show a yarn version of `3.0.0+`.

![Confirming Yarn Version after install](https://cdn.goldstack.party/img/202203/confirm_yarn_version_after_install.png)

## 4. Build modules

Make sure that the project compiles correctly by running `yarn build` your project directory:

![Building your project](https://cdn.goldstack.party/img/202203/build_project.gif)

Note that this command also ensures that all TypeScript project references are configured correctly.

## 5. Configure VSCode

In order to setup VSCode, open the project in VSCode.

VSCode may prompt you to ask if you trust the authors of the workspace. Respond with Yes.

<img src="https://cdn.goldstack.party/img/202201/trust_authors.png" width="300" alt="VSCode Prompt trust authors">

You may also be asked if you want to install recommended extensions for this workspace. We recommend to do so since the template will be optimised to work with the suggested extensions.

![VSCode Prompt install extensions](https://cdn.goldstack.party/img/202201/install_extensions.png)

If you want to install the necessary extensions manually, here are links to the extensions required:

*   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
*   [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
*   [ZipFS](https://marketplace.visualstudio.com/items?itemName=arcanis.vscode-zipfs) (optional)

## 6. Initialise TypeScript

Locate a `.ts` or `.tsx` file in the workspace and open it. When asked whether to use the workspace TypeScript version, click *Allow*.

<img src="https://cdn.goldstack.party/img/202201/allow_typescript.gif"  alt="VSCode Locate TypeScript">

In the status bar on the bottom right-hand corner of the VSCode editor you should now see *TypeScript*.

![TypeScript status icon in VSCode](https://cdn.goldstack.party/img/202203/typescript_init.png)

## 7. AWS Infrastructure Configuration

The template will create a DynamoDB table on AWS for you. For this, you simply need to modify the configuration included in this template.

Specifically, the [goldstack.json](https://github.com/goldstack/dynamodb-boilerplate/blob/master/packages/dynamodb-1/goldstack.json) in the `packages/dynamodb-1` folder.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "dynamodb-1",
  "template": "dynamodb",
  "templateVersion": "0.1.0",
  "configuration": {},
  "deployments": [
    {
      "name": "prod",
      "awsUser": "goldstack-dev",
      "awsRegion": "us-west-2",
      "configuration": {
        "tableName": "goldstack-ci-test-dynamodb-1652737960033"
      },
      "tfStateKey": "dynamodb-1-prod-98604cbb6b7326ee9a68.tfstate"
    }
  ]
}
```

The key property you will need to update is:

*   `deployments[0].configuration.tableName`

You also need to *delete* `deployments[0].tfStateKey`.

You will also need to ensure that you have a valid AWS user configure to deploy to AWS. For this, create a file in `/config/infra/config.json` (relative to project root).

```json
{
  "users": [
    {
      "name": "goldstack-dev",
      "type": "apiKey",
      "config": {
        "awsAccessKeyId": "...",
        "awsSecretAccessKey": "...",
        "awsDefaultRegion": "us-west-2"
      }
    },
    {
      "name": "goldstack-prod",
      "type": "apiKey",
      "config": {
        "awsAccessKeyId": "...",
        "awsSecretAccessKey": "",
        "awsDefaultRegion": "us-west-2"
      }
    }
  ]
}
```

For more information on configuring your local AWS users, please see [Goldstack Documentation / AWS Configuration](https://docs.goldstack.party/docs/goldstack/configuration#aws-configuration).

Once your AWS user is configured you can run `yarn infra up prod` in the `/packages/dynamodb-1` folder. For more information on the infrastructure commands for this project, see [Goldstack Documentation / DynamoDB / Infrastructure]().

## 8. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
