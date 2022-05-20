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

await Users.put({
  pk: 'joe@email.com',
  sk: 'd',
  name: 'Joe',
  emailVerified: true,
});

const { Item: user } = await Users.get(
  { pk: 'joe@email.com', sk: 'd' },
  { attributes: ['name', 'pk'] }
);
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

# Getting Started

Thank you for using this boilerplate. For any questions or feedback, please be welcome to [raise an issue on GitHub](https://github.com/goldstack/goldstack/issues) 🤗 .

## 1. Fork and clone the repository

Fork this repository and then clone the fork into your local machine.

For more information, see [GitHub documentation - Fork a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)

## 2. Install required local dependencies

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/dependencies.md)

## 3. Initialise project and install NPM Dependencies

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/install.md)

## 4. Build modules

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/build.md)

## 5. Configure VSCode

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/vscode.md)

## 6. Initialise TypeScript

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/typescript.md)

## 7. AWS Infrastructure Configuration

The template will create a DynamoDB table on AWS for you. For this, you simply need to modify the configuration included in this template.

Specifically, the [goldstack.json]() in the `packages/dynamodb-1` folder.

```json
TBD
```

The key property you will need to update is:

- `deployments[0].configuration.tableName`

You also need to _delete_ `deployments[0].tfStateKey`.

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

## 8. Local Development

This boilerplate will come with a module that provides the functionalities for connecting to DynamoDB from Node.js. This module is defined in `packages/dynamodb-1`.


[!embed](./../../../../../../workspaces/docs/docs/templates/dynamodb/build.md)

## 9. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
