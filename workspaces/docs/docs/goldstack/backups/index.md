---
id: backups
title: Backups
---

For production workloads, we recommend configuring automated backups for all S3 buckets and DynamoDB tables using AWS Backup. This guide describes how to set up centralized, cross-account, cross-region backups across your AWS Organization.

### Overview

This setup uses:
- AWS Organizations (policy-based management)
- AWS Backup (centralized backup service)
- A dedicated backup account for isolation
- Cross-region copy for disaster recovery

This approach avoids per-account configuration and ensures consistent backup policies across all accounts.

### Architecture

- **Management Account**: Defines and attaches backup policies
- **Member Accounts**: Contain S3 buckets and DynamoDB tables
- **Backup Account**: Stores all backups in a centralized vault
- **Target Region**: Secondary region for disaster recovery copies

Backups flow:
1. Resources in member accounts are backed up locally
2. Copies are automatically sent to the backup account and secondary region

### Prerequisites

- AWS Organization with all accounts attached
- Access to management account and backup account
- AWS Backup enabled in all relevant regions
- S3 versioning enabled (recommended)

### Step 1: Enable AWS Backup for the Organization

In the **Management Account**:

1. Open the [AWS Organizations Console](https://console.aws.amazon.com/organizations/)
2. Go to **Services**
3. Find **Resource Explorer** and click **Setup Integration** or **Configure Resource Explorer** for your organization
4. Return to **Services** and find **AWS Backup**
5. Click **Enable Trusted Access** to grant AWS Backup access to your organization

For detailed instructions, see [Managing cross-account backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/manage-cross-account.html).

This enables centralized policy management and cross-account backup and copy operations across your organization.

### Step 2: Create a Dedicated Backup Account

If not already present:

1. Create a new AWS account (e.g. `backup-prod`)
2. Add it to the Organization
3. Place it in a restricted OU (recommended)

Purpose:
- Isolate backups from production accounts
- Protect against accidental deletion or compromise

### Step 3: Configure Backup Vault in Backup Account

In the **Backup Account**:

1. Open **AWS Backup Console**
2. Go to: **Backup vaults → Create vault**
3. Set a name (e.g. `central-backup-vault`)
4. Configure encryption using a KMS key (recommended: customer-managed)

Configure a **Vault Access Policy** to allow your Organization to copy backups into this vault:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "backup:CopyIntoBackupVault",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalOrgID": "o-xxxxxxxxxx"
        }
      }
    }
  ]
}
```

Replace `o-xxxxxxxxxx` with your Organization ID.

### Step 4: Enable Vault Lock

In the backup account:

1. Select the vault → **Edit vault lock**
2. Enable Governance or Compliance mode
3. Set minimum and maximum retention periods

Vault Lock prevents deletion of backups and provides ransomware protection.

### Step 5: Create Backup Policy in Organizations

In the **Management Account**:

1. Open **AWS Organizations Console**
2. Go to: **Policies → Backup policies**
3. Click: **Create policy**

Example policy:

```json
{
  "plans": {
    "centralized-backup-plan": {
      "regions": {
        "@@assign": ["us-east-1"]
      },
      "rules": {
        "daily-backup": {
          "schedule_expression": {
            "@@assign": "cron(0 5 * * ? *)"
          },
          "start_backup_window_minutes": {
            "@@assign": "60"
          },
          "complete_backup_window_minutes": {
            "@@assign": "180"
          },
          "lifecycle": {
            "delete_after_days": {
              "@@assign": "30"
            }
          },
          "copy_actions": {
            "copy-to-backup-account": {
              "destination_backup_vault_arn": {
                "@@assign": "arn:aws:backup:us-east-1:BACKUP_ACCOUNT_ID:vault:central-backup-vault"
              },
              "lifecycle": {
                "delete_after_days": {
                  "@@assign": "30"
                }
              }
            },
            "cross-region-copy": {
              "destination_backup_vault_arn": {
                "@@assign": "arn:aws:backup:us-west-2:BACKUP_ACCOUNT_ID:vault:central-backup-vault"
              },
              "lifecycle": {
                "delete_after_days": {
                  "@@assign": "30"
                }
              }
            }
          }
        }
      },
      "selections": {
        "all-resources": {
          "resources": {
            "@@assign": [
              "arn:aws:s3:::*",
              "arn:aws:dynamodb:*:*:table/*"
            ]
          }
        }
      }
    }
  }
}
```

For a retention schedule of **daily backups for 1 month** and **monthly backups for 1 year**, configure the lifecycle rules accordingly. The example above uses 30-day retention as a baseline. Replace `BACKUP_ACCOUNT_ID` and adjust regions as needed.

### Step 6: Attach Policy to Organization

1. In **Organizations → Policies**
2. Select your backup policy
3. Click **Attach**
4. Attach to the Root (all accounts) or specific OUs

This automatically applies backups to all accounts in scope. No per-account configuration is required.

### Step 7: Verify IAM Roles

AWS Backup creates service-linked roles automatically (e.g., `AWSServiceRoleForBackup`). Verify in member accounts that:
- The role exists
- It trusts `backup.amazonaws.com`

No manual role creation is usually required.

### Step 8: Enable S3 Backup Support

In each region:

1. Go to **AWS Backup Settings**
2. Ensure **S3** is enabled as a resource type

Also ensure S3 buckets have **versioning enabled** (strongly recommended).

### Step 9: Test the Setup

1. Pick a test account
2. Create an S3 bucket and a DynamoDB table
3. Wait for the scheduled backup or trigger manually
4. Verify:
   - Recovery point exists in source account
   - Copy appears in backup account vault
   - Cross-region copy exists

### Step 10: Monitoring and Alerts

Recommended:

- Enable **AWS Backup Audit Manager**
- Create CloudWatch alarms for failed backup jobs and copy jobs

### Notes and Caveats

- **S3 backups**: Not a replacement for versioning. Restore creates a new bucket or object set.
- **DynamoDB**: Fully supported and reliable.
- Cross-account copies incur data transfer costs.
- KMS keys must allow cross-account usage if used.

### Summary

This setup provides:
- Centralized control via Organizations
- Automated backups across all accounts
- Isolation via dedicated backup account
- Disaster recovery via cross-region copy

No per-account scripting or manual configuration is required after initial setup.
