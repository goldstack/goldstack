# @goldstack/template-backup-central

Goldstack template for setting up a centralized AWS Backup vault.

## Usage

```bash
yarn goldstack new backup-central
cd backup-central
yarn goldstack deploy
```

## Configuration

Configure the accounts allowed to copy backups to this central vault:

```json
{
  "configuration": {
    "allowedAccountIds": ["123456789012", "987654321098"]
  }
}
```

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