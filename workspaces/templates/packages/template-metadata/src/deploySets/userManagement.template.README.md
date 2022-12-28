<p align="right"><img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="12"> Generated with <a href="https://goldstack.party">Goldstack</a></p>

<p align="center">
  <a href="https://goldstack.party/templates/static-website">
    <img src="https://cdn.goldstack.party/img/202212/cognito.svg" height="80">
    <h1 align="center">Cognito Node.js Template</h1>
  </a>
</p>

Add the capability to your application to sign up and sign in users. Provides server-side utilities for authentication and ready-to-go hosted user interface for sign up and sign in. Implemented using [Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html).

This boilerplate has been automatically generated using the template:

<table>
  <tbody>
    <tr>
      <td>
        <p align="center"><a href="https://goldstack.party/templates/user-management"><img width="50" src="https://cdn.goldstack.party/img/202212/cognito.svg"></a></p>
        <p><a href="https://goldstack.party/templates/user-management">User Management</a></p>
      </td>
    </tr>
  </tbody>
</table>

Feel free to fork this repository and modify it for your needs, or use the [Goldstack project builder](https://goldstack.party/build) to generate a boilerplate specifically configured for your project.

# Getting Started

Thank you for using this boilerplate. For any questions or feedback, please be welcome to [raise an issue on GitHub](https://github.com/goldstack/goldstack/issues) 🤗 .

## 1. Fork and clone the repository

[Fork this repository](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and then [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the fork your local machine.

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

## 7. Local Development

The code provided in this project works best in combination with client- and server-side application code defined in other packages.

For this, simply import the package provided in `packages/user-management-1` in your client- and/or server-side logic.

For more information, see the Goldstack documentation:

- [User Management / Development (Client)](https://docs.goldstack.party/docs/templates/user-management#3-development-client-1)
- [User Management / Development (Server)](https://docs.goldstack.party/docs/templates/user-management#4-development-server-1)

## 8. Deploy to AWS

If you want to deploy your project to AWS, you will need to make some changes to the configuration files included in this project.

Specifically, the [goldstack.json](https://github.com/goldstack/cognito-nodejs-template/blob/master/packages/user-management-1/goldstack.json) in the `packages/user-management-1` folder.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "user-management",
  "template": "user-management",
  "templateVersion": "0.1.0",
  "configuration": {},
  "deployments": [
    {
      "name": "prod",
      "awsRegion": "us-west-2",
      "awsUser": "goldstack-dev",
      "configuration": {
        "cognitoDomain": "",
        "userPoolName": "",
        "hostedZoneDomain": "",
        "callbackUrl": ""
      },
      "tfStateKey": "user-management-prod-xxxxxxx.tfstate"
    }
  ]
}
```

The key properties you will need to update are:

- `deployments[0].configuration.cognitoDomain`
- `deployments[0].configuration.userPoolName`
- `deployments[0].configuration.hostedZoneDomain`
- `deployments[0].configuration.callbackUrl`

Also you need to _delete_ `deployments[0].tfStateKey`.

For more information on these configuration options, see [Goldstack Documentation / User Management / Configure](https://docs.goldstack.party/docs/templates/user-management#configure).

You will also need to ensure that you have a valid AWS user configure to deploy to AWS. For this, create a file in `/config/infra/config.json` (relative to project root).

```
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

Once your AWS user is configured you can run `yarn infra up prod` in the `/packages/user-management-1` folder. For more information on the infrastructure commands for this project, see [Goldstack Documentation / User Management / Infrastructure](https://docs.goldstack.party/docs/templates/user-management#infrastructure).

## 9. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
