### Credentials in Config File

AWS credentials can be configured during project set up. However if you do not want to provide your credentials in the configuration tool or you want to change them later, they can be configured through a configuration file. This file can be found under the following paths:

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

Note that we recommend that this file is _not_ checked into source control. By default, there is a `.gitignore` file present in the `config/infra/aws` folder that will prevent this file from being checked into git.

If you want to supply AWS user credentials in your CI/CD systems, these can be supplied using environment variables.