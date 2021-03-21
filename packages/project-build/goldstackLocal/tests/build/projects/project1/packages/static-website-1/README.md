# Email Sent Template

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

This module provides a simple static website that is deployed on a global [CloudFront](https://aws.amazon.com/cloudfront/) CDN provided by AWS.

## Configure

The following key properties need to be configured for this module:

*   **Hosted Zone Domain**: A Route 53 hosted zone to which the *Primary Website Domain* and *Redirect Website Domain* can be added as records. For instance, the hosted zone domain `mysite.com` would allow adding the primary domain `mysite.com` and the redirect domain `www.mysite.com`. For more details, please check [Hosted Zone Configuration](https://docs.goldstack.party/docs/goldstack/configuration#hosted-zone-configuration) in the Goldstack documentation.
*   **Primary Website Domain**: This is the domain your users will use to view the site. For instance, if you configure the domain `mysite.com`, users will be able to view your site by opening the URL `https://mysite.com`.
*   **Redirect Website Domain**: This is a domain that will redirect all requests to your *Primary Website Domain*. The redirect website domain *must be* different to the *Primary Website Domain*. For instance, if you configure the domain `mysite.com` as your primary domain, you can configure `www.mysite.com` as your redirect domain. Users will be redirected to `https://mysite.com` when they attempt to open the URL `https://www.mysite.com`. Note that the *Redirect Website Domain* must be configured, even if you do not need this functionality.
*   **Default Cache Duration**: The number of seconds that files will be cached in the AWS content delivery network. Setting this to `120` for instance, would mean that, unless otherwise specified, webpages and other resources will be cached for 120 s. In that case, when a new version of a page is deployed, it can take up to 120 s for changes to appear when accessing the deployed version of the application.

## Getting Started

### Infrastructure

The first thing we recommend to do with a new module is to stand up the infrastructure for the module. For this, find the directory for this module in the `packages/` folder and navigate to this folder in the command line. Then identify the name of the deployment you have defined in the Goldstack configuration tool. This can be found in the `packages/[moduleName]/goldstack.json` file. Look for the `"deployments"` property and there for the `"name"` of the first deployment. The name should either be `dev` or `prod`.

In order to stand up the infrastructure, run the following command:

```bash
yarn infra up [deploymentName]
```

This will be either `yarn infra up dev` or `yarn infra up prod` depending on your choice of deployment. Note that running this command can take a while.

Note that you will not be able to access your website yet. First run a deployment as described below.

### Deployment

Once the infrastructure is successfully set up in AWS using `yarn infra up`, we can deploy the module. For this, simply run the following command:

```bash
yarn deploy [deploymentName]
```

This will either be `yarn deploy dev` or `yarn deploy prod` depending on your choice of deployment during project configuration.

You should now be able to view your website on the domain name you have configured. You can find the domain name in `goldstack.json` under `"deployments"` and there the property `"websiteDomain"` for your selected deployment.

#### Development

This module allows publishing simple static websites. You can start developing your website by modifying the files in the `web/` folder or copy and paste the files of an existing website in there. The module will deploy all files from this folder to the AWS infrastructure.

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

## Deployment

This module can be packaged up and deployed to the deployments specified in `goldstack.json`. Note that deployment will only work *after* the infrastructure for the respective deployment has been stood up. To deploy your module, run the following script:

```bash
yarn deploy [deploymentName]
```

## Troubleshooting and Frequently Asked Questions

### AccessDenied error when setting up infrastructure

When running \`yarn infra up [deploymentName], you may get AccessDenied errors such as the following:

```bash
Error: error getting S3 Bucket CORS configuration: AccessDenied: Access Denied
        status code: 403, request id: 1Z1VFR1N5RAMFZ9W, host id: mYdqmUJ8Vo+t845tuW9NNYF8WVnKxlbynRAir4BoMKHKB5kcFjM3uiGkJpQAHGHxusa6sHzcazs=
```

There are a number of possible causes for this:

*   You may have configured your AWS user incorrectly. Please see [AWS Configuration](./../goldstack/configuration#aws-configuration) for details on how to configure your AWS user.
*   You may accidently have a Terraform state in your module. That can happen if you create new modules by copy and pasting from an existing module. In this case, delete the following two folders in your module: `infra/aws/.terraform` and `infra/aws/terraform.tfstate.d`.

## Security Hardening

We are not aware of any additional security hardening that can be performed for this module. Please [raise an issue](https://github.com/goldstack/goldstack/issues) if there are any further steps that could be taken.
