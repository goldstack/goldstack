<p align="right"><img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="12"> Generated with <a href="https://goldstack.party">Goldstack</a></p>

<p align="center">
  <a href="https://goldstack.party/templates/static-website">
    <img src="https://cdn.goldstack.party/img/202210/reactjs.svg" height="80">
    <h1 align="center">React Server-Side Rendering</h1>
  </a>
</p>

# React Server-Side Rendering (SSR)

Example project for developing **truly serverless** React Server-Side rendering (SSR).

This boilerplate has been automatically generated using the template:

<table>
  <tbody>
    <tr>
      <td>
        <p align="center"><a href="https://goldstack.party/templates/server-side-rendering"><img width="50" src="https://cdn.goldstack.party/img/202210/reactjs.svg"></a></p>
        <p><a href="https://goldstack.party/templates/server-side-rendering">Server-Side Rendering</a></p>
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

Go the the folder `packages/server-side-rendering` and run `yarn watch`.

Create new routes by creating files in the `packages/server-side-rendering/src/routes`.

## 8. Deploy to AWS

If you want to deploy your project to AWS, you will need to make some changes to the configuration files included in this project.

Specifically, the `goldstack.json` file in the `packages/server-side-rendering` folder.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "server-side-rendering",
  "template": "server-side-rendering",
  "templateVersion": "0.1.5",
  "configuration": {},
  "deployments": [
    {
      "name": "dev",
      "configuration": {
        "lambdas": {},
        "lambdaNamePrefix": "myapp",
        "domain": "myapp.com",
        "hostedZoneDomain": "myapp.com"
      },
      "awsUser": "awsUser",
      "awsRegion": "us-east-2"
    }
  ]
}
```

The key properties you will need to update are:

- `deployments[0].configuration.hostedZoneDomain`
- `deployments[0].configuration.websiteDomain`

Also you need to _delete_ `deployments[0].tfStateKey` entry if it exists.

For more information on these configuration options, see [Goldstack Documentation / Server-Side Rendering Template / Configure](https://docs.goldstack.party/docs/templates/server-side-rendering#configure).

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

Once your AWS user is configured you can run `yarn infra up prod` in the `/packages/server-side-rendering` folder. For more information on the infrastructure commands for this project, see [Goldstack Documentation / Server-Side Rendering Template / Infrastructure](https://docs.goldstack.party/docs/templates/server-side-rendering#infrastructure).

## 9. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).

