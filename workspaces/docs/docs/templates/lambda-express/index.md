---
id: template-lambda-express
title: Lambda Express
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

## Deployment

[!embed](./../shared/deployment.md)

## Guides and How To

### Adding environment variables

[!embed](./environment-variables.md)

## Troubleshooting and Frequently Asked Questions

[!embed](./faq.md)

## Security Hardening

By default the lambda uses the shared execution role module in `infra/aws/shared/lambda-execution-role` at the project root. This role grants broad access to AWS resources commonly used by Goldstack applications, including S3, DynamoDB, Cognito, SQS, SNS, SES, CloudWatch, Secrets Manager and Systems Manager. This makes it easy to get started, but for production applications you should restrict the policy in `infra/aws/shared/lambda-execution-role/main.tf` to only the resources this lambda needs, or attach a permissions boundary via the module's `permissions_boundary` input.
