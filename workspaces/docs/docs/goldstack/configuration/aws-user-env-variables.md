### Credentials in Environment Variables

Goldstack can read AWS _Access Key ID_ and _Secret Access Key_ from environment variables. The easiest way is to set the following environment variables:

```bash
AWS_USER_NAME: [Your user name]
AWS_ACCESS_KEY_ID: [Your access key id]
AWS_SECRET_ACCESS_KEY: [Your secret access key]
AWS_DEFAULT_REGION: [User region]
```

The `AWS_USER_NAME` variable is optional but can be useful for explicitly referencing the correct Goldstack user in deployments. The above setup is particularly useful for CI/CD environments. For instance, when using [GitHub Actions](https://github.com/actions), environment variables could be configured as follows:

```yaml
- name: Deploy UI
  run: |
    yarn workspace my-ui deploy dev
  env:
    AWS_USER_NAME: dev-user
    AWS_ACCESS_KEY_ID: ${{secrets.AWS_ACCESS_KEY_ID}}
    AWS_SECRET_ACCESS_KEY: ${{secrets.AWS_SECRET_ACCESS_KEY}}
    AWS_DEFAULT_REGION: us-west-2
```

The values of the environment variables are defined in [GitHub Secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets).
