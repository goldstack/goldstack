import type { DeploymentConfiguration } from '@goldstack/infra';

export type { DeploymentConfiguration };

/**
 * List of AWS account IDs allowed to copy backups to this central vault.
 *
 * @title Allowed Account IDs
 */
export type AllowedAccountIds = string[];

/**
 * List of AWS account IDs that are sources for cross-account backup copies.
 *
 * @title Source Account IDs
 */
export type SourceAccountIds = string[];

/**
 * List of IAM role ARNs from source accounts allowed to copy backups to this vault.
 *
 * @title Source Role ARNs
 */
export type SourceRoleArns = string[];

export interface ThisDeploymentConfiguration extends DeploymentConfiguration {
  allowedAccountIds: AllowedAccountIds;
  sourceAccountIds?: SourceAccountIds;
  sourceRoleArns?: SourceRoleArns;
}

export type { ThisDeploymentConfiguration as BackupCentralDeploymentConfiguration };
