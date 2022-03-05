<p align="right"><img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="12"> Generated with <a href="https://goldstack.party">Goldstack</a></p>

<p align="center">
  <a href="https://goldstack.party/templates/nextjs-bootstrap">
    <img src="https://cdn.goldstack.party/img/202203/nextjs.svg" height="80">
    <h1 align="center">Next.js + Bootstrap Boilerplate</h1>
  </a>
</p>

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/a543d8d5d69d40ef86127f310b17a2ed)](https://www.codacy.com/gh/goldstack/nextjs-bootstrap-boilerplate/dashboard?utm_source=github.com&utm_medium=referral&utm_content=goldstack/nextjs-bootstrap-boilerplate&utm_campaign=Badge_Grade)

Boilerplate for a Next.js + Bootstrap project with support for [TypeScript](https://www.typescriptlang.org/) using [Yarn](https://yarnpkg.com/) ready for deployment to AWS using low-cost, highly scaleable serverless infrastructure.

This boilerplate has been automatically generated using the template:

<table>
  <tbody>
    <tr>
      <td>
        <p align="center"><a href="https://goldstack.party/templates/nextjs-bootstrap"><img width="50" src="https://cdn.goldstack.party/img/202203/nextjs.svg"></a></p>
        <p><a href="https://goldstack.party/templates/nextjs-bootstrap">Next.js + Bootstrap</a></p>
      </td>
    </tr>
  </tbody>
</table>

Feel free to fork this repository and modify it for your needs, or use the [Goldstack project builder](https://goldstack.party/build) to generate a boilerplate specifically generated for your project.

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

## 7. Local Development

Go to the folder `packages/app-nextjs-bootstrap` and run `yarn watch`. This will start a local development server.

<img src="https://cdn.goldstack.party/img/202201/yarn_watch.gif"  alt="VSCode Locate TypeScript">

## 8. Deploy to AWS

If you want to deploy your project to AWS, you will need to make some changes to the configuration files included in this project.

Specifically, the [goldstack.json](https://github.com/goldstack/nextjs-bootstrap-boilerplate/blob/master/packages/app-nextjs-bootstrap-1/goldstack.json) in the `packages/app-nextjs-bootstrap` folder.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "app-nextjs-bootstrap-1",
  "template": "app-nextjs-bootstrap",
  "templateVersion": "0.1.0",
  "configuration": {},
  "deployments": [
    {
      "name": "prod",
      "awsUser": "goldstack-dev",
      "awsRegion": "us-west-2",
      "configuration": {
        "hostedZoneDomain": "dev.goldstack.party",
        "websiteDomain": "nextjsbootstrap-1646424912086.tests.dev.goldstack.party",
        "defaultCacheDuration": 10
      },
      "tfStateKey": "app-nextjs-bootstrap-1-prod-cd7f1f0a63ccb93ef36d.tfstate"
    }
  ]
}
```

The key properties you will need to update are:

- `deployments[0].configuration.hostedZoneDomain`
- `deployments[0].configuration.websiteDomain`

Also you need to _delete_ `deployments[0].tfStateKey`.

For more information on these configuration options, see [Goldstack Documentation / Next.js + Bootstrap Template / Configure](https://docs.goldstack.party/docs/templates/app-nextjs-bootstrap#configure).

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

Once your AWS user is configured you can run `yarn infra up dev` in the `/packages/app-nextjs-bootstrap` folder. For more information on the infrastructure commands for this project, see [Goldstack Documentation / Next.js + Bootstrap Template / Infrastructure](https://docs.goldstack.party/docs/templates/app-nextjs-bootstrap#infrastructure-3).

## 9. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
