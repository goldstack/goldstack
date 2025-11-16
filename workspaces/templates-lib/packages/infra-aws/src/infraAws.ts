import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import {
  getAwsConfigPath,
  getAwsTerraformConfigPath,
  parseConfig,
  validateConfig,
} from '@goldstack/utils-config';
import { readPackageConfig } from '@goldstack/utils-package';
import { read, write } from '@goldstack/utils-sh';
import fs from 'fs';
import configSchema from './schemas/accountConfigSchema.json';
import awsStateConfigSchema from './schemas/awsTerraformStateSchema.json';
import deploymentConfigSchema from './schemas/deploymentConfigSchema.json';
import type {
  AWSAccessKeyId,
  AWSAPIKeyUserConfig,
  AWSConfiguration,
  AWSEnvironmentVariableUserConfig,
  AWSProfileConfig,
  AWSRegion,
  AWSSecretAccessKey,
  AWSUser,
  Name,
} from './types/awsAccount';
import type { AWSTerraformState, RemoteState } from './types/awsTerraformState';

export type {
  AWSConfiguration,
  AWSUser,
  AWSRegion,
  AWSAccessKeyId,
  AWSSecretAccessKey,
  AWSProfileConfig as AWSLocalUserConfig,
  AWSAPIKeyUserConfig as AWSAPIKeyUser,
  AWSEnvironmentVariableUserConfig,
  AWSTerraformState,
  RemoteState,
};

import {
  getAWSUserFromContainerEnvironment,
  getAWSUserFromDefaultLocalProfile,
  getAWSUserFromEnvironmentVariables,
  getAWSUserFromGoldstackConfig,
} from './awsUserUtils';
import type { AWSDeployment } from './types/awsDeployment';

export { getAWSCredentials } from './awsAuthUtils';
export type {
  AWSDeployment,
  AWSDeploymentRegion,
  AWSUserName,
} from './types/awsDeployment';

// deactivate warning message while v3 upgrade in process
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';

export const readDeploymentFromPackageConfig = (
  deploymentName: string,
  path?: string,
): AWSDeployment => {
  const packageConfig = readPackageConfig(path);

  const deployment = packageConfig.deployments.find((d) => d.name === deploymentName);
  if (!deployment) {
    throw new Error('Cannot find deployment with name: ' + deploymentName);
  }

  validateConfig(deployment, deploymentConfigSchema, {
    errorMessage: `Invalid AWS deployment ${deploymentName}`,
  });
  return deployment as AWSDeployment;
};

export const assertTerraformConfig = (user: Name, path?: string): AWSTerraformState => {
  if (!path) {
    path = getAwsTerraformConfigPath('./../../');
  }

  let res: AWSTerraformState;
  if (fs.existsSync(path)) {
    res = parseConfig(read(path), awsStateConfigSchema, {
      errorMessage: `Cannot load AWS Terraform configuration from ${path}`,
    }) as AWSTerraformState;
  } else {
    res = {
      remoteState: [],
    };
  }

  if (!res.remoteState.find((el) => el.user === user)) {
    res.remoteState.push({
      user: user,
    });
  }

  return res;
};

export const writeTerraformConfig = (config: AWSTerraformState, path?: string): void => {
  if (!path) {
    path = getAwsTerraformConfigPath('./../../');
  }
  write(JSON.stringify(config, null, 2), path);
};

export const hasConfig = (path?: string): boolean => {
  if (!path) {
    path = getAwsConfigPath('./../../');
  }

  // otherwise check default config file location
  return fs.existsSync(path);
};

export const readConfig = (path?: string): AWSConfiguration => {
  if (!path) {
    path = getAwsConfigPath('./../../');
  }

  // otherwise check default config file location
  if (!fs.existsSync(path)) {
    throw new Error(`AWS configuration file does not exist: ${path}.`);
  }

  return parseConfig(read(path), configSchema, {
    errorMessage: `Cannot load AWS configuration from ${path}`,
  }) as AWSConfiguration;
};

export const writeConfig = (config: AWSConfiguration, path?: string): void => {
  if (!path) {
    path = getAwsConfigPath('./../../');
  }
  write(JSON.stringify(config, null, 2), path);
};

export const createDefaultConfig = (): AWSConfiguration => {
  return {
    users: [],
  };
};

/**
 * Resets the environment variables set after obtaining AWS user.
 */
export const resetAWSUser = (): void => {
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
};

/**
 * Obtains AWS user credentials from config file or environment variables.
 */
export const getAWSUser = async (
  userName: string,
  configPath?: string,
): Promise<AwsCredentialIdentityProvider> => {
  // Load from ECS environment if running in ECS
  if (process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
    return await getAWSUserFromContainerEnvironment();
  }

  // Load credentials from environment variables if available
  if (process.env.AWS_ACCESS_KEY_ID) {
    return await getAWSUserFromEnvironmentVariables();
  }

  // Try loading default local user if no config file provided
  if (!hasConfig(configPath)) {
    return await getAWSUserFromDefaultLocalProfile();
  }

  // Load users as configured in Goldstack configuration
  const config = readConfig(configPath);
  return await getAWSUserFromGoldstackConfig(config, userName);
};
