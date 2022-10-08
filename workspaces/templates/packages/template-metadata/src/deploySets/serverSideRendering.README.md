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

A few dependencies need to be available in your development system. Please verify they are present or install them.

- Node v12+
- Yarn v1.22.5+
- Docker v19+

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

For more information on configuring your local AWS users, please see [Goldstack Documentation / AWS Configuration](https://docs.goldstack.party/docs/goldstack/configuration#aws-configuration).

Once your AWS user is configured you can run `yarn infra up prod` in the `/packages/server-side-rendering` folder. For more information on the infrastructure commands for this project, see [Goldstack Documentation / Server-Side Rendering Template / Infrastructure](https://docs.goldstack.party/docs/templates/server-side-rendering#infrastructure).

## 9. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
