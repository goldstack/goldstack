To configure the backup template, specify the following settings in your `goldstack.json`:

- **schedule**: Cron expression for backup frequency (e.g., `cron(0 5 * * ? *)` for daily at 5 AM UTC)
- **retentionDays**: Number of days to retain backups (default: 30)
- **centralBackupVaultArn**: Optional ARN of a central backup vault for cross-account copy (e.g., `arn:aws:backup:us-east-1:123456789012:backup-vault:GoldstackCentral`)

Example configuration:

```json
{
  "configuration": {
    "schedule": "cron(0 5 * * ? *)",
    "retentionDays": 30,
    "centralBackupVaultArn": "arn:aws:backup:us-east-1:123456789012:backup-vault:GoldstackCentral"
  }
}
```

### Excluding Resources

To exclude specific S3 buckets or DynamoDB tables from backups, add the tag `goldstack:no_backup=true` to the resource.