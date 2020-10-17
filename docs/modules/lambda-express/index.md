---
id: template-lambda-express
title: Lambda Express
---

[!embed](./about.md)

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

Lastly, to support local development make sure to define the variable correctly in all `scripts` in `package.json`. Specifically, you may want to define them for `"test"`, `"test:ci"` and `"watch"`.

```json
    "test": "MY_ENV=localvalue jest --passWithNoTests --watch --config=jest.config.js",
    "test:ci": "MY_ENV=localvalue jest --passWithNoTests --config=jest.config.js --detectOpenHandles",
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
