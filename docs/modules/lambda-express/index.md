---
id: template-lambda-express
title: Lambda Express
---

[!embed](./about.md)

## Configure

[!embed](./configure.md)

## Getting Started

[!embed](./getting-started.md)

## Infrastructure

[!embed](./../shared/infrastructure.md)

## Deployment

[!embed](./../shared/deployment.md)

## Security Hardening

This module requires further security hardening when deployed in critical production applications. Specifically the lambda is given the role `arn:aws:iam::aws:policy/AdministratorAccess"` and this will grant the lambda access to all resources on the AWS account, including the ability to create and destroy infrastructure. It is therefore recommended to grant this lambda only rights to resources it needs access to, such as read and write permissions for an S3 bucket. This can be modified in `infra/aws/lambda.tf` in the resource `resource "aws_iam_role_policy_attachment" "lambda_admin_role_attach"`.  