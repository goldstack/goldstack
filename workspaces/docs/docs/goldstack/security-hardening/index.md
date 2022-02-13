---
id: security-hardening
title: Security Hardening
---

Goldstack templates provide a balance between usability and security. If you have heightened security requirements, you can easily configure the templates for more security. Simply follow the documentation below or the documentation provided with your templates.

### AWS

The biggest trade-off made in all AWS templates is that there are no restrictive policies and permissions configured. Instead, many resources are simply given admin rights to all components of the system. This is similar to how resources would work in vanilla Kubernetes and works well for small applications and for initial greenfield development. We also recommend that within larger organisations, Goldstack projects should be deployed to dedicated AWS accounts (for further reading see [AWS Organisations](https://aws.amazon.com/organizations/)) whenever possible.

However, for workloads that are more security sensitive we recommend setting more restrictive policies. This must be done on a per-package basis. Please see the template documentation provided for the templates you have selected for specific instructions (links to relevant template documentation should have been sent to you via email).
