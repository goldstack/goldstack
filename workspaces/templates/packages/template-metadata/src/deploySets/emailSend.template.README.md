<p align="right"><img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="12"> Generated with <a href="https://goldstack.party">Goldstack</a></p>

<p align="center">
  <a href="https://goldstack.party/templates/ses">
    <img src="https://cdn.goldstack.party/img/202204/ses2.svg" height="80">
    <h1 align="center">SES, Terraform and TypeScript Boilerplate</h1>
  </a>
</p>

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/a543d8d5d69d40ef86127f310b17a2ed)](https://www.codacy.com/gh/goldstack/nextjs-bootstrap-boilerplate/dashboard)

Boilerplate for sending emails using [Amazon Simple Email Service (SES)](https://aws.amazon.com/ses/) with [TypeScript](https://www.typescriptlang.org/) using [Yarn](https://yarnpkg.com/) ready for deployment to AWS using low-cost, highly scaleable serverless infrastructure defined using [Terraform](https://www.terraform.io/).

This boilerplate has been automatically generated using the template:

<table>
  <tbody>
    <tr>
      <td>
        <p align="center"><a href="https://goldstack.party/templates/ses"><img width="50" src="https://cdn.goldstack.party/img/202204/ses2.svg"></a></p>
        <p><a href="https://goldstack.party/templates/ses">Email Send (SES)</a></p>
      </td>
    </tr>
  </tbody>
</table>

Feel free to fork this repository and modify it for your needs, or use the [Goldstack project builder](https://goldstack.party/build) to generate a boilerplate specifically generated for your project.

⚠️ Note that it often makes sense to use the Email Send template with a backend server. Thus before forking this boilerplate, consider if you would want to start with a project that contains a server template, such as [Serverless API](https://goldstack.party/templates/serverless-api) or [Serverless Express.js](https://goldstack.party/templates/express-lambda).

# Getting Started

Thank you for using this boilerplate. For any questions or feedback, please be welcome to [raise an issue on GitHub](https://github.com/goldstack/goldstack/issues) 🤗 .

## 1. Fork and clone the repository

Fork this repository and then clone the fork into your local machine.

For more information, see [GitHub documentation - Fork a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)

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

## 7. AWS Infrastructure Configuration

If you want to setup your SES email send infrastructure on AWS, you will need to make some changes to the configuration files included in this project.

Specifically, the [goldstack.json](https://github.com/goldstack/ses-terraform-typescript-boilerplate/blob/master/packages/email-send-1/goldstack.json) in the `packages/email-send` folder.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "email-send",
  "template": "email-send",
  "templateVersion": "0.1.0",
  "configuration": {},
  "deployments": [
    {
      "name": "prod",
      "awsRegion": "us-west-2",
      "awsUser": "goldstack-dev",
      "configuration": {
        "domain": "email-send.templates.dev.goldstack.party",
        "hostedZoneDomain": "dev.goldstack.party"
      },
      "tfStateKey": "app-nextjs-bootstrap-1-prod-cd7f1f0a63ccb93ef36d.tfstate"
    }
  ]
}
```

The key properties you will need to update are:

- `deployments[0].configuration.hostedZoneDomain`
- `deployments[0].configuration.domain`

Also you need to _delete_ `deployments[0].tfStateKey`.

For more information on these configuration options, see [Goldstack Documentation / Email Send / Configure](https://docs.goldstack.party/docs/templates/email-send#configure).

You will also need to ensure that you have a valid AWS user configure to deploy to AWS. For this, create a file in `/config/infra/config.json` (relative to project root).

```json
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

Once your AWS user is configured you can run `yarn infra up dev` in the `/packages/email-send` folder. For more information on the infrastructure commands for this project, see [Goldstack Documentation / Email Send / Infrastructure](https://docs.goldstack.party/docs/templates/email-send#infrastructure).

## 8. Local Development

This boilerplate will come with a module that provides the functionalities for email sending. This module is defined in `packages/email-send`. Generally you won't have to make changes to this module during local development. Instead, create an additional npm module in the `packages/` folder and then import the `email-send` module as one of the dependencies.

Then use the exported `connect()` and `getFromDomain()` in your code to send email from your code:

```typescript
const ses = await connect();
const fromDomain = await getFromDomain();
await ses
  .sendEmail({
    Destination: { ToAddresses: ['destination@test.com'] },
    Message: {
      Subject: { Charset: 'UTF-8', Data: 'My email' },
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: 'This is the message body in text format.',
        },
      },
    },
    Source: 'sender@' + fromDomain,
  })
  .promise();
```

During local development and testing, a mocked email server will be used by default. The emails sent through the mocked server can be accessed through the exported `getMockedSES()`:

```typescript
const mockedSES = getMockedSES();
const sentEmailRequests = mockedSES.getSentEmailRequests();
```

## 9. Contribute to Goldstack

Have questions or ideas or want to contribute to the project? Please head over to [github.com/goldstack/goldstack](https://github.com/goldstack/goldstack).
