---
id: aws-organizations
title: AWS Organizations and Control Tower
---

For teams and organizations, we recommend deploying Goldstack projects to dedicated AWS accounts. This provides better security isolation between environments, simplifies billing, and enables more granular access control.

### Why Dedicated AWS Accounts

- **Security isolation**: Each environment (dev, staging, prod) has its own account, limiting the blast radius of any security incident
- **Simplified billing**: Track costs per environment easily
- **Cleaner resource management**: Avoid resource name collisions and simplify permission management
- **Compliance**: Meet regulatory requirements that mandate environment separation

### Setting Up with AWS Organizations and Control Tower

[AWS Control Tower](https://aws.amazon.com/controltower/) provides the easiest way to set up and govern a secure, multi-account AWS environment. It automates the creation of AWS accounts within an organization and applies pre-configured governance rules.

Key benefits:
- Set up a well-architected, multi-account environment in under 30 minutes
- Automate best practice governance with 750+ preconfigured controls
- Enable single sign-on (SSO) via AWS IAM Identity Center

### Enabling Single Sign-On

Once you have AWS Organizations set up, you can enable SSO through AWS IAM Identity Center. This allows your team to access multiple AWS accounts with a single set of credentials.

To get started:

1. Enable AWS Control Tower in your AWS account ([docs](https://docs.aws.amazon.com/controltower/latest/userguide/getting-started.html))
2. Configure AWS IAM Identity Center as your identity source
3. Add your team members and assign them to appropriate accounts and permission sets

For detailed instructions, see [AWS Control Tower documentation](https://docs.aws.amazon.com/controltower/latest/userguide/how-control-tower-works.html) and [Setting up IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/getting-started.html).

### Connecting to Goldstack

After setting up your multi-account environment, configure Goldstack users for each account. For each environment account, create a user in your Goldstack configuration:

```json
{
  "users": [
    {
      "name": "dev-user",
      "type": "profile",
      "config": {
        "profile": "dev-account",
        "awsDefaultRegion": "us-west-2"
      }
    },
    {
      "name": "prod-user",
      "type": "profile", 
      "config": {
        "profile": "prod-account",
        "awsDefaultRegion": "us-west-2"
      }
    }
  ]
}
```

Configure the corresponding profiles in your `~/.aws/config` file using IAM Identity Center credentials. For tools that help manage SSO credentials, see [Using process credentials](./aws-configuration.md#using-process-credentials).

### See Also

For automated backup of S3 buckets and DynamoDB tables across your organization, see [Backups](../backups.md).
