# S3 Template

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

The S3 template provides a simple means for an application to store and access files on [AWS S3](https://aws.amazon.com/s3/). This template is set up for deploying an S3 bucket using Terraform and provides a simple TypeScript API to work with this bucket.

## Features

*   S3 bucket defined in Terraform
*   Supports definition for multiple environments (staging, production)
*   Infrastructure easily stood up using an npm script `yarn infra up`
*   Embed in server applications by linking to the package

```javascript
import { getBucketName, connect } from 'my-s3-module';

const s3 = connect();
await s3.putObject({
  BucketName: getBucketName(),
  Key: 'my-doc',
  Body: 'content',
});
```

## Configure

In order to provide a basic configuration for an S3 bucket, we only need to know the name of the bucket you want to create.

Please note that a bucket name needs to be [globally unique](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingBucket.html). However, buckets are always created in a specific [AWS region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-regions). The bucket will be deployed to the AWS region you have specified.

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

This is how an the S3 package can be used from another package:

```javascript
import { getBucketName, connect } from 'my-s3-module';

const s3 = connect();
await s3.putObject({
  BucketName: getBucketName(),
  Key: 'my-doc',
  Body: 'content',
});
```

The object returned from `connect()` is an instance of the [AWS S3 client](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html).

Note it is also possible to add additional TypeScript files in the templates `src/` folder. This is a good place to put an abstraction layer on top of the S3 interface, for instance a data repository specific to the needs of your application.

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

By default, if you provide a deployment name that does not exist, the command will fail. In CI environments or for larger projects, it sometimes makes sense to run `yarn infra xx` over the whole project and skip packages for which the deployment is not defined. In that case, you can use the following flag:

```bash
yarn infra [command] [deployment] --ignore-missing-deployments
```

Now the CLI will output a warning if the deployment does not exist but not an error.

### Customizing Terraform

Goldstack templates make it very easy to customize infrastructure to your specific needs. The easiest way to do this is to simply edit the `*.tf` files in the `infra/aws` folder. You can make the changes you need and then run `yarn infra up [deploymentName]` to apply the changes.

The `infra/aws` folder contains a file `variables.tf` that contains the variables required for your deployment; for instance the domain name for a website. 

**Note**: Variables defined in `variables.tf` do not need to be present in `goldstack.json`. If a variable is not defined in `goldstack.json`, Goldstack will automatically attempt to resolve its value from environment variables or `.env` files. This is useful for sensitive values that should not be committed to source control.

To add a new variable:

1.  Add the variable to `variables.tf`
2.  Optionally add it to the `configuration` in `goldstack.json` (or provide via environment variables/`.env` files)

Note that due to JavaScript and Terraform using different conventions for naming variables, Goldstack applies a basic transformation to variable names. Camel-case variables names are converted to valid variables names for Terraform by replacing every instance of a capital letter `C` with `_c` in the variable name. For instance:

`myVariableName` in the Goldstack configuration will translate to the Terraform variable `my_variable_name` as defined in `variables.tf`.

### Providing Terraform Variables

Terraform variables can be provided through multiple sources:

1.  `goldstack.json` configuration files (recommended for most values)
2.  Environment variables (`process.env`)
3.  `.env` files (useful for sensitive values)

#### Using goldstack.json

Define variables in the `configuration` property of your `goldstack.json`. There is one global `configuration` property that applies for all deployments, and each deployment can have its own `configuration` property.

#### Using Environment Variables

For a variable named `my_var` in `variables.tf`, set the environment variable `MY_VAR`:

```bash
MY_VAR=value yarn infra up prod
```

#### Using .env Files

You can also provide Terraform variable values through `.env` files. Goldstack will load `.env` files from both the monorepo root and the package directory in the following order (later files override earlier ones):

1.  `root/.env` - Shared across all deployments
2.  `root/.env.[deployment]` - Deployment-specific (e.g., `.env.prod`)
3.  `package/.env` - Package-specific shared values
4.  `package/.env.[deployment]` - Package and deployment-specific (highest priority)

For example, if you have a Terraform variable `my_var` defined in `variables.tf`, you can provide its value by adding to your `.env` file:

    MY_VAR=my-value

Note that environment variable names should be uppercase versions of the Terraform variable names (e.g., `my_var` → `MY_VAR`).

#### Variable Resolution Priority

When resolving Terraform variable values, Goldstack uses the following priority (from highest to lowest):

1.  Values defined in `goldstack.json` configurations
2.  Environment variables (`process.env`)
3.  Values from `.env` files

If a variable defined in `variables.tf` is not found in any of these sources, a warning will be logged.

### Terraform State

In order to manage your infrastructure, Terraform maintains a state for each deployment; to calculate required changes when the infrastructure is updated and also for destroying the infrastructure if it is no longer required. Goldstack by default will store the terraform state in the `infra/aws` folder as simple files.

This works well for deploying infrastructure from your local development environment but is not a good choice when building a CI/CD pipeline for the infrastructure definition. In that case, it is better to define [Remote State](https://www.terraform.io/docs/state/remote.html). A popular choice many projects adopt here is to store the [state in an S3 bucket](https://www.terraform.io/docs/backends/types/s3.html). Please see the Terraform documentation for further details.

## Security Hardening

The S3 bucket for this template is already configured to allow only private access to the bucket. Be careful when making the bucket public and ensure that it only has contents that can be publicly exposed. For use cases such as using a bucket for hosting content, we recommend using the [Static Website](./static-website-aws) template.
