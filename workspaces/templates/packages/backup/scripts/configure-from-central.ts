import { readDeploymentState } from '@goldstack/infra';
import { readPackageConfig, writePackageConfig } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';
import path from 'path';

interface BackupCentralDeploymentState {
  name: string;
  terraform?: {
    backup_vault_arn?: {
      value: string;
    };
    kms_key_arn?: {
      value: string;
    };
  };
}

interface BackupDeploymentConfiguration {
  schedule: string;
  retentionDays: number;
  centralBackupVaultArn?: string;
  destinationAccountId?: string;
  destinationKmsKeyArn?: string;
}

/**
 * Configures backup package with destination information from deployed backup-central package.
 *
 * This script should be run AFTER:
 * 1. backup-central is deployed
 *
 * It will:
 * 1. Find the backup-central package in the project
 * 2. Extract the KMS key ARN and backup vault ARN from its deployment state
 * 3. Update backup's goldstack.json with destinationKmsKeyArn and destinationAccountId
 *
 * Usage: yarn configure-from-central [deploymentName]
 */
const configureFromCentral = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const deploymentName = args[0] || 'prod';

  const backupConfig = readPackageConfig();
  const deployment = backupConfig.deployments.find((d) => d.name === deploymentName);

  if (!deployment) {
    throw new Error(`Deployment '${deploymentName}' not found in backup goldstack.json`);
  }

  const projectRoot = path.resolve(path.dirname(process.cwd()), '..', '..');
  const projectConfigPath = path.join(projectRoot, 'goldstack.json');

  let projectPackages: string[];
  try {
    const projectConfig = JSON.parse(read(projectConfigPath));
    projectPackages = projectConfig.packages || [];
  } catch (e) {
    throw new Error(`Failed to read project config at ${projectConfigPath}`);
  }

  const backupCentralPackage = projectPackages.find((pkg) => pkg.includes('backup-central'));

  if (!backupCentralPackage) {
    throw new Error('Could not find backup-central package in project');
  }

  const backupCentralPath = path.join(projectRoot, backupCentralPackage);
  let backupCentralConfig;
  try {
    backupCentralConfig = readPackageConfig(backupCentralPath);
  } catch (e) {
    throw new Error(`Failed to read backup-central package config at ${backupCentralPath}`);
  }

  const backupCentralDeployment = backupCentralConfig.deployments.find(
    (d: { name: string }) => d.name === deploymentName,
  );

  if (!backupCentralDeployment) {
    throw new Error(`Deployment '${deploymentName}' not found in backup-central goldstack.json`);
  }

  let deploymentState: BackupCentralDeploymentState;
  try {
    deploymentState = readDeploymentState(backupCentralPath, deploymentName, {
      createIfNotExist: false,
    }) as BackupCentralDeploymentState;
  } catch (e) {
    throw new Error(`Failed to read deployment state for backup-central. Has it been deployed?`);
  }

  if (
    !deploymentState.terraform?.kms_key_arn?.value ||
    !deploymentState.terraform?.backup_vault_arn?.value
  ) {
    throw new Error(
      'KMS key ARN or backup vault ARN not found in backup-central deployment state. Has it been deployed?',
    );
  }

  const destinationAccountIdMatch = deploymentState.terraform.backup_vault_arn.value.match(
    /arn:aws:backup:[^:]+:(\d+):/,
  );
  if (!destinationAccountIdMatch) {
    throw new Error(
      'Could not extract account ID from backup vault ARN: ' +
        deploymentState.terraform.backup_vault_arn.value,
    );
  }

  const destinationAccountId = destinationAccountIdMatch[1];
  const destinationKmsKeyArn = deploymentState.terraform.kms_key_arn.value;
  const centralBackupVaultArn = deploymentState.terraform.backup_vault_arn.value;

  const existingConfig = (deployment.configuration || {}) as BackupDeploymentConfiguration;

  deployment.configuration = {
    ...existingConfig,
    centralBackupVaultArn,
    destinationAccountId,
    destinationKmsKeyArn,
  };

  writePackageConfig(backupConfig);

  console.log('Updated backup goldstack.json:');
  console.log(`  centralBackupVaultArn: ${centralBackupVaultArn}`);
  console.log(`  destinationAccountId: ${destinationAccountId}`);
  console.log(`  destinationKmsKeyArn: ${destinationKmsKeyArn}`);
};

configureFromCentral().catch((e) => {
  console.error('Failed to configure from central:', e.message);
  process.exit(1);
});
