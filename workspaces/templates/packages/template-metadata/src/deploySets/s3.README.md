<p align="right"><img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="12"> Generated with <a href="https://goldstack.party">Goldstack</a></p>

<p align="center">
  <a href="https://goldstack.party/templates/s3">
    <img src="https://cdn.goldstack.party/img/202204/s3.svg" height="80">
    <h1 align="center">S3, Terraform and TypeScript Boilerplate</h1>
  </a>
</p>

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/9167b94cfaa248858c06734916682a36)](https://www.codacy.com/gh/goldstack/s3-terraform-typescript-boilerplate/dashboard?utm_source=github.com&utm_medium=referral&utm_content=goldstack/s3-terraform-typescript-boilerplate&utm_campaign=Badge_Grade)

Boilerplate for setting up the infrastructure for AWS S3 using Terraform and working with S3 using a simple TypeScript API.

```typescript
const bucketName = await getBucketName();
const s3 = await connect();
await s3
  .putObject({
    Key: 'local.txt',
    Body: 'hello',
    Bucket: bucketName,
  })
  .promise();
```

This boilerplate has been automatically generated from the template:

<table>
  <tbody>
    <tr>
      <td>
        <p align="center"><a href="https://goldstack.party/templates/s3"><img width="50" src="https://cdn.goldstack.party/img/202204/s3.svg"></a></p>
        <p><a href="https://goldstack.party/templates/s3">AWS S3</a></p>
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

A few dependencies need to be available in your development system. Please verify they are present or install them.

- Node v18+
- Yarn v1.22.5+
- Docker v24+

Open a terminal and run the following commands:

```bash
node -v
yarn -v
docker --version
```

This should produce the following output:

![Confirming versions in the console](https://cdn.goldstack.party/img/202203/confirm_versions.png)

If you need to install or update any of the dependencies, please see the following guides:

- [Downloading and installing Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Yarn Installation](https://yarnpkg.com/getting-started/install)
- [Install Docker for Windows](https://docs.docker.com/docker-for-windows/install/) / [Install Docker for Mac](https://docs.docker.com/docker-for-mac/install/)

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

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ZipFS](https://marketplace.visualstudio.com/items?itemName=arcanis.vscode-zipfs) (optional)

## 6. Initialise TypeScript

Locate a `.ts` or `.tsx` file in the workspace and open it. When asked whether to use the workspace TypeScript version, click _Allow_.

<img src="https://cdn.goldstack.party/img/202201/allow_typescript.gif"  alt="VSCode Locate TypeScript">

In the status bar on the bottom right-hand corner of the VSCode editor you should now see _TypeScript_.

![TypeScript status icon in VSCode](https://cdn.goldstack.party/img/202203/typescript_init.png)

## 7. AWS Infrastructure Configuration

If you want to setup your S3 infrastructure on AWS, you will need to make some changes to the configuration files included in this project.

Specifically, the [goldstack.json](https://github.com/goldstack/s3-terraform-typescript-boilerplate/blob/master/packages/s3-1/goldstack.json) in the `packages/s3-1` folder.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "s3",
  "template": "s3",
  "templateVersion": "0.1.0",
  "configuration": {},
  "deployments": [
    {
      "name": "prod",
      "awsRegion": "us-west-2",
      "awsUser": "goldstack-dev",
      "configuration": {
        "bucketName": "goldstack-test-s3-bucket"
      },
      "tfStateKey": "s3-prod-40dd578eab44b83dc601.tfstate",
      "tfVersion": "1.1"
    }
  ]
}
```

The key property you will need to update is:

- `deployments[0].configuration.bucketName`

You also need to _delete_ `deployments[0].tfStateKey`.

For more information on these configuration options, see [Goldstack Documentation / S3 / Configure](https://docs.goldstack.party/docs/templates/s3#configure).

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

Once your AWS user is configured you can run `yarn infra up prod` in the `/packages/s3` folder. For more information on the infrastructure commands for this project, see [Goldstack Documentation / S3 / Infrastructure](https://docs.goldstack.party/docs/templates/s3#infrastructure).

## 8. Local Development

This boilerplate will come with a module that provides the functionalities for working with S3. This module is defined in `packages/s3-1`. Generally you won't have to make changes to this module during local development. Instead, create an additional npm module in the `packages/` folder and then import the `s3` module as one of the dependencies.

Then use the exported `connect()` and `getBucketName()` in your code to write and read data from S3:

```typescript
    const bucketName = await getBucketName();
    const s3 = await connect();
    await s3
      .putObject({
        Key: 'local.txt',
        Body: 'hello',
        Bucket: bucketName,
      })
      .promise();
  });
```

The result of `await connect()` is an instance of [`AWS.S3`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html).

## 9. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
