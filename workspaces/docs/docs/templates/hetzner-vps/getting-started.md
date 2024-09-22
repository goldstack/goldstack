[!embed](./../shared/getting-started-project.md)

[!embed](./../shared/getting-started-infrastructure.md)

### 3. Development

The application deployed to Hetzner is defined in the `server/` directory.

You can edit the files here. The `start.sh` script will be run every time a deployment is made to the server using `yarn deploy [deployment]`.

If using docker-compose, you should also be able to develop locally easily. Simply provide a `.env` file with the environment configuration for your local development environment.

You may also define secrets in the `server/secrets/` folder as individual text files that contain nothing but the secret value (e.g. `server/secrets/my_secret.txt`).

For your remote environments defined in `goldstack.json`, environment variables will be defined from the properties in `goldstack.json`. Secrets will be read from the file `credentials.json`. Use the following format to define secrets in `credentials.json`:

```json
{
  "prod": {
    "dummy": "thats the value"
  }
}
```

This `credentials.json` will result in the file `/home/goldstack/app/secrets/dummy.txt` to be created with the content `thats the value`. This should make it easy to use it in a docker-compose file, see [How to use secrets in Docker Compose](https://docs.docker.com/compose/how-tos/use-secrets/).

