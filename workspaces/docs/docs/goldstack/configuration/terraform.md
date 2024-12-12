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
  "tfVersion": "1.10"
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
        "tfVersion": "1.10"
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
