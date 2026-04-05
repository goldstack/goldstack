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

## Cleanup Vault

To delete all recovery points and stop running backup jobs, use:

```bash
yarn goldstack cleanup-vault --deployment <deployment-name>
```

Progress is shown as recovery points are deleted:

```
Found 10 recovery points, deleting them...
Deleted recovery point 1/10 (10%): arn:aws:backup:...
Deleted recovery point 2/10 (20%): arn:aws:backup:...
...
```