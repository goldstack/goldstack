---
id: template-dynamodb
title: DynamoDB
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

## Reliability Hardening

It is highly recommended you enable Point-in-time recovery (PITR) for your DynamoDB databases and consider additional backup needs.

Point-in-time recovery (PITR) can easily be enabled through the AWS console: [Enable point-in-time recovery in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/PointInTimeRecovery_Howitworks.html#howitworks-enable-pitr-console).

## Frequently Asked Questions

### How to define a table with only a partition key

The DynamoDB template is based on the assumption that your table will contain a partition key and a sort key. Thus, there is no way to define a table without a sort key. If you do not require a sort key, simply create one with a dummy value (e.g. set the sort key always to the entity name or an empty string).

## Security Hardening

No IAM configuration is included in the template. It assumes that all resources using the table will have global access rights to all resources. For larger systems, this should be reworked by adding policies and roles to the codebase.
