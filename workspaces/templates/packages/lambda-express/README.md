# Lambda Express Module

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

Goldstack's Lambda Express module provides a basic Express.js server that is deployed as an AWS lambda function.

## Features

- Express.js server running on AWS Lambda
- Very low cost, scalability out of the box
- Server packaged up using Webpack for small deployment size and quick on-demand start in Lambda
- All infrastructure defined in Terraform, easy to change and extend
- Infrastructure easily rolled out with dedicated npm script
- Deployment automated using Node.js module
- TypeScript, ESLint and Prettier configured

## Configure

The following key properties need to be configured for this module:

- **Lambda Name**: The [name](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-FunctionName) to be used for this lambda. Lambda names need to be unique for the AWS Region. It is not possible to have two lambdas with the same name in the same region.
- **API Domain**: The domain where the API should be deployed to. For instance, to be able to call the API endpoint `https://api.mydomain.com/` the API domain `api.mydomain.com` needs to be configured.
- **Hosted Zone Domain**: A Route 53 hosted zone that will allow adding the _API Domain_ as a record. For instance, in order to configure the API domain `api.mydomain.com`, the hosted zones `api.mydomain.com` or `mydomain.com` would be valid. For more details, please check [Hosted Zone Configuration](https://docs.goldstack.party/docs/goldstack/configuration#hosted-zone-configuration) in the Goldstack documentation.
- **CORS Header**: An optional CORS header to enable a UI that is hosted on a different domain to access this API. For instance, for a UI that is deployed to the domain `ui.mydomain.com` the CORS header `https://ui.mydomain.com` should be supplied. To learn more about CORS, see the [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) in the MDN docs.

## Getting Started

### Infrastructure

The first thing we recommend to do with a new module is to stand up the infrastructure for the module. For this, find the directory for this module in the `packages/` folder and navigate to this folder in the command line. Then identify the name of the deployment you have defined in the Goldstack configuration tool. This can be found in the `packages/[moduleName]/goldstack.json` file. Look for the `"deployments"` property and there for the `"name"` of the first deployment. The name should either be `dev` or `prod`.

In order to stand up the infrastructure, run the following command:

```bash
yarn infra up [deploymentName]
```

This will be either `yarn infra up dev` or `yarn infra up prod` depending on your choice of deployment. Note that running this command can take a while.

Note that your API will not work yet. It first needs to be deployed as per instructions below.

### Deployment

Once the infrastructure is successfully set up in AWS using `yarn infra up`, we can deploy the module. For this, simply run the following command:

```bash
yarn deploy [deploymentName]
```

This will either be `yarn deploy dev` or `yarn deploy prod` depending on your choice of deployment during project configuration.

You should now be able to access your API. The domain under which the API is deployed is configured in `goldstack.json` under `"deployments[*].apiDomain"`. You can access this API domain with a browser since the default API provided in the template allows for GET requests to the root.

### Development

The source code for the express server is defined in the `src/` folder. The entry point for defining new routes is in `src/server.ts`. The easiest way to get started extending the API is to modify or add new routes to the server here.

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

- `yarn infra up`: For standing up infrastructure.
- `yarn infra init`: For [initialising Terraform](https://www.terraform.io/docs/commands/init.html).
- `yarn infra plan`: For running [Terraform plan](https://www.terraform.io/docs/commands/plan.html).
- `yarn infra apply`: For running [Terraform apply](https://www.terraform.io/docs/commands/apply.html).
- `yarn infra destroy`: For destroying all infrastructure using [Terraform destroy](https://www.terraform.io/docs/commands/destroy.html).

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

This module can be packaged up and deployed to the deployments specified in `goldstack.json`. Note that deployment will only work _after_ the infrastructure for the respective deployment has been stood up. To deploy your module, run the following script:

```bash
yarn deploy [deploymentName]
```

## Guides and How To

### Adding environment variables

Environment variables are defined in the Terraform source code for this module. Specifically they are defined in the `infra/aws/lambda.tf` file in the resource `resource "aws_lambda_function" "main"`. By default, there is one environment variable specified that identifies the Goldstack deployment used.

```hcl
 environment {
    variables = {
      GOLDSTACK_DEPLOYMENT = var.name
    }
  }
```

Add your environment variables into the `variables` map:

```hcl
 environment {
    variables = {
      GOLDSTACK_DEPLOYMENT = var.name
      YOUR_ENV_VAR = 'your env var value'
    }
  }
```

Usually environment variables should have different values depending on which environment the server is deployed to. This can be accomplished using Terraform variables. Change your variable declaration to the following:

```hcl
YOUR_ENV_VAR = var.my_env
```

Then go into the file `infra/aws/variables.tf` and add the following definition:

```hcl
variable "my_env" {
  description = "My environment variable"
  type = string
}
```

And finally add this variable to all deployment configurations in `goldstack.json`:

```json
      "configuration": {
        "lambdaName": "my-lambda",
        "apiDomain": "api.mysite.com",
        "hostedZoneDomain": "mysite.com",
        "cors": "https://mysite.com",
        "myEnv": "Value for deployment"
      }
```

Note that the Terraform variable `my_env` translates to `myEnv` in the JSON definition (Just remove all `_` and make the first character after `_` uppercase for your variable definitions).

Lastly, to support local development make sure to define the variable correctly in all `scripts` in `package.json`. Specifically, you may want to define them for `"test"`, `"test-ci"` and `"watch"`.

```json
    "test": "MY_ENV=localvalue jest --passWithNoTests --watch --config=jest.config.js",
    "test-ci": "MY_ENV=localvalue jest --passWithNoTests --config=jest.config.js --detectOpenHandles",
    "watch": "PORT=8731 MY_ENV=localvalue nodemon --config nodemon.json --exec 'yarn node dist/src/local.js'"
```

Note that for credentials and other values that should not be committed to source code, it may be better to store these in AWS Secrets Manager and retrieve them using the AWS SDK based on the `process.env.GOLDSTACK_DEPLOYMENT` value provided.

It is also possible to provide the value of Terraform variables through environment variables during build time. For instance, if you have defined the variable `my_env`, simply provide the environment variable `MY_ENV` when calling `yarn infra`.

```bash
MY_ENV=value yarn infra up prod
```

This works very well in combination with secrets for GitHub actions.

```yaml
- name: Deploy API
  run: |
    yarn workspace my-api infra up prod
  env:
    MY_ENV: ${{secrets.MY_ENV}}
    AWS_USER_NAME: goldstack-prod
    AWS_ACCESS_KEY_ID: ${{secrets.PROD_AWS_ACCESS_KEY_ID}}
    AWS_SECRET_ACCESS_KEY: ${{secrets.PROD_AWS_SECRET_ACCESS_KEY}}
    AWS_DEFAULT_REGION: us-west-2
```

## Troubleshooting and Frequently Asked Questions

### DNS Name for API Cannot be resolved

After applying `yarn infra up [deployment]` and `yarn deploy [deployment]` it is not possible to call the API at `https://[configuration.apiDomain]`. An error such as `Address cannot be resolved` or `DNSProbe failed` is reported.

This is caused by changes to the deployed DNS hosted zone needing some time to propagate through the DNS network. Wait for 10-30 min and the API should be able to be called without problems. To validate your DNS name has been configured correctly, go to the [AWS Route 53 Console](https://aws.amazon.com/route53/), choose the region you have deployed, and validate there is a correct entry for the hosted zone you have selected. There should be an A entry such as the following:

    [apiDomain].[hostedZone] A [id].cloudfront.net.

## Security Hardening

This module requires further security hardening when deployed in critical production applications. Specifically the lambda is given the role `arn:aws:iam::aws:policy/AdministratorAccess"` and this will grant the lambda access to all resources on the AWS account, including the ability to create and destroy infrastructure. It is therefore recommended to grant this lambda only rights to resources it needs access to, such as read and write permissions for an S3 bucket. This can be modified in `infra/aws/lambda.tf` in the resource `resource "aws_iam_role_policy_attachment" "lambda_admin_role_attach"`.
