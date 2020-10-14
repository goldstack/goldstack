---
id: security-hardening
title: Security Hardening
---

Goldstack modules are designed to provide a good trade-off between usability and security. Therefore, not every configuration is provided with the most secure defaults. If you have heightened security requirements, please use this documentation and documentation provided for the modules you use to configure things more securely.

### AWS

The biggest trade-off in made in all AWS modules is that there are no restrictive policies and permissions configured. Instead many resources are simply given admin rights to all components of the system. This is similar to how resources would work in vanilla kubernetes and works well for small applications and for initial greenfield development. We also recommend that within larger organisations, Goldstack projects should whenever possible be deployed to dedicated AWS accounts (for further reading see [AWS Organisations](https://aws.amazon.com/organizations/)).

However for workloads that are more security sensitive we recommend to set more restrictive policies. This must be done on a per-module basis. Please see the module documentation for specific instructions.
