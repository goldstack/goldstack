<p align="right"><img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="12"> Generated with <a href="https://goldstack.party">Goldstack</a></p>

<p align="center">
  <a href="https://goldstack.party/templates/static-website">
    <img src="https://cdn.goldstack.party/img/202204/cloudfront.svg" height="80">
    <h1 align="center">Static Website Boilerplate</h1>
  </a>
</p>

Develop a static website using HTML and CSS. Test the website locally. Deploy to AWS using [CloudFront](https://aws.amazon.com/s3/) and [S3](https://aws.amazon.com/cloudfront/).

This boilerplate has been automatically generated using the template:

<table>
  <tbody>
    <tr>
      <td>
        <p align="center"><a href="https://goldstack.party/templates/static-website"><img width="50" src="https://cdn.goldstack.party/img/202204/cloudfront.svg"></a></p>
        <p><a href="https://goldstack.party/templates/static-website">Static Website</a></p>
      </td>
    </tr>
  </tbody>
</table>

Feel free to fork this repository and modify it for your needs, or use the [Goldstack project builder](https://goldstack.party/build) to generate a boilerplate specifically configured for your project.

# Getting Started

Thank you for using this boilerplate. For any questions or feedback, please be welcome to [raise an issue on GitHub](https://github.com/goldstack/goldstack/issues) 🤗 .

## 1. Fork and clone the repository

[Fork this repository](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and then [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the fork your local machine.

## 2. Install required local dependencies

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/dependencies.md)

## 3. Initialise project and install NPM Dependencies

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/install.md)

## 4. Build modules

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/build.md)

## 5. Configure VSCode

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/vscode.md)

## 6. Initialise TypeScript

[!embed](./../../../../../../workspaces/docs/docs/shared/getting-started/typescript.md)

## 7. Local Development

Go to the folder `packages/static-website-aws` and run `yarn watch`. This will start a local development server.

<img src="https://cdn.goldstack.party/img/202204/local-development.gif" alt="VSCode Locate TypeScript">

To make changes to the web page, edit the files in the folder `packages\static-website-aws\web`.

<img src="https://cdn.goldstack.party/img/202204/edit_webpage.png" alt="Edit webpage included in template">

## 8. Deploy to AWS

If you want to deploy your project to AWS, you will need to make some changes to the configuration files included in this project.

Specifically, the [goldstack.json](https://github.com/goldstack/static-website-boilerplate/blob/master/packages/static-website-1/goldstack.json) in the `packages/static-website-aws` folder.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "static-website-1",
  "template": "static-website-aws",
  "templateVersion": "0.1.0",
  "configuration": {},
  "deployments": [
    {
      "name": "prod",
      "awsUser": "goldstack-dev",
      "awsRegion": "us-west-2",
      "configuration": {
        "hostedZoneDomain": "dev.goldstack.party",
        "websiteDomain": "staticwebsite1-1651273869629.tests.dev.goldstack.party",
        "websiteDomainRedirect": "www.staticwebsite1-1651273869629.tests.dev.goldstack.party",
        "defaultCacheDuration": 10
      },
      "tfStateKey": "static-website-1-prod-0397e051cd046f2d46e7.tfstate"
    }
  ]
}
```

The key properties you will need to update are:

- `deployments[0].configuration.hostedZoneDomain`
- `deployments[0].configuration.websiteDomain`

Also you need to _delete_ `deployments[0].tfStateKey`.

For more information on these configuration options, see [Goldstack Documentation / Static Website AWS Template / Configure](https://docs.goldstack.party/docs/templates/static-website-aws#configure).

You will also need to ensure that you have a valid AWS user configure to deploy to AWS. For this, create a file in `/config/infra/config.json` (relative to project root).

```
{
  "users": [
    {
      "name": "goldstack-dev",
      "type": "apiKey",
      "config": {
        "awsAccessKeyId": "...",
        "awsSecretAccessKey": "...",
        "awsDefaultRegion": "us-west-2"
      }
    },
    {
      "name": "goldstack-prod",
      "type": "apiKey",
      "config": {
        "awsAccessKeyId": "...",
        "awsSecretAccessKey": "",
        "awsDefaultRegion": "us-west-2"
      }
    }
  ]
}
```

For more information on configuring your local AWS users, please see [Goldstack Documentation / AWS Configuration](https://docs.goldstack.party/docs/goldstack/configuration#aws-configuration).

Once your AWS user is configured you can run `yarn infra up prod` in the `/packages/static-website-aws` folder. For more information on the infrastructure commands for this project, see [Goldstack Documentation / Static Website Template / Infrastructure](https://docs.goldstack.party/docs/templates/static-website-aws#infrastructure).

## 9. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
