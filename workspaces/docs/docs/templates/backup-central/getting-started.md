[!embed](./../shared/getting-started-project.md)

[!embed](./../shared/getting-started-infrastructure.md)

### Configuring Source Accounts

After deploying the backup-central template, update the `allowedAccountIds` with all AWS account IDs that should be allowed to copy backups to this vault. Then, redeploy the template.

Source accounts should configure their backup template with the `centralBackupVaultArn` pointing to this vault's ARN (available in the deployment outputs).