import type { DeploymentConfiguration } from '@goldstack/infra';

export type { DeploymentConfiguration };

/**
 * Cron expression for backup schedule (e.g., cron(0 5 * * ? *) for daily at 5 AM UTC).
 *
 * @title Backup Schedule
 */
export type BackupSchedule = string;

/**
 * Number of days to retain backups.
 *
 * @title Retention Days
 */
export type RetentionDays = number;

/**
 * Optional ARN of central backup vault for cross-account copy.
 *
 * @title Central Backup Vault ARN
 */
export type CentralBackupVaultArn = string;

export interface ThisDeploymentConfiguration extends DeploymentConfiguration {
  schedule: BackupSchedule;
  retentionDays: RetentionDays;
  centralBackupVaultArn?: CentralBackupVaultArn;
}

export type { ThisDeploymentConfiguration as BackupDeploymentConfiguration };
