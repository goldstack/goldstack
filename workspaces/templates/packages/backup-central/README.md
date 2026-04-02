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