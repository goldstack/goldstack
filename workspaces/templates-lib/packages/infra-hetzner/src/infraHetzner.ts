import { getHetznerConfigPath, parseConfig, validateConfig } from '@goldstack/utils-config';
import { info } from '@goldstack/utils-log';
import { readPackageConfig } from '@goldstack/utils-package';
import { read, write } from '@goldstack/utils-sh';
import fs from 'fs';

import configSchema from './schemas/accountConfigSchema.json';

import deploymentConfigSchema from './schemas/deploymentConfigSchema.json';
import type { HetznerConfiguration, HetznerUser } from './types/HetznerConfiguration';
import type { HetznerDeployment } from './types/HetznerDeployment';

export type { HetznerUser, HetznerDeployment };

export interface ReadDeploymentFromPackageConfigOptions {
  deploymentName: string;
  path?: string;
  ignoreMissing?: boolean;
}

export const readDeploymentFromPackageConfig = (
  options: ReadDeploymentFromPackageConfigOptions,
): HetznerDeployment | null => {
  const { deploymentName, path, ignoreMissing } = options;
  const packageConfig = readPackageConfig(path);

  const deployment = packageConfig.deployments.find((d) => d.name === deploymentName);
  if (!deployment) {
    if (ignoreMissing) {
      return null;
    }
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
    throw new Error(`Hetzner configuration file does not exist: ${path}.`);
  }

  return parseConfig(read(path), configSchema, {
    errorMessage: `Cannot load Hetzner configuration from ${path}`,
  }) as HetznerConfiguration;
};

export const writeConfig = (config: HetznerConfiguration, path?: string): void => {
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
 * Obtains Hetzner token from config file or environment variables.
 */
export const getHetznerUser = async (
  userName: string,
  configPath?: string,
): Promise<HetznerUser> => {
  if (process.env.HCLOUD_TOKEN) {
    info(
      'Environment variable HCLOUD_TOKEN defined. This token will be used to access Hetzner API.',
    );
    return {
      name: 'local',
      config: {
        token: process.env.HCLOUD_TOKEN,
      },
    };
  }

  const config = readConfig(configPath);
  const user = config.users.find((u) => u.name === userName);
  if (!user) {
    throw new Error('Cannot find Hetzner user ' + userName);
  }
  return user;
};
