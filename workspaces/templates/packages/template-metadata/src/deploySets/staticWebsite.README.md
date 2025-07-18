<p align="right"><img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="12"> Generated with <a href="https://goldstack.party">Goldstack</a></p>

<p align="center">
  <a href="https://goldstack.party/templates/static-website">
    <img src="https://cdn.goldstack.party/img/202204/cloudfront.svg" height="80">
    <h1 align="center">Static Website Boilerplate</h1>
  </a>
</p>

Develop a static website using HTML and CSS. Test the website locally. Deploy to AWS using [CloudFront](https://aws.amazon.com/s3/) and [S3](https://aws.amazon.com/cloudfront/).

This boilerplate has been automatically generated using the template:

<table>
  <tbody>
    <tr>
      <td>
        <p align="center"><a href="https://goldstack.party/templates/static-website"><img width="50" src="https://cdn.goldstack.party/img/202204/cloudfront.svg"></a></p>
        <p><a href="https://goldstack.party/templates/static-website">Static Website</a></p>
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

## 7. Local Development

Go to the folder `packages/static-website-aws` and run `yarn watch`. This will start a local development server.

<img src="https://cdn.goldstack.party/img/202204/local-development.gif" alt="VSCode Locate TypeScript">

To make changes to the web page, edit the files in the folder `packages\static-website-aws\web`.

<img src="https://cdn.goldstack.party/img/202204/edit_webpage.png" alt="Edit webpage included in template">

## 8. Deploy to AWS

If you want to deploy your project to AWS, you will need to make some changes to the configuration files included in this project.

Specifically, the [goldstack.json](https://github.com/goldstack/static-website-boilerplate/blob/master/packages/static-website-1/goldstack.json) in the `packages/static-website-aws` folder.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "static-website-1",
  "template": "static-website-aws",
  "templateVersion": "0.1.0",
  "configuration": {},
  "deployments": [
    {
      "name": "prod",
      "awsUser": "goldstack-dev",
      "awsRegion": "us-west-2",
      "configuration": {
        "hostedZoneDomain": "dev.goldstack.party",
        "websiteDomain": "staticwebsite1-1651273869629.tests.dev.goldstack.party",
        "websiteDomainRedirect": "www.staticwebsite1-1651273869629.tests.dev.goldstack.party",
        "defaultCacheDuration": 10
      },
      "tfStateKey": "static-website-1-prod-0397e051cd046f2d46e7.tfstate"
    }
  ]
}
```

The key properties you will need to update are:

*   `deployments[0].configuration.hostedZoneDomain`
*   `deployments[0].configuration.websiteDomain`

Also you need to *delete* `deployments[0].tfStateKey`.

For more information on these configuration options, see [Goldstack Documentation / Static Website AWS Template / Configure](https://docs.goldstack.party/docs/templates/static-website-aws#configure).

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

Once your AWS user is configured you can run `yarn infra up prod` in the `/packages/static-website-aws` folder. For more information on the infrastructure commands for this project, see [Goldstack Documentation / Static Website Template / Infrastructure](https://docs.goldstack.party/docs/templates/static-website-aws#infrastructure).

## 9. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
