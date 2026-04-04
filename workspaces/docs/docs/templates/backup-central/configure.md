To configure the backup-central template, specify the AWS account IDs that are allowed to copy backups to this vault:

```json
{
  "configuration": {
    "allowedAccountIds": ["123456789012", "987654321098"]
  }
}
```

Each source account that should be able to copy backups to this vault must be listed in `allowedAccountIds`.