# Email Sent Module

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

The Email Send module provides a means to send emails from an application. It provides the infrastructure for email sending using [AWS Simple Email Service](https://aws.amazon.com/ses/) and provides a simple API for sending emails.

## Features

*   Easily send emails from backend applications
*   Infrastructure defined in Terraform
*   Low cost sends using AWS SES

## Configure

The following key properties need to be configured for this module:

*   **Domain**: The domain that emails will be sent from. The Email Send module will support sending emails from any possible email address in your chosen domain. For instance, if the domain `mydomain.com` is chosen, email addresses such as `support@mydomain.com`, `noreply@mydomain.com` and `system@mydomain.com` are supported.
*   **Hosted Zone Domain**: A Route 53 hosted zone that will allow adding the *Domain* as a record. For instance, in order to configure the domain `mydomain.com`, the hosted zone `mydomain.com` would be valid. For more details, please check [Hosted Zone Configuration](https://docs.goldstack.party/docs/goldstack/configuration#hosted-zone-configuration) in the Goldstack documentation.

## Getting Started

### Infrastructure

The first thing we recommend to do with a new module is to stand up the infrastructure for the module. For this, find the directory for this module in the `packages/` folder and navigate to this folder in the command line. Then identify the name of the deployment you have defined in the Goldstack configuration tool. This can be found in the `packages/[moduleName]/goldstack.json` file. Look for the `"deployments"` property and there for the `"name"` of the first deployment. The name should either be `dev` or `prod`.

In order to stand up the infrastructure, run the following command:

```bash
yarn infra up [deploymentName]
```

This will be either `yarn infra up dev` or `yarn infra up prod` depending on your choice of deployment. Note that running this command can take a while.

### Development

See below how this module can be used by other modules (for instance within an [Express Server](./../modules/lambda-express)).

```javascript
import { connect, getFromDomain } from 'my-email-send-module';

const ses = await connect();
const fromDomain = await getFromDomain();

await ses
  .sendEmail({
    Destination: { ToAddresses: ['test@test.com'] },
    Message: {
      Subject: { Charset: 'UTF-8', Data: 'Test email' },
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

Note it is also possible to add additional files into the `src/` directory of this module. This can be a good place to implement an interface specific to your application needs.

## Infrastructure

All infrastructure for this module is defined in Terraform. You can find the Terraform files for this module in the directory `[moduleDir]/infra/aws`. You can define multiple deployments for this module, for instance for development, staging and production environments.

If you configured AWS deployment before downloading your project, the deployments and their respective configurations are defined in `[moduleDir]/goldstack.json`.

The configuration tool will define one deployment. This will be either `dev` or `prod` depending on your choice during project configuration. In the example `goldstack.json` below, a deployment with the name `dev` is defined.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "...",
  "template": "...",
  "templateVersion": "...",
  "configuration": {},
  "deployments": [
    {
      "name": "dev",
      "awsRegion": "us-west-2",
      "awsUser": "awsUser",
      "configuration": {
        ...
      }
    }
  ]
}
```

### Infrastructure Commands

Infrastructure commands for this module can be run using `yarn`. There are four commands in total:

*   `yarn infra up`: For standing up infrastructure.
*   `yarn infra init`: For [initialising Terraform](https://www.terraform.io/docs/commands/init.html).
*   `yarn infra plan`: For running [Terraform plan](https://www.terraform.io/docs/commands/plan.html).
*   `yarn infra apply`: For running [Terraform apply](https://www.terraform.io/docs/commands/apply.html).
*   `yarn infra destroy`: For destroying all infrastructure using [Terraform destroy](https://www.terraform.io/docs/commands/destroy.html).

For each command, the deployment they should be applied to must be specified.

```bash
yarn infra [command] [deploymentName]
```

For instance, to stand up the infrastructure for the `dev` deployment, the following command would need to be issued:

```bash
yarn infra up dev
```

Generally you will only need to run `yarn infra up`. However, if you are familiar with Terraform and want more fine-grained control over the deployment of your infrastructure, you can also use the other commands as required.

### Customizing Terraform

Goldstack modules make it very easy to customize infrastructure to your specific needs. The easiest way to do this is to simply edit the `*.tf` files in the `infra/aws` folder. You can make the changes you need and then run `yarn infra up [deploymentName]` to apply the changes.

The `infra/aws` folder contains a file `variables.tf` that contains the variables required for your deployment; for instance the domain name for a website. The values for these variables are defined in the module's `goldstack.json` file in the `"configuration"` property. There is one global `configuration` property that applies for all deployments and each deployment also has its own `configuration` property. In order to add a new variable, add the variable to `variables.tf` and then add it to the configuration for your module or to the configurations for the deployments.

Note that due to JavaScript and Terraform using different conventions for naming variables, Goldstack applies a basic transformation to variable names. Camel-case variables names are converted to valid variables names for Terraform by replacing every instance of a capital letter `C` with `_c` in the variable name. For instance:

`myVariableName` in the Goldstack configuration will translate to the Terraform variable `my_variable_name` as defined in `variables.tf`.

### Terraform State

In order to manage your infrastructure, Terraform maintains a state for each deployment; to calculate required changes when the infrastructure is updated and also for destroying the infrastructure if it is no longer required. Goldstack by default will store the terraform state in the `infra/aws` folder as simple files.

This works well for deploying infrastructure from your local development environment but is not a good choice when building a CI/CD pipeline for the infrastructure definition. In that case, it is better to define [Remote State](https://www.terraform.io/docs/state/remote.html). A popular choice many projects adopt here is to store the [state in an S3 bucket](https://www.terraform.io/docs/backends/types/s3.html). Please see the Terraform documentation for further details.

## Features

Setting the environment variable `GOLDSTACK_LOG_EMAILS=true` will log out all emails that are sent when in local development mode. This can be useful when testing an API server locally or when debugging unit tests.

## Troubleshooting

### TXT record already exists

\[Video: Video Walkthrough]\(https://www.youtube.com/embed/TQlIQkM1wms)

When running `yarn infra up [deployment]` you may receive an error such as the following:

```bash
Error: [ERR]: Error building changeset: InvalidChangeBatch: [Tried to create resource record set [name='yourdomain.com.', type='TXT'] but it already exists]
        status code: 400, request id: xxxx

  on main.tf line 45, in resource "aws_route53_record" "spf_domain":
  45: resource "aws_route53_record" "spf_domain" {
```

This error is reported when a TXT record for your specified domain already exists. Often other services such as G Suite set TXT records that conflict with the TXT record that the Email Send module wants to create.

#### Workaround

The easiest way to circumvent this issue is to do the following:

*   Copy the existing TXT record in the Route 53 console and add it to the definition for the TXT record in `infra/aws/main.tf`. Make sure that the record is for the correct record name. For instance, if you want to configure email sending for `yourdomain.com`, the record name would be exactly `yourdomain.com`. The following example shows how we would add a `google-site-verification` declaration.

```bash
resource "aws_route53_record" "spf_mail_from" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = aws_ses_domain_mail_from.main.mail_from_domain
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com -all", "google-site-verification=xxx"]
}
```

*   Delete the TXT record in the [Route 53 Console](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-deleting.html). Ensure that you have copied the record successfully before deleting it.
*   Now run `yarn infra up prod`

## Security Hardening

This module is already developed following best security practices, including various means to ensure good email deliverability by configuring SPF and DKIM. Further improvements to the security for the email module can generally be made by explicitly granting rights to other components of the system that use this module, such as Lambdas. For further details on how to configure access for sending emails via SES, please see [Controlling access to Amazon SES](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/control-user-access.html) in the AWS SES documentation.
