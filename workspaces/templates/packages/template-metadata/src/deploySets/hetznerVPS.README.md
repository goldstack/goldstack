<p align="right"><img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="12"> Generated with <a href="https://goldstack.party">Goldstack</a></p>

<p align="center">
  <a href="https://goldstack.party/templates/ses">
    <img src="https://cdn.goldstack.party/img/202409/hetzner.svg" height="80">
    <h1 align="center">Starter Template for Hetzner VPS</h1>
  </a>
</p>

A starter template to define a [Hetzner](https://www.hetzner.com/) VPS from code using [Terraform](https://www.terraform.io/). Also supports scripts for easy deployment to the server.

This project has been automatically generated using the template:

<table>
  <tbody>
    <tr>
      <td>
        <p align="center"><a href="https://goldstack.party/templates/hetzner-vps"><img width="50" src="https://cdn.goldstack.party/img/202409/hetzner.svg"></a></p>
        <p><a href="https://goldstack.party/templates/hetzner-vps">Hetzner VPS</a></p>
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

## 7. Customise Configuration

In order to use this template for your own project, there are a few things to update.

First, you need to create a file `config/infra/hetzner/config.json` to define your Hetzner token:

```json
{
  "users": [
    {
      "name": "[your user name]",
      "config": {
        "token": "[your token]"
      }
    }
  ]
}
```

Find more information on this in [Hetzner Credentials](https://docs.goldstack.party/docs/templates/hetzner-vps#hetzner-credentials).

Then you need to update the file `packages/hetzner-vps-1/goldstack.json`:

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "hetzner-vps-1",
  "template": "hetzner-vps",
  "templateVersion": "0.1.0",
  "configuration": {},
  "deployments": [
    {
      "name": "prod",
      "awsUser": "goldstack-dev",
      "awsRegion": "us-west-2",
      "hetznerUser": "local",
      "configuration": {
        "location": "hil",
        "serverType": "cpx11",
        "sshUserFingerprint": "49:35:14:98:08:d4:71:a6:04:c2:f6:73:f0:68:2d:5c",
        "serverName": "goldstack-ci-test",
        "environmentVariables": [
          {
            "name": "DUMMY_ENV",
            "value": "I rock"
          },
          {
            "name": "HTTP_PORT",
            "value": "80"
          },
          {
            "name": "HTTPS_PORT",
            "value": "443"
          }
        ]
      },
      "tfStateKey": "hetzner-vps-1-prod-2d8c49d9d87e7c956e8e.tfstate"
    }
  ]
}
```

Here change the following:

- _Delete_ the property `tfStateKey`
- _Update_ the `hetznerUser` to the username you defined in `config.json` above
- _Update_ the `sshUserFingerprint` to the fingerprint of an SSH user you have created through Hetzner console
- _Update_ the `serverName` to a name of your choosing
- _Update_ the `location` to what you require
- _Update_ the `serverType` to what you require

Find more information about the required values in [Hetzner VPS / Configure](https://docs.goldstack.party/docs/templates/hetzner-vps#configure).

To further define what you want to deploy to your server, start with the files in `packages/hetzner-vps-1/server`.

For instance, you can modify the `docker-compose.yml` file with what you require:

```yml
version: '3.8'

services:
  caddy:
    image: caddy
    container_name: caddy
    ports:
      - '${HTTP_PORT}:80'
      - '${HTTPS_PORT}:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./site:/usr/share/caddy/site
      - caddy_data:/data
      - caddy_config:/config

volumes:
  caddy_data:
  caddy_config:
```

Note you can define the variables you require in `goldstack.json`. If you want to supply secrets, create a file `credentials.json` as described [here](https://docs.goldstack.party/docs/templates/hetzner-vps#secrets).

## 8. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
