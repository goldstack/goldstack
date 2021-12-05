### Credentials in User Directory

The AWS CLI uses a standardised location to store AWS credentials and configuration. Goldstack will attempt to read from this configuration if no other configuration was provided.

Please see the AWS documentation to learn more about where these files are stored and how to create them: [AWS CLI / Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

Note that Goldstack will require both the `credentials` as well as the `config` file, and in the `config` file specifically the `region` needs to be specified.

Goldstack will use the `default` profile if no profile is specified. If you want to use more than one profile (e.g. for different deployment stages) you can use the Goldstack AWS configuration file. This file is stored in the repository in the following location:

```bash
config/infra/aws/config.json
```

You can define a number of different users as follows:

```
{
  "users": [
    {
      "name": "dev",
      "type": "profile",
      "config": {
        "profile": "default",
        "awsDefaultRegion": "us-west-2"
      }
    },
    {
      "name": "prod",
      "type": "profile",
      "config": {
        "profile": "prod",
        "awsDefaultRegion": "us-west-2"
      }
    }
  ]
}`
```
