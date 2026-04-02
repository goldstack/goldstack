import type { DeploymentConfiguration } from '@goldstack/infra';

export type { DeploymentConfiguration };

/**
 * List of AWS account IDs allowed to copy backups to this central vault.
 *
 * @title Allowed Account IDs
 */
export type AllowedAccountIds = string[];

export interface ThisDeploymentConfiguration extends DeploymentConfiguration {
  allowedAccountIds: AllowedAccountIds;
}

export type { ThisDeploymentConfiguration as BackupCentralDeploymentConfiguration };
