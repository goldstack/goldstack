[!embed](./../shared/getting-started-project.md)

[!embed](./../shared/getting-started-infrastructure.md)

### Cross-Account Backup

This template supports copying backups to a central AWS account. This requires deploying the `backup-central` template in the destination account.

For a complete step-by-step guide on establishing cross-account backups (including deploying the source vault, fetching the IAM role, configuring the central vault, and connecting them), please see the [Configuring Cross-Account Backups](../backup-central/getting-started.md#configuring-cross-account-backups) guide in the Backup Central template documentation.

Ensure that:
1. Cross-account backup is enabled in your AWS Organizations management account (see [Backups](../../goldstack/backups/index.md))
2. Advanced DynamoDB backup is enabled in each region where you want to back up DynamoDB tables (Note if you created your account after Nov 2021, this is enabled by default).

### Cleanup Vault

To delete all recovery points and stop running backup jobs for a deployment, use:

```bash
yarn goldstack cleanup-vault --deployment <deployment-name>
```

When running the cleanup, you will see progress as recovery points are deleted:

```
Found 10 recovery points, deleting them...
Deleted recovery point 1/10 (10%): arn:aws:backup:...
Deleted recovery point 2/10 (20%): arn:aws:backup:...
...
```

After cleanup completes, you can run `yarn infra destroy` to delete the remaining infrastructure.
