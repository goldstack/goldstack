import fs from 'fs';
import {
  parseConfig,
  getAwsConfigPath,
  getAwsTerraformConfigPath,
  validateConfig,
} from '@goldstack/utils-config';
import { readPackageConfig } from '@goldstack/utils-package';
import { read, write } from '@goldstack/utils-sh';
import {
  AWSConfiguration,
  AWSUser,
  AWSProfileConfig,
  AWSAPIKeyUserConfig,
  AWSAccessKeyId,
  AWSSecretAccessKey,
  Name,
} from './types/awsAccount';
import configSchema from './schemas/accountConfigSchema.json';
import deploymentConfigSchema from './schemas/deploymentConfigSchema.json';
import awsStateConfigSchema from './schemas/awsTerraformStateSchema.json';
import AWS from 'aws-sdk';

import { AWSTerraformState, RemoteState } from './types/awsTerraformState';

import {
  AWSRegion,
  AWSEnvironmentVariableUserConfig,
} from './types/awsAccount';

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

import { AWSDeployment } from './types/awsDeployment';
import {
  getAWSUserFromContainerEnvironment,
  getAWSUserFromDefaultLocalProfile,
  getAWSUserFromEnvironmentVariables,
  getAWSUserFromGoldstackConfig,
} from './awsUserUtils';

export type {
  AWSDeployment,
  AWSDeploymentRegion,
  AWSUserName,
} from './types/awsDeployment';

// deactivate warning message while v3 upgrade in process
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';

export const readDeploymentFromPackageConfig = (
  deploymentName: string,
  path?: string
): AWSDeployment => {
  const packageConfig = readPackageConfig(path);

  const deployment = packageConfig.deployments.find(
    (d) => d.name === deploymentName
  );
  if (!deployment) {
    throw new Error('Cannot find deployment with name: ' + deploymentName);
  }

  validateConfig(deployment, deploymentConfigSchema, {
    errorMessage: `Invalid AWS deployment ${deploymentName}`,
  });
  return deployment as AWSDeployment;
};

export const assertTerraformConfig = (
  user: Name,
  path?: string
): AWSTerraformState => {
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

  if (!res.remoteState.find((el) => el.user == user)) {
    res.remoteState.push({
      user: user,
    });
  }

  return res;
};

export const writeTerraformConfig = (
  config: AWSTerraformState,
  path?: string
): void => {
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
 * Obtains AWS user credentials from config file or environment variables.
 */
export const getAWSUser = async (
  userName: string,
  configPath?: string
): Promise<AWS.Credentials> => {
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
