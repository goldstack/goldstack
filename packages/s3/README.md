# Email Sent Template

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

The S3 module provides a simple means for an application to store and access files on [AWS S3](https://aws.amazon.com/s3/). This template is set up for deploying an S3 bucket using Terraform and provides a simple TypeScript API to work with this bucket.

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

### Infrastructure

The first thing we recommend to do with a new module is to stand up the infrastructure for the module. For this, find the directory for this module in the `packages/` folder and navigate to this folder in the command line. Then identify the name of the deployment you have defined in the Goldstack configuration tool. This can be found in the `packages/[moduleName]/goldstack.json` file. Look for the `"deployments"` property and there for the `"name"` of the first deployment. The name should either be `dev` or `prod`.

In order to stand up the infrastructure, run the following command:

```bash
yarn infra up [deploymentName]
```

This will be either `yarn infra up dev` or `yarn infra up prod` depending on your choice of deployment. Note that running this command can take a while.

### Development

This is how an the S3 module can be used from another module:

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

Note it is also possible to add additional TypeScript files in the modules `src/` folder. This is a good place to put an abstraction layer on top of the S3 interface, for instance a data repository specific to the needs of your application.

## Infrastructure

All infrastructure for this module is defined in Terraform. You can find the Terraform files for this module in the directory `[moduleDir]/infra/aws`. You can define multiple deployments for this module, for instance for development, staging and production environments.

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

Infrastructure commands for this module can be run using `yarn`. There are four commands in total:

*   `yarn infra up`: For standing up infrastructure.
*   `yarn infra init`: For [initialising Terraform](https://www.terraform.io/docs/commands/init.html).
*   `yarn infra plan`: For running [Terraform plan](https://www.terraform.io/docs/commands/plan.html).
*   `yarn infra apply`: For running [Terraform apply](https://www.terraform.io/docs/commands/apply.html).
*   `yarn infra destroy`: For destroying all infrastructure using [Terraform destroy](https://www.terraform.io/docs/commands/destroy.html).

For each command, the deployment they should be applied to must be specified.

```bash
yarn infra [command] [deploymentName]
```

For instance, to stand up the infrastructure for the `dev` deployment, the following command would need to be issued:

```bash
yarn infra up dev
```

Generally you will only need to run `yarn infra up`. However, if you are familiar with Terraform and want more fine-grained control over the deployment of your infrastructure, you can also use the other commands as required.

### Customizing Terraform

Goldstack modules make it very easy to customize infrastructure to your specific needs. The easiest way to do this is to simply edit the `*.tf` files in the `infra/aws` folder. You can make the changes you need and then run `yarn infra up [deploymentName]` to apply the changes.

The `infra/aws` folder contains a file `variables.tf` that contains the variables required for your deployment; for instance the domain name for a website. The values for these variables are defined in the module's `goldstack.json` file in the `"configuration"` property. There is one global `configuration` property that applies for all deployments and each deployment also has its own `configuration` property. In order to add a new variable, add the variable to `variables.tf` and then add it to the configuration for your module or to the configurations for the deployments.

Note that due to JavaScript and Terraform using different conventions for naming variables, Goldstack applies a basic transformation to variable names. Camel-case variables names are converted to valid variables names for Terraform by replacing every instance of a capital letter `C` with `_c` in the variable name. For instance:

`myVariableName` in the Goldstack configuration will translate to the Terraform variable `my_variable_name` as defined in `variables.tf`.

### Terraform State

In order to manage your infrastructure, Terraform maintains a state for each deployment; to calculate required changes when the infrastructure is updated and also for destroying the infrastructure if it is no longer required. Goldstack by default will store the terraform state in the `infra/aws` folder as simple files.

This works well for deploying infrastructure from your local development environment but is not a good choice when building a CI/CD pipeline for the infrastructure definition. In that case, it is better to define [Remote State](https://www.terraform.io/docs/state/remote.html). A popular choice many projects adopt here is to store the [state in an S3 bucket](https://www.terraform.io/docs/backends/types/s3.html). Please see the Terraform documentation for further details.

## Security Hardening

The S3 bucket for this module is already configured to allow only private access to the bucket. Be careful when making the bucket public and ensure that it only has contents that can be publicly exposed. For use cases such as using a bucket for hosting content, we recommend using the [Static Website](./static-website-aws) module.
