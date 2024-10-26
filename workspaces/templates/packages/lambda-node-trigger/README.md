# Node Trigger Lambda template

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

The Lambda Python Job template allows defining an AWS Lambda and Python and triggering this function on a schedule.

## Features

*   Write Python code and deploy it to AWS Lambda
*   Includes command line utilities to package code as ZIP and to deploy to AWS Lambda
*   Trigger the function according to a schedule (e.g. once per hour)

## Getting Started

In order to develop your Python Lambda, go to the `lambda/` directory contained in the template.

First, we need to initialise a virtual environment:

    python -m venv lambda_env

Then activate the environment:

    source lambda_env/Scripts/activate # Windows
    source venv/bin/activate # Linux/ iOS

Finally install the dependencies:

    pip install -r requirements.txt

Now you are ready to develop your Python function.

Open the `lambda/lambda.py` file in VSCode.

Then ensure that the correct environment is selected (see [VSCode Docs: Select and Activate and Environment](https://code.visualstudio.com/docs/python/environments#\_select-and-activate-an-environment). For this, click on the bottom right of your editor where python is referenced. Click there to select an interpreter, and then point to the Python executable that is in the `lambda_env` folder.

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

Infrastructure commands for this template can be run using `yarn`. There are four commands in total:

*   `yarn infra up`: For standing up infrastructure.
*   `yarn infra init`: For [initialising Terraform](https://www.terraform.io/docs/commands/init.html).
*   `yarn infra plan`: For running [Terraform plan](https://www.terraform.io/docs/commands/plan.html).
*   `yarn infra apply`: For running [Terraform apply](https://www.terraform.io/docs/commands/apply.html).
*   `yarn infra destroy`: For destroying all infrastructure using [Terraform destroy](https://www.terraform.io/docs/commands/destroy.html).
*   `yarn infra upgrade`: For upgrading the Terraform versions (supported by the template). To upgrade to an arbitrary version, use `yarn infra terraform`.
*   `yarn infra terraform`: For running arbitrary [Terraform commands](https://www.terraform.io/cli/commands).

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

Note this Lambda will be executed on a schedule. The schedule is defined in `infra/aws/schedule.tf`.

## Deployment

This template can be packaged up and deployed to the deployments specified in `goldstack.json`. Note that deployment will only work *after* the infrastructure for the respective deployment has been stood up. To deploy your package, run the following script:

```bash
yarn deploy [deploymentName]
```

The ZIP file that is deployed is stored in the template directory as `lambda.zip`.

Note it is also possible to only build the ZIP package locally without uploading it. For this, run:

    yarn build

This will copy the files that need to be deployed into the folder `distLambda/`.

## Guides and How Tos

### Adding environment variables

Environment variables are defined in the Terraform source code for this template. Specifically they are defined in the `infra/aws/lambda.tf` file in the resource `resource "aws_lambda_function" "main"`. By default, there is one environment variable specified that identifies the Goldstack deployment used.

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
        ...
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

## Security Hardening

This module requires further security hardening when deployed in critical production applications. Specifically the lambda is given the role `arn:aws:iam::aws:policy/AdministratorAccess"` and this will grant the lambda access to all resources on the AWS account, including the ability to create and destroy infrastructure. It is therefore recommended to grant this lambda only rights to resources it needs access to, such as read and write permissions for an S3 bucket. This can be modified in `infra/aws/lambda.tf` in the resource `resource "aws_iam_role_policy_attachment" "lambda_admin_role_attach"`.
