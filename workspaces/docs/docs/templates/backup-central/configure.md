To configure the backup-central template, specify the AWS account IDs and source role ARNs that are allowed to copy backups to this vault:

```json
{
  "configuration": {
    "backupVaultName": "vault-prod",
    "allowedAccountIds": [
      "111111111111"
    ],
    "sourceAccountIds": [
      "111111111111"
    ],
    "sourceRoleArns": [
      "arn:aws:iam::111111111111:role/GoldstackBackupRole"
    ]
  }
}
```

Each source account that should be able to copy backups to this vault must be listed in `allowedAccountIds` and `sourceAccountIds`. The specific IAM roles executing the backup copy must be listed in `sourceRoleArns`.
