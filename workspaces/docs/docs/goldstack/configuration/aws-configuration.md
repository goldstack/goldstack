In order to set up infrastructure on AWS and for running deployed services, Goldstack needs access to AWS credentials. These can be provided in a number of ways:

### Using the default local AWS user

If you have the [AWS CLI](https://aws.amazon.com/cli/) installed and have [credentials configured locally](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html), Goldstack will use the default AWS user if no other configuration options are provided.

You can check if the default AWS user is configured by running [`aws configure list`](https://docs.aws.amazon.com/cli/latest/reference/configure/list.html).

```
aws configure list
```

### Using a specific local AWS user

[!embed](./aws-user-user-config-file.md)

### Using process credentials

There are a number of issues when trying to work with multiple profiles and SSO credentials, see [aws/aws-cli#4982 (comment)](https://github.com/aws/aws-cli/issues/4982#issuecomment-939348934) and [goldstack/goldstack#17](https://github.com/goldstack/goldstack/issues/17).

An excellent way to deal with situations where we do not want to provide the user credentials directly is to use [process credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sourcing-external.html).

Goldstack supports defining process credentials in the `config/infra/aws/config.json` file.

```json
"users": [
    {
      "name": "dev-user",
      "type": "profile",
      "config": {
        "profile": "with-process",
        "awsDefaultRegion": "us-west-2",
        "credentialsSource": "process"
      }
    }
  ]
```

This will require a `~/.aws/config` file as follows:

```
[with-process]
credential_process=[your command]
```

Useful commands to use in the `credential_process` field are: [aws-sso-creds-helper](https://github.com/ryansonshine/aws-sso-creds-helper), [aws-sso-util](https://github.com/benkehoe/aws-sso-util#adding-aws-sso-support-to-aws-sdks), [aws-vault](https://github.com/99designs/aws-vault/blob/0615e7c8cddc5d5046e29b87acfc0fe73c1aa998/USAGE.md#using-credential_process) and [aws2-wrap](https://github.com/linaro-its/aws2-wrap#use-the-credentials-via-awsconfig).

### Using credentials in Goldstack configuration file

[!embed](./aws-user-config-file.md)

### Using environment variables

[!embed](./aws-user-env-variables.md)
