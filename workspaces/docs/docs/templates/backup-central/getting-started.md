[!embed](./../shared/getting-started-project.md)

[!embed](./../shared/getting-started-infrastructure.md)

### Configuring Cross-Account Backups

Setting up cross-account backups requires coordinating the deployments between the source (`backup`) and destination (`backup-central`) templates. Follow these steps to establish the connection:

#### Phase 1: Deploy Source Backup (Without Central Config)

1. First, navigate to your source backup package (e.g., `packages/backup/`).
2. Ensure you have not yet configured `centralBackupVaultArn`, `destinationAccountId`, or `destinationKmsKeyArn` in your `goldstack.json`.
3. Deploy the source infrastructure using `yarn infra up <deployment-name>`.
4. Once deployed, retrieve the backup IAM role ARN by running:
   ```bash
   yarn infra terraform <deployment-name> output backup_role_arn
   ```
   *Note: This will return a value like `arn:aws:iam::111111111111:role/GoldstackBackupRole`.*

#### Phase 2: Deploy Central Backup Vault

1. Navigate to your central backup package (e.g., `packages/backup-central/`).
2. Configure `goldstack.json` to allow the source account and its role to copy to this vault. Update the `configuration` object:
   ```json
   {
     "configuration": {
       "backupVaultName": "vault-prod",
       "allowedAccountIds": ["111111111111"],
       "sourceAccountIds": ["111111111111"],
       "sourceRoleArns": ["arn:aws:iam::111111111111:role/GoldstackBackupRole"]
     }
   }
   ```
3. Deploy the central vault infrastructure using `yarn infra up <deployment-name>`.
4. Once deployed, retrieve the vault ARN and KMS key ARN by running:
   ```bash
   yarn infra terraform <deployment-name> output backup_vault_arn
   yarn infra terraform <deployment-name> output kms_key_arn
   ```

#### Phase 3: Connect Source to Central Vault

1. Return to your source backup package (`packages/backup/`).
2. Update the `configuration` object in `goldstack.json` with the details from the central vault (assuming your central account ID is `222222222222`):
   ```json
   {
     "configuration": {
       "schedule": "cron(30 11 * * ? *)",
       "retentionDays": 30,
       "centralBackupVaultArn": "arn:aws:backup:us-east-1:222222222222:backup-vault:vault-prod",
       "destinationAccountId": "222222222222",
       "destinationKmsKeyArn": "arn:aws:kms:us-east-1:222222222222:key/d3a49659-80ee-4e72-8cbd-11e9b82c07ad"
     }
   }
   ```
3. Run `yarn infra up <deployment-name>` one final time to update the backup plan with the copy action.

Your cross-account backup is now fully configured!
