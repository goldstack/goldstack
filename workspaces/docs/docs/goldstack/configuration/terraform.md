All Goldstack templates contain Terraform Infrastructure as Code definitions. Goldstack provides easy tooling to stand up this infrastructure. Terraform will use the _AWS credentials_ configured as per the instructions above.

All state will be stored in [Terraform S3 remote state using DynamoDB locking](https://www.terraform.io/docs/language/settings/backends/s3.html). Goldstack will automatically create a bucket for storing the state in the same AWS account that the infrastructure is deployed to (thus being able to use the same AWS credentials).

During standing up the infrastructure for the first package of a project, Goldstack will create the `config/infra/aws/terraform.json` file that contains the S3 bucket and DynamoDB table for all packages deployed to a respective AWS account. Below an example `terraform.json` file.

```json
{
  "remoteState": [
    {
      "user": "dev",
      "terraformStateBucket": "goldstack-tfstate-67a73e60720c25855a39baeb1218b55229578671",
      "terraformStateDynamoDBTable": "goldstack-tfstate-a82076777995c7254fbcae1f9e8013fee75833f2-lock"
    },
    {
      "user": "prod",
      "terraformStateBucket": "goldstack-tfstate-0cb1a35a83c9c952321ee4addbe76d096b031d47",
      "terraformStateDynamoDBTable": "goldstack-tfstate-0cb1a35a83c9c957772ee4addbe76d096b031d47-lock"
    }
  ]
}
```

To prevent Goldstack from auto-generating the bucket and table names, provide a `terraform.json` file before standing up the infrastructure for your first package. Goldstack will create bucket and table using the names you specify then. Also, if you have special requirements for your bucket and table, you can create these before standing up the infrastructure with Goldstack. You only need to ensure that the bucket and table fulfil the requirements of Terraform for storing its remote state.

All packages included in a project will use the same bucket and DynamoDB table. The name of the state file will be defined in the `goldstack.json` file within each package.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "mypackage",
  "deployments": [
    {
      "name": "dev",
      "tfStateKey": "mypackage-dev-f53056a8788c8eb7a1ac.tfstate"
    }
  ]
}
```

If the `tfStateKey` property is defined before running `yarn infra init [deployment]`, Goldstack will use the name specified as key for the state in bucket and DynamoDB table. If the `tfStateKey` property is not defined, a name will be generated and `goldstack.json` updated.

Ensure that after standing up infrastructure for the first time to commit and push changes to your project, since Goldstack will update `goldstack.json` config and the `config/infra/aws/terraform.json` config. This is only required for initialising the infrastructure for each package and target AWS account (and if you do not provide the names for bucket, table and state files manually). For subsequent updates to the infrastructure it is not necessary to update the source files.

### Upgrading Terraform Version

Terraform frequently releases new versions of their tooling. Goldstack provides tooling to support different versions of Terraform for different modules and for upgrading Terraform.

⚠️ Note that upgrading Terraform is often a difficult process and although Goldstack provides some tools to make this process easier, expect that a number of manual steps and fixes will be required.

First note that Goldstack allows defining the version of Terraform that is to be used for executing infrastructure commands in two ways:

1. Centrally for a package using a file `infra/tfConfig.json` such as the following:

```json
{
  "tfVersion": "1.14.7"
}
```

2. If a project has multiple different deployments that require different Terraform versions, or for first upgrading Terraform for test environments, it is also possible to specify the Terraform version per deployment. For this, add the `"tfVersion"` property to a `"configuration"` for a deployment in `goldstack.json`, for instance:

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "lambda-api-template",
  "template": "lambda-api",
  "templateVersion": "0.1.0",
  "configuration": {},
  "deployments": [
    {
      "name": "prod",
      "awsRegion": "us-west-2",
      "awsUser": "goldstack-dev",
      "configuration": {
        "tfVersion": "1.14.7"
      }
    }
  ]
}
```

Changing the Terraform version will result in Goldstack using the specified version of the Docker image `hashicorp/terraform:[version]`. Please avoid specifying minor versions: use `0.12` not `0.12.1`.

Note that Terraform often provides upgrade scripts for Terraform. These can either be applied by installing the matching Terraform version locally or using the following Goldstack command:

```
yarn infra upgrade [deployment] [targetVersion]
```

Note that this command is only supported for a limited number of versions. Also versions need to be upgraded one jump at a time, e.g. going from `0.12` to `0.13` is supported but not going from `0.12` to `0.14` or higher versions. For a reference of available versions, see [Terraform Versions](https://releases.hashicorp.com/terraform/).

It is recommend to run `yarn infra init [deployment]`, `yarn infra up [deployment]` and `yarn deploy [deployment]` after every `upgrade` command.

Note that you may have to upgrade various versions in `infra/aws/terraform/providers.tf` as well as making various other changes upgrading Terraform may involve, also see [Terraform Upgrade Guides](https://www.terraform.io/language/upgrade-guides).

### Releasing State Locks

Goldstack automatically creates Terraform state files on S3 and maintains a state lock using DynamoDB. Sometimes Terraform state can become locked if an operation fails unexpectedly. When performing further Terraform operations, an error as the following will be reported:

```

│ Error: Error acquiring the state lock
│
│ Error message: ConditionalCheckFailedException: The conditional request
│ failed
│ Lock Info:
│   ID:        37ce96a7-3689-8630-f346-9f1e745c038b
│   Path:      goldstack-tfstate-f865b5cbbebb107ee7639f77a95b6f46c814fff9/env:/prod/server-side-rendering-prod-9241dfab78652931e675.tfstate
│   Operation: OperationTypeApply
│   Who:       root@f3f77f0e8b44
│   Version:   1.1.3
│   Created:   2022-10-07 22:05:04.2574526 +0000 UTC
│   Info:
```

To resolve this error, take note of the `ID` above and the `deployment` for which the state file has been locked and run the command:

```
yarn infra terraform [deployment] force-unlock -force [ID]
```

### Destroying State

Goldstack provides commands to clean up Terraform state. These commands are useful when you want to completely remove a deployment or reset your infrastructure configuration.

⚠️ **Important**: All packages in a project share the same S3 bucket and DynamoDB table for storing state. The state for each deployment is stored in a separate file identified by the `tfStateKey` in `goldstack.json`.

#### Destroy Deployment State

To delete only the state file for a specific deployment:

```
yarn infra destroy-state [deployment]
```

This command:
- Deletes the `.tfstate` file for the specific deployment from S3
- Removes the lock entry for that deployment from DynamoDB
- **Does not affect other deployments** or the shared infrastructure

This is the **recommended** way to clean up state for a single deployment.

#### Destroy State Bucket

⚠️ **DANGER**: This command affects **ALL deployments** in your project.

To delete the entire S3 bucket and DynamoDB table used for Terraform state:

```
yarn infra destroy-state-bucket [deployment]
```

This command:
- Deletes **ALL** state files from the S3 bucket
- Deletes the DynamoDB table used for state locking
- Affects **every deployment** that uses the same AWS account

**When to use this command:**
- When you want to completely remove all Terraform state infrastructure
- During project cleanup when you're sure no deployments need their state
- When migrating to a different state management solution

**Confirmation required**: You must type `destroy-bucket` when prompted to confirm this destructive operation.

**Note**: After running `destroy-state-bucket`, you will need to run `yarn infra up [deployment]` again for any deployment, which will recreate the bucket and table.

### Providing Terraform Variables

Terraform variables can be defined in multiple ways. Variables are discovered from the `variables.tf` file in your `infra/aws` folder, and their values can be provided through:

1. `goldstack.json` configuration files (recommended for most values)
2. Environment variables (`process.env`)
3. `.env` files (useful for sensitive values)

**Important**: Variables defined in `variables.tf` do not need to be present in `goldstack.json`. If a variable is not defined in `goldstack.json`, Goldstack will automatically attempt to resolve its value from environment variables or `.env` files. This is particularly useful for sensitive values that should not be committed to source control.

#### Using goldstack.json

Define variables in the `configuration` property of your `goldstack.json`. There is one global `configuration` property that applies for all deployments, and each deployment can have its own `configuration` property:

```json
{
  "configuration": {
    "myVar": "global-value"
  },
  "deployments": [
    {
      "name": "prod",
      "configuration": {
        "myVar": "prod-specific-value"
      }
    }
  ]
}
```

#### Using Environment Variables

You can provide Terraform variable values directly through environment variables. For a variable named `my_var` in `variables.tf`, set the environment variable `MY_VAR`:

```bash
MY_VAR=value yarn infra up prod
```

This works well in CI/CD pipelines with secrets:

```yaml
- name: Deploy
  run: yarn workspace my-package infra up prod
  env:
    MY_VAR: ${{ secrets.MY_SECRET }}
```

#### Using .env Files

Goldstack loads `.env` files from both the monorepo root and the package directory in the following order (later files override earlier ones):

1. `root/.env` - Shared across all deployments
2. `root/.env.[deployment]` - Deployment-specific (e.g., `.env.prod`, `.env.dev`)
3. `package/.env` - Package-specific shared values
4. `package/.env.[deployment]` - Package and deployment-specific (highest priority)

For example, if you have a Terraform variable `my_var` defined in `variables.tf`, you can provide its value via a `.env` file:

```
# .env.prod
MY_VAR=my-value
```

The environment variable name should be uppercase with underscores matching the Terraform variable name (e.g., `my_var` → `MY_VAR`).

#### Variable Resolution Priority

When resolving Terraform variable values, Goldstack uses the following priority (from highest to lowest):

1. Values defined in `goldstack.json` configurations
2. Environment variables (`process.env`)
3. Values from `.env` files

If a variable defined in `variables.tf` is not found in any of these sources, a warning will be logged and the variable will not be passed to Terraform.
