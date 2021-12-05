### Credentials in Config File

AWS credentials they can be configured directly in the Goldstack configuration file. Note we do not recommend this option. If you can, use the user credentials or environment variables.

This file can be found under the following paths:

```bash
config/infra/aws/config.json
```

The configuration file can have contents as follows:

```json
{
  "users": [
    {
      "name": "dev-user",
      "type": "apiKey",
      "config": {
        "awsAccessKeyId": "[Your Access Key ID]",
        "awsSecretAccessKey": "[Your Secret Access Key]",
        "awsDefaultRegion": "[Region for user]"
      }
    },
    {
      "name": "prod-user",
      "type": "apiKey",
      "config": {
        "awsAccessKeyId": "[Your Access Key ID]",
        "awsSecretAccessKey": "[Your Secret Access Key]",
        "awsDefaultRegion": "[Region for user]"
      }
    }
  ]
}
```

Make sure that the `"name"` property matches the `"awsUser"` of module deployments for which the user should be used. There is no limit to how many users you can define.

Note that this file should _not_ checked into source control if AWS credentials are provided.

If you want to supply AWS user credentials in your CI/CD systems, these can be supplied using environment variables and for local development you can use the files provided by the AWS CLI (see above).
