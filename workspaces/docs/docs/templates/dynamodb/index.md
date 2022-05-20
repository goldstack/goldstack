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

## Security Hardening

No IAM configuration is included in the template. It assumes that all resources using the table will have global access rights to all resources. For larger systems, this should be reworked by adding policies and roles to the codebase.
