import fs from 'fs';
import assert from 'assert';
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
  AWSRegion,
  AWSProfileConfig,
  AWSAPIKeyUserConfig,
  AWSAccessKeyId,
  AWSSecretAccessKey,
  AWSEnvironmentVariableUserConfig,
  Name,
} from './types/awsAccount';
import configSchema from './schemas/accountConfigSchema.json';
import deploymentConfigSchema from './schemas/deploymentConfigSchema.json';
import awsStateConfigSchema from './schemas/awsTerraformStateSchema.json';
import AWS from 'aws-sdk';

import { AWSTerraformState, RemoteState } from './types/awsTerraformState';
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

export type {
  AWSDeployment,
  AWSDeploymentRegion,
  AWSUserName,
} from './types/awsDeployment';

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
 **/
export const getAWSUser = async (
  userName: string,
  configPath?: string
): Promise<AWS.Credentials> => {
  // check if running in ECS
  if (process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
    const ecsCredentials = new AWS.ECSCredentials({
      httpOptions: { timeout: 5000 }, // 5 second timeout
      maxRetries: 10, // retry 10 times
    });
    await ecsCredentials.getPromise();

    AWS.config.credentials = ecsCredentials;

    if (!process.env.AWS_REGION) {
      throw new Error(
        'AWS region environment variable ("AWS_REGION") not defined for ECS task.'
      );
    }

    AWS.config.update({ region: process.env.AWS_REGION });

    return ecsCredentials;
  }

  // always prefer getting credentials from environment variables
  if (process.env.AWS_ACCESS_KEY_ID) {
    assert(process.env.AWS_ACCESS_KEY_ID, 'AWS_ACCESS_KEY_ID not defined.');
    assert(
      process.env.AWS_SECRET_ACCESS_KEY,
      'AWS_SECRET_ACCESS_KEY not defined'
    );
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
    assert(region, 'Neither AWS_REGION nor AWS_DEFAULT_REGION are defined.');
    const credentials = new AWS.EnvironmentCredentials('AWS');
    await credentials.getPromise();
    AWS.config.credentials = credentials;

    AWS.config.update({ region });

    return credentials;
  }

  // try loading default user if no config file provided
  if (!hasConfig(configPath)) {
    const credentials = new AWS.SharedIniFileCredentials();
    if (!credentials.accessKeyId) {
      throw new Error(
        'Cannot load user from AWS configuration. Please provide a Goldstack AWS Configuration in infra/aws/config.json or perform aws login for a default profile using the AWS CLI.'
      );
    }
    AWS.config.credentials = credentials;
    // see https://github.com/aws/aws-sdk-js/pull/1391
    process.env.AWS_SDK_LOAD_CONFIG = 'true';
    return credentials;
  }

  const config = readConfig(configPath);

  const user = config.users.find((user) => user.name === userName);
  if (!user) {
    throw new Error(`User '${userName}' does not exist in AWS configuration.`);
  }

  if (user.type === 'profile') {
    const userConfig = user.config as AWSProfileConfig;

    if (process.env.AWS_SHARED_CREDENTIALS_FILE) {
      console.warn(
        'Using AWS_SHARED_CREDENTIALS_FILE environment variable. awsConfigFileName in configuration will be ignored.'
      );
    }

    let credentials: AWS.Credentials;
    if (!userConfig.processCredentials) {
      credentials = new AWS.SharedIniFileCredentials({
        profile: userConfig.profile,
        filename:
          process.env.AWS_SHARED_CREDENTIALS_FILE ||
          userConfig.awsConfigFileName,
      });
    } else {
      credentials = new AWS.ProcessCredentials({
        profile: userConfig.profile,
        filename:
          process.env.AWS_SHARED_CREDENTIALS_FILE ||
          userConfig.awsConfigFileName,
      });
      await credentials.refreshPromise();
    }

    if (!credentials.accessKeyId) {
      throw new Error(
        'Cannot load profile ' +
          userConfig.profile +
          ' from AWS configuration for user ' +
          user.name +
          '. Please perform `aws login` for the profile using the AWS CLI.'
      );
    }
    AWS.config.credentials = credentials;
    AWS.config.update({ region: userConfig.awsDefaultRegion });
    return credentials;
  }

  if (user.type === 'apiKey') {
    const config = user.config as AWSAPIKeyUserConfig;
    if (!config.awsAccessKeyId || !config.awsSecretAccessKey) {
      throw new Error(
        `AWS Access credentials not defined for user ${userName}. Define them in infra/aws/config.json.`
      );
    }
    const credentials = new AWS.Credentials({
      accessKeyId: config.awsAccessKeyId || '',
      secretAccessKey: config.awsSecretAccessKey || '',
    });
    AWS.config.credentials = credentials;
    AWS.config.update({ region: config.awsDefaultRegion });
    return credentials;
  }

  if (user.type === 'environmentVariables') {
    const userConfig = user.config as AWSEnvironmentVariableUserConfig;

    const awsAccessKeyId = process.env[userConfig.awsAccessKeyIdVariableName];
    if (!awsAccessKeyId) {
      throw new Error(
        `Environment variable expected but not found: ${userConfig.awsAccessKeyIdVariableName}`
      );
    }

    const awsSecretAccessKey =
      process.env[userConfig.awsSecretAccessKeyVariableName];
    if (!awsSecretAccessKey) {
      throw new Error(
        `Environment variable expected but not found: ${userConfig.awsSecretAccessKeyVariableName}`
      );
    }

    const awsDefaultRegion = process.env[
      userConfig.awsDefaultRegionVariableName
    ] as AWSRegion;
    if (!awsDefaultRegion) {
      throw new Error(
        `Environment variable expected but not found: ${userConfig.awsDefaultRegionVariableName}`
      );
    }

    const credentials = new AWS.Credentials({
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    });
    AWS.config.credentials = credentials;
    AWS.config.update({ region: awsDefaultRegion });
    return credentials;
  }

  throw new Error(`Unknown user config type ${user.type}`);
};
