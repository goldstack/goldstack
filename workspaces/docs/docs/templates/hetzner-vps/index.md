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

In the GitHub action, one can use GitHub secrets to set the content of `dist/credentials/credentials` with the secrets required before the infrastructure is created and before a deployment.

```yaml
- name: Create JSON file
  run: |
    echo '{
      "secret1": "${{ secrets.SECRET1 }}",
      "secret2": "${{ secrets.SECRET2 }}",
      "secret3": "${{ secrets.SECRET3 }}"
    }' > dist/credentials/credentials
```

Note the key / name of the secret should always be in camel case.
