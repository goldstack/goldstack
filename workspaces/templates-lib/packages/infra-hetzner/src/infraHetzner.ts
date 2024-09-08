import fs from 'fs';
import {
  parseConfig,
  getHetznerConfigPath,
  validateConfig,
} from '@goldstack/utils-config';
import { read, write } from '@goldstack/utils-sh';

import { readPackageConfig } from '@goldstack/utils-package';

import configSchema from './schemas/accountConfigSchema.json';

import deploymentConfigSchema from './schemas/deploymentConfigSchema.json';

import { HetznerConfiguration } from './types/HetznerConfiguration';

import { HetznerUser } from './types/HetznerConfiguration';
import { HetznerDeployment } from './types/HetznerDeployment';

export type { HetznerUser, HetznerDeployment };

export const readDeploymentFromPackageConfig = (
  deploymentName: string,
  path?: string
): HetznerDeployment => {
  const packageConfig = readPackageConfig(path);

  const deployment = packageConfig.deployments.find(
    (d) => d.name === deploymentName
  );
  if (!deployment) {
    throw new Error('Cannot find deployment with name: ' + deploymentName);
  }

  validateConfig(deployment, deploymentConfigSchema, {
    errorMessage: `Invalid Hetzner deployment ${deploymentName}`,
  });
  return deployment as HetznerDeployment;
};

export const hasConfig = (path?: string): boolean => {
  if (!path) {
    path = getHetznerConfigPath('./../../');
  }

  // otherwise check default config file location
  return fs.existsSync(path);
};

export const readConfig = (path?: string): HetznerConfiguration => {
  if (!path) {
    path = getHetznerConfigPath('./../../');
  }

  // otherwise check default config file location
  if (!fs.existsSync(path)) {
    throw new Error(`AWS configuration file does not exist: ${path}.`);
  }

  return parseConfig(read(path), configSchema, {
    errorMessage: `Cannot load AWS configuration from ${path}`,
  }) as HetznerConfiguration;
};

export const writeConfig = (
  config: HetznerConfiguration,
  path?: string
): void => {
  if (!path) {
    path = getHetznerConfigPath('./../../');
  }
  write(JSON.stringify(config, null, 2), path);
};

export const createDefaultConfig = (): HetznerConfiguration => {
  return {
    users: [],
  };
};

/**
 * Obtains AWS user credentials from config file or environment variables.
 */
export const getHetznerUser = async (
  userName: string,
  configPath?: string
): Promise<HetznerUser> => {
  const config = readConfig(configPath);
  const user = config.users.find((u) => u.name == userName);
  if (!user) {
    throw new Error('Cannot find Hetzner user ' + userName);
  }
  return user;
};
