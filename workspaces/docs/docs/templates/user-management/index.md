---
id: template-user-management
title: User Management
---

[!embed](./about.md)

## Features

[!embed](./features.md)

## Configure

[!embed](./configure.md)

## Getting Started

[!embed](./getting-started.md)

## Infrastructure

NOTE! Consider enabling `prevent_destroy` in `main.tf`. Bad things happen if user pools are destroyed!

For the same reason, the template by default uses `ignore_changes` to ignore any changes to the `schema` since existing attributes cannot
be changed. Thus it is probably best to make any modifications in the console, to get the appropriate warnings when performing operations. 

[!embed](./../shared/infrastructure.md)

## Security Hardening

[!embed](./security-hardening.md)

## FAQ

[!embed](./faq.md)
