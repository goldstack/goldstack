[!embed](./../shared/getting-started-project.md)

[!embed](./../shared/getting-started-infrastructure.md)

### Cross-Account Backup

To enable cross-account backup, ensure:

1. Cross-account backup is enabled in your AWS Organizations management account (see [Backups](../../goldstack/backups/index.md))
2. Advanced DynamoDB backup is enabled in each region where you want to back up DynamoDB tables (Note if you created your account after Nov 2021, this is enabled by default).
3. The `centralBackupVaultArn` is configured with the ARN of your central backup vault
4. The central backup vault's access policy allows copying from your account (configured in the backup-central template)

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