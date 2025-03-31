# DynamoDB Template

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

The [DynamoDB template](https://goldstack.party/templates/dynamodb) provides a lightweight wrapper around the [AWS DynamoDB](https://aws.amazon.com/dynamodb/) service.

## Features

*   Create DynamoDB table
*   Run migrations using Umzug
*   Easy to use API
*   Strong typing using DynamoDB Toolbox
*   Easy local testing (recommended to install Java)
*   Supports multiple environments (development, production)
*   Provides way to extend infrastructure using Terraform

## Configure

In order to provide a basic configuration for the DynamoDB table, we only need to define the name of the table we want to use.

The template will create a basic table with this name with a partition and sort key. Further configuration of the table can be performed in code using migrations (`updateTable`). This can be used to define additional indices. Infrastructure configuration can be extended using Terraform.

## Getting Started

### 1. Project Setup

Before using this template, you need to configure the project. For this, please see the [Getting Started Guide](https://docs.goldstack.party/docs/goldstack/getting-started) on the Goldstack documentation.

For local testing, this module uses [DynamoDBLocal](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html).

Since DynamoDBLocal is run using Java, we recommend to [install Java](https://www.java.com/download/ie_manual.jsp) to perform local testing.

You can confirm that Java is configured correctly by running:

    $ java -version
    java version "11.0.3" 2019-04-16 LTS
    Java(TM) SE Runtime Environment 18.9 (build 11.0.3+12-LTS)
    Java HotSpot(TM) 64-Bit Server VM 18.9 (build 11.0.3+12-LTS, mixed mode)

Local testing also supports a fallback using Docker when Java is not installed, but this is currently [not recommended](https://github.com/goldstack/goldstack/pull/309) to be used.

### 2. Setup Infrastructure

To stand up the infrastructure for this module, find the directory for this module in the `packages/` folder and navigate to this folder in the command line. Then identify the name of the deployment you have defined in the Goldstack configuration tool. This can be found in the `packages/[moduleName]/goldstack.json` file. Look for the `"deployments"` property and there for the `"name"` of the first deployment. The name should either be `dev` or `prod`.

In order to stand up the infrastructure, run the following command:

```bash
yarn infra up [deploymentName]
```

This will be either `yarn infra up dev` or `yarn infra up prod` depending on your choice of deployment. Note that running this command can take a while.

### 3. Development

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

## Infrastructure

All infrastructure for this module is defined in Terraform. You can find the Terraform files for this template in the directory `[moduleDir]/infra/aws`. You can define multiple deployments for this template, for instance for development, staging and production environments.

If you configured AWS deployment before downloading your project, the deployments and their respective configurations are defined in `[moduleDir]/goldstack.json`.

The configuration tool will define one deployment. This will be either `dev` or `prod` depending on your choice during project configuration. In the example `goldstack.json` below, a deployment with the name `dev` is defined.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "...",
  "template": "...",
  "templateVersion": "...",
  "configuration": {},
  "deployments": [
    {
      "name": "dev",
      "awsRegion": "us-west-2",
      "awsUser": "awsUser",
      "configuration": {
        ...
      }
    }
  ]
}
```

### Infrastructure Commands

Infrastructure commands for this template can be run using `yarn`. There are four commands in total:

*   `yarn infra up`: For standing up infrastructure.
*   `yarn infra init`: For [initialising Terraform](https://www.terraform.io/docs/commands/init.html).
*   `yarn infra plan`: For running [Terraform plan](https://www.terraform.io/docs/commands/plan.html).
*   `yarn infra apply`: For running [Terraform apply](https://www.terraform.io/docs/commands/apply.html).
*   `yarn infra destroy`: For destroying all infrastructure using [Terraform destroy](https://www.terraform.io/docs/commands/destroy.html).
*   `yarn infra upgrade`: For upgrading the Terraform versions (supported by the template). To upgrade to an arbitrary version, use `yarn infra terraform`.
*   `yarn infra terraform`: For running arbitrary [Terraform commands](https://www.terraform.io/cli/commands).

For each command, the deployment they should be applied to must be specified.

```bash
yarn infra [command] [deploymentName]
```

For instance, to stand up the infrastructure for the `dev` deployment, the following command would need to be issued:

```bash
yarn infra up dev
```

Generally you will only need to run `yarn infra up`. However, if you are familiar with Terraform and want more fine-grained control over the deployment of your infrastructure, you can also use the other commands as required.

Note that for running `yarn infra terraform`, you will need to specify which command line arguments you want to provide to Terraform. By default, no extra arguments are provided:

```bash
yarn infra terraform [deployment] plan
```

If extra arguments are needed, such as variables, you can use the `--inject-variables` option, such as for running `terraform plan`:

```bash
yarn infra terraform [deployment] --inject-variables plan
```

If you want to interact with the remote backend, you can also provide the `--inject-backend-config` option, such as for running `terraform init`:

```bash
yarn infra terraform [deployment] --inject-backend-config init
```

### Customizing Terraform

Goldstack templates make it very easy to customize infrastructure to your specific needs. The easiest way to do this is to simply edit the `*.tf` files in the `infra/aws` folder. You can make the changes you need and then run `yarn infra up [deploymentName]` to apply the changes.

The `infra/aws` folder contains a file `variables.tf` that contains the variables required for your deployment; for instance the domain name for a website. The values for these variables are defined in the module's `goldstack.json` file in the `"configuration"` property. There is one global `configuration` property that applies for all deployments and each deployment also has its own `configuration` property. In order to add a new variable, add the variable to `variables.tf` and then add it to the configuration for your template or to the configurations for the deployments.

Note that due to JavaScript and Terraform using different conventions for naming variables, Goldstack applies a basic transformation to variable names. Camel-case variables names are converted to valid variables names for Terraform by replacing every instance of a capital letter `C` with `_c` in the variable name. For instance:

`myVariableName` in the Goldstack configuration will translate to the Terraform variable `my_variable_name` as defined in `variables.tf`.

### Terraform State

In order to manage your infrastructure, Terraform maintains a state for each deployment; to calculate required changes when the infrastructure is updated and also for destroying the infrastructure if it is no longer required. Goldstack by default will store the terraform state in the `infra/aws` folder as simple files.

This works well for deploying infrastructure from your local development environment but is not a good choice when building a CI/CD pipeline for the infrastructure definition. In that case, it is better to define [Remote State](https://www.terraform.io/docs/state/remote.html). A popular choice many projects adopt here is to store the [state in an S3 bucket](https://www.terraform.io/docs/backends/types/s3.html). Please see the Terraform documentation for further details.

## Reliability Hardening

It is highly recommended you enable Point-in-time recovery (PITR) for your DynamoDB databases and consider additional backup needs.

Point-in-time recovery (PITR) can easily be enabled through the AWS console: [Enable point-in-time recovery in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/PointInTimeRecovery_Howitworks.html#howitworks-enable-pitr-console).

## Frequently Asked Questions

### How to define a table with only a partition key

The DynamoDB template is based on the assumption that your table will contain a partition key and a sort key. Thus, there is no way to define a table without a sort key. If you do not require a sort key, simply create one with a dummy value (e.g. set the sort key always to the entity name or an empty string).

## Security Hardening

No IAM configuration is included in the template. It assumes that all resources using the table will have global access rights to all resources. For larger systems, this should be reworked by adding policies and roles to the codebase.
