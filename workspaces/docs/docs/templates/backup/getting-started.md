[!embed](./../shared/getting-started-project.md)

[!embed](./../shared/getting-started-infrastructure.md)

### Cross-Account Backup

To enable cross-account backup, ensure:

1. Cross-account backup is enabled in your AWS Organizations management account (see [Backups](../../goldstack/backups/index.md))
2. Advanced DynamoDB backup is enabled in each region where you want to back up DynamoDB tables (Note if you created your account after Nov 2021, this is enabled by default).
3. The `centralBackupVaultArn` is configured with the ARN of your central backup vault
4. The central backup vault's access policy allows copying from your account (configured in the backup-central template)