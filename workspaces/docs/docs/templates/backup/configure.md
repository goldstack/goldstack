To configure the backup template, specify the following settings in your `goldstack.json`:

- **schedule**: Cron expression for backup frequency (e.g., `cron(0 5 * * ? *)` for daily at 5 AM UTC)
- **retentionDays**: Number of days to retain backups (default: 30)
- **centralBackupVaultArn**: Optional ARN of a central backup vault for cross-account copy (e.g., `arn:aws:backup:us-east-1:222222222222:backup-vault:vault-prod`)
- **destinationAccountId**: Optional AWS account ID of the destination backup vault for cross-account copy
- **destinationKmsKeyArn**: Optional ARN of the KMS key in the destination account for encrypting copied backups

Example configuration:

```json
{
  "configuration": {
    "schedule": "cron(0 5 * * ? *)",
    "retentionDays": 30,
    "centralBackupVaultArn": "arn:aws:backup:us-east-1:222222222222:backup-vault:vault-prod",
    "destinationAccountId": "222222222222",
    "destinationKmsKeyArn": "arn:aws:kms:us-east-1:222222222222:key/d3a49659-80ee-4e72-8cbd-11e9b82c07ad"
  }
}
```

### Excluding Resources

To exclude specific S3 buckets or DynamoDB tables from backups, add the tag `goldstack:no_backup=true` to the resource.
