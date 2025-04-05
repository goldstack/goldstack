---
id: hetzner-vps
title: Hetzner VPS
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

### Hetzner Credentials

To use the Hetzner Terraform provider, a token is required. To generate a token, please see [Hetzner Documentation: Generating an API token](https://docs.hetzner.com/cloud/api/getting-started/generating-api-token/). Goldstack will look for this token by looking up the user matching the deployment in: `config/infra/hetzner/config.json`.

You can provide the secret as follows:

```json
{
  "users": [
    {
      "name": "max",
      "config": {
        "token": "xxx"
      }
    }
  ]
}
```

Goldstack will also look for the environment variable `HCLOUD_TOKEN`, and if that is defined, will use that as the token for the Hetzner deployment. This makes it easy to provide this in GitHub actions.

Anything in `config.json` will be ignored if the environment variable is set.

### GitHub Actions

To deploy from GitHub actions, you will need an SSH user.

For this, first create an SSH key and add it to Hetzner, see [How to create an SSH key and attach it to a Hetzner server](https://medium.com/@benjaminstorm/how-to-create-an-ssh-key-and-attach-it-to-a-hetzner-server-e183536fd0ce).

Note we will need the fingerprint in configuring `goldstack.json`.

## Environment Variables

Environment variables can be supplied in a number of ways.

### For Local Development

Define environment variables in a `.env` file, stored in the `server/` directory.

```
MY_ENV=value
```

### For Deployments

Define environment variables for deployments in their `"configuration"` in `goldstack.json`:

```json
 "deployments": [
    {
      "name": "prod",
      "configuration": {
        "environmentVariables": [
          {
            "name": "DUMMY_ENV",
            "value": "I rock"
          },
          {
            "name": "HTTP_PORT",
            "value": "80"
          },
          {
            "name": "HTTPS_PORT",
            "value": "443"
          }
        ]
      },
    }
```

## Secrets

The VPS will by default be provided with credentials for the AWS IAM user that is used to deploy files to the server.

Additional secrets can be defined by manually editing the file: `dist/credentials/credentials`.

Any additional properties added to the JSON file will be unpacked into files in the `~/app/secrets` folder.

```
goldstack@goldstack-docker:~/app$ ls secrets/
# -> accessKeyId.txt  awsRegion.txt  mySecret.txt  secretAccessKey.txt
```

These should be easy to consume as [secrets in a Docker Compose file](https://docs.docker.com/compose/use-secrets/#simple).

```yaml
services:
  myapp:
    image: myapp:latest
    secrets:
      - my_secret
secrets:
  my_secret:
    file: ./my_secret.txt
```

Editing the file `dist/credentials/credentials` manually can be useful during development. However, a better way is to define a GitHub action to deploy the server.

In the GitHub action, one can use GitHub secrets to set the content of `credentials.json` with the secrets required before the infrastructure is created and before a deployment.

```yaml
      - name: Create credentials file
        run: |
          cd packages/node2
          echo '
          {
            "dev": {
              "CF_TUNNEL": "${{ secrets.CF_TUNNEL_DEV }}",
              "AWS_ACCESS_KEY_ID": "${{secrets.AWS_ACCESS_KEY_ID_DEV}}",
              "AWS_SECRET_ACCESS_KEY": "${{secrets.AWS_SECRET_ACCESS_KEY_DEV}}",
            }
          }' > credentials.json
```

These secrets will be written into the `server/secrets` folder. For instance: `server/secrets/secret1.txt`.

Note these secrets will be loaded as environment variables on the server during `yarn deploy [environment]` within the scripts `init.sh` and `start.sh`.