import { readDeploymentState } from '@goldstack/infra';
import { readPackageConfig, writePackageConfig } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';
import path from 'path';

interface BackupDeploymentState {
  name: string;
  terraform?: {
    backup_role_arn?: {
      value: string;
    };
    backup_vault_arn?: {
      value: string;
    };
  };
}

interface BackupCentralDeploymentConfiguration {
  allowedAccountIds: string[];
  sourceAccountIds?: string[];
  sourceRoleArns?: string[];
}

/**
 * Finds the project root by searching upward for goldstack.json
 */
const findProjectRoot = (startDir: string): string | null => {
  let currentDir = startDir;
  const maxIterations = 10;
  for (let i = 0; i < maxIterations; i++) {
    const configPath = path.join(currentDir, 'goldstack.json');
    if (require('fs').existsSync(configPath)) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  return null;
};

/**
 * Configures backup-central package with source account information from deployed backup packages.
 *
 * This script should be run AFTER:
 * 1. backup-central is deployed
 * 2. backup packages are deployed
 *
 * It will:
 * 1. Find all backup packages in the project
 * 2. Extract their account IDs and backup role ARNs
 * 3. Update backup-central's goldstack.json with sourceAccountIds and sourceRoleArns
 *
 * Usage: yarn configure-cross-account
 */
const configureCrossAccount = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const deploymentName = args[0] || 'prod';

  const backupCentralConfig = readPackageConfig();
  const deployment = backupCentralConfig.deployments.find((d) => d.name === deploymentName);

  if (!deployment) {
    throw new Error(`Deployment '${deploymentName}' not found in backup-central goldstack.json`);
  }

  const projectRoot = findProjectRoot(process.cwd());
  if (!projectRoot) {
    throw new Error(
      'Could not find project root. Ensure you are running this script from within a Goldstack project.',
    );
  }
  const projectConfigPath = path.join(projectRoot, 'goldstack.json');

  let projectPackages: string[];
  try {
    const projectConfig = JSON.parse(read(projectConfigPath));
    projectPackages = projectConfig.packages || [];
  } catch (e) {
    throw new Error(`Failed to read project config at ${projectConfigPath}`);
  }

  const backupPackages = projectPackages.filter(
    (pkg) => pkg.includes('/packages/backup') && !pkg.includes('backup-central'),
  );

  const sourceAccountIds: string[] = [];
  const sourceRoleArns: string[] = [];

  for (const backupPackage of backupPackages) {
    const packagePath = path.join(projectRoot, backupPackage);
    let backupConfig;
    try {
      backupConfig = readPackageConfig(packagePath);
    } catch (e) {
      console.log(`Warning: Could not read package config for ${backupPackage}`);
      continue;
    }

    const backupDeployment = backupConfig.deployments.find(
      (d: { name: string }) => d.name === deploymentName,
    );

    if (!backupDeployment) {
      console.log(`Warning: Deployment '${deploymentName}' not found in ${backupPackage}`);
      continue;
    }

    try {
      const deploymentState = readDeploymentState(packagePath, deploymentName, {
        createIfNotExist: false,
      });

      if (deploymentState.terraform?.backup_vault_arn?.value) {
        const arn = deploymentState.terraform.backup_vault_arn.value;
        const accountIdMatch = arn.match(/arn:aws:backup:[^:]+:(\d+):/);
        if (accountIdMatch) {
          sourceAccountIds.push(accountIdMatch[1]);
        }
      }

      if (deploymentState.terraform?.backup_role_arn?.value) {
        sourceRoleArns.push(deploymentState.terraform.backup_role_arn.value);
      }
    } catch (e) {
      console.log(`Warning: Could not read deployment state for ${backupPackage}`);
    }
  }

  const existingConfig = (deployment.configuration || {}) as BackupCentralDeploymentConfiguration;

  deployment.configuration = {
    ...existingConfig,
    allowedAccountIds: [
      ...new Set([...(existingConfig.allowedAccountIds || []), ...sourceAccountIds]),
    ],
    sourceAccountIds: [...new Set(sourceAccountIds)],
    sourceRoleArns: [...new Set(sourceRoleArns)],
  };

  writePackageConfig(backupCentralConfig);

  console.log('Updated backup-central goldstack.json:');
  console.log(
    `  allowedAccountIds: ${JSON.stringify([...(existingConfig.allowedAccountIds || []), ...sourceAccountIds])}`,
  );
  console.log(`  sourceAccountIds: ${JSON.stringify(sourceAccountIds)}`);
  console.log(`  sourceRoleArns: ${JSON.stringify(sourceRoleArns)}`);
};

configureCrossAccount().catch((e) => {
  console.error('Failed to configure cross-account:', e.message);
  process.exit(1);
});
