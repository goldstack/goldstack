# Hetzner VPS Template

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

This templates allows setting up and deploy an application to a VPS server hosted on Hetzner.

## Features

*   Set up a server on Hetzner from your local CLI with a single command
*   Server hardened (e.g. SSH) by default
*   Customise server configuration using Terraform
*   Deploy an application (e.g. docker-compose.yml) from your development machine or CI pipeline to Hetzner

## Configure

The following key properties need to be configured for this template:

*   **Location**: The Hetzner location this server should be deployed to. This can be any valid location string without spaces. For instance, if the location `fsn1` is chosen, the server will be deployed to the `fsn1` Hetzner data center. Example pattern: `^[^\s]*`
*   **Server Name**: The Hetzner server name that should be used for this server. The name must not contain any spaces. For example, if the server name `my-server` is chosen, the server will be identified as `my-server`. Example pattern: `^[^\s]*`
*   **Server Type**: The Hetzner server type that should be used for this server. The server type string must not contain any spaces. For example, `cx11` refers to a small cloud server instance. Example pattern: `^[^\s]*`
*   **SSH User Fingerprint** (optional): The SSH fingerprint of the user that should be granted access to the server. This must be a valid SSH fingerprint string, for example, `SHA256:xyz`. Example pattern: `^[^\s]*`
*   **Only Allow SSH Access from IP** (optional): The specific IP address from which SSH access is allowed. For instance, setting this to `192.168.1.1` would limit SSH access to that IP address only.
*   **Environment Variables** (optional): The environment variables that should be set for the server. Each environment variable consists of a name and a value. For example, a variable with the name `NODE_ENV` and the value `production` can be configured to set the environment to production.

For more details on deployment, refer to the Hetzner server deployment configuration in the Goldstack documentation.

## Getting Started

### 1. Project Setup

Before using this template, you need to configure the project. For this, please see the [Getting Started Guide](https://docs.goldstack.party/docs/goldstack/getting-started) on the Goldstack documentation.

### 2. Setup Infrastructure

To stand up the infrastructure for this module, find the directory for this module in the `packages/` folder and navigate to this folder in the command line. Then identify the name of the deployment you have defined in the Goldstack configuration tool. This can be found in the `packages/[moduleName]/goldstack.json` file. Look for the `"deployments"` property and there for the `"name"` of the first deployment. The name should either be `dev` or `prod`.

In order to stand up the infrastructure, run the following command:

```bash
yarn infra up [deploymentName]
```

This will be either `yarn infra up dev` or `yarn infra up prod` depending on your choice of deployment. Note that running this command can take a while.

### 3. Development

The application deployed to Hetzner is defined in the `server/` directory.

You can edit the files here. The `start.sh` script will be run every time a deployment is made to the server using `yarn deploy [deployment]`.

If using docker-compose, you should also be able to develop locally easily. Simply provide a `.env` file with the environment configuration for your local development environment.

You may also define secrets in the `server/secrets/` folder as individual text files that contain nothing but the secret value (e.g. `server/secrets/my_secret.txt`).

For your remote environments defined in `goldstack.json`, environment variables will be defined from the properties in `goldstack.json`. Secrets will be read from the file `credentials.json`. Use the following format to define secrets in `credentials.json`:

```json
{
  "prod": {
    "dummy": "thats the value"
  }
}
```

This `credentials.json` will result in the file `/home/goldstack/app/secrets/dummy.txt` to be created with the content `thats the value`. This should make it easy to use it in a docker-compose file, see [How to use secrets in Docker Compose](https://docs.docker.com/compose/how-tos/use-secrets/).

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

Infrastructure commands for this template can be run using `yarn`. The following commands are supported:

*   `yarn infra up`: For standing up infrastructure.
*   `yarn infra init`: For [initialising Terraform](https://www.terraform.io/docs/commands/init.html).
*   `yarn infra plan`: For running [Terraform plan](https://www.terraform.io/docs/commands/plan.html).
*   `yarn infra apply`: For running [Terraform apply](https://www.terraform.io/docs/commands/apply.html).
*   `yarn infra destroy`: For destroying all infrastructure using [Terraform destroy](https://www.terraform.io/docs/commands/destroy.html).
*   `yarn infra upgrade`: For upgrading the Terraform versions (supported by the template). To upgrade to an arbitrary version, use `yarn infra terraform`.
*   `yarn infra terraform`: For running arbitrary [Terraform commands](https://www.terraform.io/cli/commands).
*   `yarn infra is-up`: Will return `is-up: true` if infrastructure for a deployment exists, otherwise returns `is-up: false`

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

### Hetzner Credentials

To use the Hetzner Terraform provider, a token is required. To generate a token, please see [Hetzner Documentation: Generating an API token](https://docs.hetzner.com/cloud/api/getting-started/generating-api-token/). Goldstack will look for this token by looking up the user matching the deployment in: `config/infra/hetzner/config.json`.

You can provide the secret as follows:

```json
{
  "users": [
    {
      "name": "max",
      "config": {
        "token": "xxx"
      }
    }
  ]
}
```

Goldstack will also look for the environment variable `HCLOUD_TOKEN`, and if that is defined, will use that as the token for the Hetzner deployment. This makes it easy to provide this in GitHub actions.

Anything in `config.json` will be ignored if the environment variable is set.

### GitHub Actions

To deploy from GitHub actions, you will need an SSH user.

For this, first create an SSH key and add it to Hetzner, see [How to create an SSH key and attach it to a Hetzner server](https://medium.com/@benjaminstorm/how-to-create-an-ssh-key-and-attach-it-to-a-hetzner-server-e183536fd0ce).

Note we will need the fingerprint in configuring `goldstack.json`.

## Environment Variables

The following environment variables will be available on the server:

*   `GOLDSTACK_DEPLOYMENT`
*   `SERVER_NAME`
*   `HETZNER_LOCATION`
*   `HETZNER_SSH_USER_FINGERPRINT`

Environment variables can be supplied in a number of ways.

### For Local Development

Define environment variables in a `.env` file, stored in the `server/` directory.

    MY_ENV=value

### For Deployments

Define environment variables for deployments in their `"configuration"` in `goldstack.json`:

```json
 "deployments": [
    {
      "name": "prod",
      "configuration": {
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
    }
```

## Secrets

The VPS will by default be provided with credentials for the AWS IAM user that is used to deploy files to the server.

Additional secrets can be defined by manually editing the file: `dist/credentials/credentials`.

Any additional properties added to the JSON file will be unpacked into files in the `~/app/secrets` folder.

    goldstack@goldstack-docker:~/app$ ls secrets/
    # -> accessKeyId.txt  awsRegion.txt  mySecret.txt  secretAccessKey.txt

These should be easy to consume as [secrets in a Docker Compose file](https://docs.docker.com/compose/use-secrets/#simple).

```yaml
services:
  myapp:
    image: myapp:latest
    secrets:
      - my_secret
secrets:
  my_secret:
    file: ./my_secret.txt
```

Editing the file `dist/credentials/credentials` manually can be useful during development. However, a better way is to define a GitHub action to deploy the server.

In the GitHub action, one can use GitHub secrets to set the content of `credentials.json` with the secrets required before the infrastructure is created and before a deployment.

```yaml
- name: Create credentials file
  run: |
    cd packages/node2
    echo '
    {
      "dev": {
        "CF_TUNNEL": "${{ secrets.CF_TUNNEL_DEV }}",
        "AWS_ACCESS_KEY_ID": "${{secrets.AWS_ACCESS_KEY_ID_DEV}}",
        "AWS_SECRET_ACCESS_KEY": "${{secrets.AWS_SECRET_ACCESS_KEY_DEV}}",
      }
    }' > credentials.json
```

These secrets will be written into the `server/secrets` folder. For instance: `server/secrets/secret1.txt`.

Note these secrets will be loaded as environment variables on the server during `yarn deploy [environment]` within the scripts `init.sh` and `start.sh`.
