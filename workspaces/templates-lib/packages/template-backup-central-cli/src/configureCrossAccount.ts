import { readDeploymentState } from '@goldstack/infra';
import { info, warn } from '@goldstack/utils-log';
import { readPackageConfig, writePackageConfig } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';

interface BackupCentralDeploymentConfiguration {
  allowedAccountIds: string[];
  sourceAccountIds?: string[];
  sourceRoleArns?: string[];
}

const findProjectRoot = (startDir: string): string | null => {
  let currentDir = startDir;
  const maxIterations = 10;
  for (let i = 0; i < maxIterations; i++) {
    const configPath = path.join(currentDir, 'goldstack.json');
    if (fs.existsSync(configPath)) {
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

export interface ConfigureCrossAccountParams {
  deploymentName?: string;
  targetPackage?: string;
}

const matchesTarget = (packagePath: string, targetPattern: string): boolean => {
  const searchTarget = targetPattern.toLowerCase();
  const parts = packagePath.toLowerCase().split(path.sep);
  for (const part of parts) {
    if (part.includes(searchTarget)) {
      return true;
    }
    if (part === searchTarget) {
      return true;
    }
  }
  return false;
};

export const configureCrossAccount = async (
  params?: ConfigureCrossAccountParams,
): Promise<void> => {
  let deploymentName = params?.deploymentName;
  let targetPackage = params?.targetPackage;

  if (!deploymentName) {
    const argv = await yargs
      .option('target-package', {
        type: 'string',
        describe: 'Target backup package pattern to match (replaces auto-discovery)',
      })
      .positional('deployment', {
        type: 'string',
        describe: 'Name of the deployment',
      })
      .parse();

    deploymentName = (argv.deployment as string) || (argv._[0] as string) || 'prod';
    targetPackage = targetPackage || (argv['target-package'] as string | undefined);
  }

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
  } catch (_e) {
    throw new Error(`Failed to read project config at ${projectConfigPath}`);
  }

  const backupPackages: string[] = [];

  for (const pkg of projectPackages) {
    if (targetPackage && !matchesTarget(pkg, targetPackage)) {
      continue;
    }

    const packagePath = path.join(projectRoot, pkg);
    let packageGoldstackJson: string | undefined;

    try {
      const files = fs.readdirSync(packagePath);
      const goldstackFile = files.find((f) => f === 'goldstack.json');
      if (goldstackFile) {
        packageGoldstackJson = read(path.join(packagePath, goldstackFile));
      }
    } catch (_e) {
      warn(`Could not read package directory for ${pkg}`);
      continue;
    }

    if (!packageGoldstackJson) {
      continue;
    }

    try {
      const packageConfig = JSON.parse(packageGoldstackJson);
      if (packageConfig.template === 'backup') {
        if (!targetPackage && pkg.includes('backup-central')) {
          continue;
        }
        backupPackages.push(pkg);
      }
    } catch (_e) {
      warn(`Could not parse goldstack.json for ${pkg}`);
    }
  }

  if (backupPackages.length === 0) {
    if (targetPackage) {
      warn(`No packages found matching target pattern '${targetPackage}'`);
    } else {
      warn('No backup packages found in project');
    }
    return;
  }

  info(`Found ${backupPackages.length} backup package(s) to configure`);

  const sourceAccountIds: string[] = [];
  const sourceRoleArns: string[] = [];

  for (const backupPackage of backupPackages) {
    const packagePath = path.join(projectRoot, backupPackage);
    let backupConfig: ReturnType<typeof readPackageConfig> | undefined;
    try {
      backupConfig = readPackageConfig(packagePath);
    } catch (_e) {
      warn(`Could not read package config for ${backupPackage}`);
      continue;
    }

    if (!backupConfig) {
      continue;
    }

    const backupDeployment = backupConfig.deployments.find(
      (d: { name: string }) => d.name === deploymentName,
    );

    if (!backupDeployment) {
      warn(`Deployment '${deploymentName}' not found in ${backupPackage}`);
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
    } catch (_e) {
      warn(`Could not read deployment state for ${backupPackage}`);
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

  info(`Updated backup-central goldstack.json for deployment '${deploymentName}':`);
  info(`  allowedAccountIds: ${JSON.stringify(deployment.configuration.allowedAccountIds)}`);
  info(`  sourceAccountIds: ${JSON.stringify(deployment.configuration.sourceAccountIds)}`);
  info(`  sourceRoleArns: ${JSON.stringify(deployment.configuration.sourceRoleArns)}`);
};
