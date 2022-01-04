---
id: template-lambda-api
title: Serverless API
---

[!embed](./about.md)

## Features

[!embed](./features.md)

## Configure

[!embed](./configure.md)

## Getting Started

[!embed](./getting-started.md)

## Infrastructure

[!embed](./../shared/infrastructure.md)

## Deployment

[!embed](./../shared/deployment.md)

## Guides and How To

### Adding environment variables

Environment variables are defined in the Terraform source code for this module. Specifically they are defined in the `infra/aws/lambda_routes.tf` file in the resource `resource "aws_lambda_function" "this"`. Note that all lambdas share the same environment variables. By default, there are a few environment variables specified:

```hcl
 environment {
    variables = {
      GOLDSTACK_DEPLOYMENT = var.name
      CORS                 = var.cors
      NODE_OPTIONS         = "--enable-source-maps"
    }
  }
```

Add your environment variables into the `variables` map:

```hcl
 environment {
    variables = {
      GOLDSTACK_DEPLOYMENT = var.name
      CORS                 = var.cors
      NODE_OPTIONS         = "--enable-source-maps"
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
- name: Update API infra
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

[!embed](./../lambda-express/faq.md)

### Concurrent Modification Error when Creating Infrastructure

The following error may be displayed sometime when running `yarn infra up prod [deploymentName]` for the first time. This is due to an error in the way Terraform schedules the creation of the resources. The easy solution to this problem is simply running `yarn infra up prod [deploymentName]` again.

```
Error: error creating API Gateway v2 route: ConflictException: Unable to complete operation due to concurrent modification.
Please try again later.
```

See [Issue #40](https://github.com/goldstack/goldstack/issues/40)

## Security Hardening

This module requires further security hardening when deployed in critical production applications. Specifically the lambdas are given the role `arn:aws:iam::aws:policy/AdministratorAccess"` and this will grant the lambdas access to all resources on the AWS account, including the ability to create and destroy infrastructure. It is therefore recommended to grant the lambdas only rights to resources it needs access to, such as read and write permissions for an S3 bucket. This can be modified in `infra/aws/lambda_shared.tf` in the resource `resource "aws_iam_role_policy_attachment" "lambda_admin_role_attach"`.

Note that in this templates all lambdas for the API share the same permissions. This is by design to simply setup and management of the infrastructure in the understanding that the API forms one integrated element of a system. If there are concerns about access to resourced being shared by multiple lambdas, another API can be created.
