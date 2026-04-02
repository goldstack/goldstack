# @goldstack/template-backup

Goldstack template for configuring AWS Backup for S3 buckets and DynamoDB tables.

## Usage

```bash
yarn goldstack new backup
cd backup
yarn goldstack deploy
```

## Configuration

```json
{
  "configuration": {
    "schedule": "cron(0 5 * * ? *)",
    "retentionDays": 30,
    "centralBackupVaultArn": "arn:aws:backup:us-east-1:123456789012:backup-vault:GoldstackCentral"
  }
}
```

### Options

- **schedule**: Cron expression for backup frequency (default: daily at 5 AM UTC)
- **retentionDays**: Days to retain backups (default: 30)
- **centralBackupVaultArn**: Optional ARN of central backup vault for cross-account copy

## Excluding Resources

Resources tagged with `goldstack:no_backup=true` will be excluded from backups.