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

You can optionally define this variable in `goldstack.json`:

```json
      "configuration": {
        "lambdaName": "my-lambda",
        ...
        "myEnv": "Value for deployment"
      }
```

Alternatively, you can provide the value through environment variables or `.env` files (see below for details). This is useful for sensitive values that should not be committed to source control.

Note that the Terraform variable `my_env` translates to `myEnv` in the JSON definition (Just remove all `_` and make the first character after `_` uppercase for your variable definitions).

Lastly, to support local development make sure to define the variable correctly in all `scripts` in `package.json`. Specifically, you may want to define them for `"test"`, `"test"` and `"watch"`.

```json
    "test": "MY_ENV=localvalue jest --passWithNoTests --config=jest.config.js --detectOpenHandles",
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

### Providing Terraform Variables via .env Files

You can provide Terraform variable values through `.env` files. This is particularly useful for sensitive values that should not be committed to source control. Variables defined in `variables.tf` can be resolved from `.env` files even if they are not defined in `goldstack.json`.

Goldstack will load `.env` files from both the monorepo root and the package directory in the following order (later files override earlier ones):

1. `root/.env` - Shared across all deployments
2. `root/.env.[deployment]` - Deployment-specific (e.g., `.env.prod`)
3. `package/.env` - Package-specific shared values
4. `package/.env.[deployment]` - Package and deployment-specific (highest priority)

For example, to set the `my_env` variable for the `prod` deployment, create a `.env.prod` file in your package directory:

```
MY_ENV=my-value-for-production
```

Note that environment variable names should be uppercase versions of the Terraform variable names (e.g., `my_env` → `MY_ENV`).

#### Variable Resolution Priority

When resolving Terraform variable values, Goldstack uses the following priority (from highest to lowest):

1. Values defined in `goldstack.json` configurations
2. Environment variables (`process.env`)
3. Values from `.env` files

If a variable defined in `variables.tf` is not found in any of these sources, a warning will be logged.
