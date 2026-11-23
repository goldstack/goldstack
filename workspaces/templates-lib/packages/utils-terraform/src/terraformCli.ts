import { assertDocker, hasDocker, imageTerraform } from '@goldstack/utils-docker';
import { fatal, warn } from '@goldstack/utils-log';
import { commandExists, exec, execSafe, pwd } from '@goldstack/utils-sh';
import fs from 'fs';
import os from 'os';
import path from 'path';
import type { CloudProvider } from './cloudProvider';
import type { TerraformVersion } from './types/utilsTerraformConfig';
import { writeBackendConfig } from './writeBackendConfig';
import { writeCredentials } from './writeCredentials';
import { writeVarsFile } from './writeVarsFile';

export type Variables = [string, string][];

/**
 * Path of the provider plugin cache used when `TF_PLUGIN_CACHE_DIR` is not configured. A shared
 * cache prevents Terraform from downloading the same providers again for every module and run.
 */
export const defaultPluginCacheDir = path.join(os.homedir(), '.terraform.d', 'plugin-cache');

/**
 * Creates the default provider plugin cache directory if it does not exist yet and returns its path.
 *
 * Returns `undefined` if the directory cannot be created or written to, in which case Terraform
 * falls back to downloading providers for each module.
 */
export const ensureDefaultPluginCacheDir = (): string | undefined => {
  try {
    fs.mkdirSync(defaultPluginCacheDir, { recursive: true });
    fs.accessSync(defaultPluginCacheDir, fs.constants.W_OK);
    return defaultPluginCacheDir;
  } catch (e) {
    warn(
      `Cannot use Terraform provider plugin cache directory '${defaultPluginCacheDir}' (${e}). Providers will be downloaded for every module.`,
    );
    return undefined;
  }
};

export const getTerraformEnvVars = (): Record<string, string> => {
  const terraformEnvVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value === undefined) continue;

    if (key.startsWith('TF_') || key === 'TERRAFORM_CONFIG') {
      terraformEnvVars[key] = value;
    }
  }
  return terraformEnvVars;
};

export type { TerraformOptions };

interface TerraformOptions {
  dir?: string;
  provider: CloudProvider;
  variables?: Variables;
  backendConfig?: Variables;
  version: TerraformVersion;
  options?: string[];
  silent?: boolean;
  workspace?: string;
}

const normalizeArgs = (cmd: string | string[]): string[] => {
  return Array.isArray(cmd) ? cmd : cmd.split(/\s+/).filter((arg) => arg !== '');
};

const execWithDocker = (cmd: string | string[], options: TerraformOptions): string => {
  if (!options.dir) {
    options.dir = pwd();
  }

  assertDocker();

  // Write variables to tfvars file
  if (options.variables) {
    writeVarsFile(options.variables, path.join(options.dir, 'terraform.tfvars'));
  }

  // Write backend config to backend.tf
  if (options.backendConfig) {
    writeBackendConfig(options.backendConfig, options.dir);
  }

  // Write AWS credentials file
  writeCredentials(options.provider.generateEnvVariableString(), options.dir);

  const terraformEnvVars = getTerraformEnvVars();

  const dockerArgs = ['run', '--rm', '-v', `${options.dir}:/app`];
  if (terraformEnvVars.TF_PLUGIN_CACHE_DIR === undefined) {
    const pluginCacheDir = ensureDefaultPluginCacheDir();
    if (pluginCacheDir) {
      const containerPluginCacheDir = '/root/.terraform.d/plugin-cache';
      dockerArgs.push('-v', `${pluginCacheDir}:${containerPluginCacheDir}`);
      dockerArgs.push('-e', `TF_PLUGIN_CACHE_DIR=${containerPluginCacheDir}`);
    }
  }
  for (const [key, value] of Object.entries(terraformEnvVars)) {
    dockerArgs.push('-e', `${key}=${value}`);
  }
  if (options.workspace) {
    if (terraformEnvVars.TF_WORKSPACE) {
      warn(
        `TF_WORKSPACE environment variable is set to '${terraformEnvVars.TF_WORKSPACE}' but will be overridden by workspace option '${options.workspace}'. Please unset TF_WORKSPACE or remove the workspace option to avoid confusion.`,
      );
    }
    dockerArgs.push('-e', `TF_WORKSPACE=${options.workspace}`);
  }
  dockerArgs.push('-w', '/app', imageTerraform(options.version), ...normalizeArgs(cmd));

  return execSafe('docker', dockerArgs, { silent: options.silent });
};

export const assertTerraform = (): void => {
  if (!commandExists('terraform')) {
    fatal('Terraform is not installed.\n\n' + 'Install terraform CLI or Docker (preferred).');
    throw new Error();
  }
};

export const hasLocalTerraform = (): boolean => {
  return commandExists('terraform');
};

const execWithCli = (cmd: string | string[], options: TerraformOptions): string => {
  if (!options.dir) {
    options.dir = pwd();
  }

  assertTerraform();
  const version = exec('terraform version', { silent: true });
  if (version.indexOf(options.version) === -1) {
    warn(
      `Local Terraform version [${
        version.split('\n')[0]
      }], does not match version defined in package configuration [${
        options.version
      }] (goldstack.json and/or infra/tfConfig.json). Consider installing the configured version locally or uninstall Terraform and install Docker. Then, Goldstack will run the correct Terraform version required for this deployment using Docker.`,
    );
  }

  // Write variables to tfvars file
  if (options.variables) {
    writeVarsFile(options.variables, path.join(options.dir, 'terraform.tfvars'));
  }

  // Write backend config to backend.tf
  if (options.backendConfig) {
    writeBackendConfig(options.backendConfig, options.dir);
  }

  // Write AWS credentials file
  writeCredentials(options.provider.generateEnvVariableString(), options.dir);

  const terraformEnvVars = getTerraformEnvVars();

  if (terraformEnvVars.TF_PLUGIN_CACHE_DIR === undefined) {
    const pluginCacheDir = ensureDefaultPluginCacheDir();
    if (pluginCacheDir) {
      process.env.TF_PLUGIN_CACHE_DIR = pluginCacheDir;
    }
  }

  const GOLDSTACK_AWS_VARS = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SESSION_TOKEN',
    'AWS_SECURITY_TOKEN',
    'AWS_REGION',
    'AWS_DEFAULT_REGION',
  ];

  // Set environment variables from provider
  const envVars = options.provider
    .generateEnvVariableString()
    .split(' -e ')
    .filter((v) => v)
    .map((v) => v.trim().replace(/^-e\s+/, ''));

  for (const envVar of envVars) {
    const [key, ...valueParts] = envVar.split('=');
    const value = valueParts.join('=');
    if (key) {
      const isGoldstackVar = GOLDSTACK_AWS_VARS.includes(key);
      const newValueTrimmed = value.replace(/^["']|["']$/g, '');
      const isSameValue = process.env[key] === newValueTrimmed;

      if (key in terraformEnvVars) {
        const changeNote = isSameValue ? '' : ' (provider config value is different)';
        warn(
          `Environment variable '${key}' is a Terraform environment variable, taking precedence over provider config${changeNote}.`,
        );
        continue;
      }
      if (key in process.env) {
        if (isGoldstackVar && isSameValue) {
          continue;
        }
        const changeNote = isSameValue ? '' : ' (old value was different)';
        warn(
          `Environment variable '${key}' is already set, overwriting with value from provider config${changeNote}.`,
        );
      }
      process.env[key] = newValueTrimmed;
    }
  }

  if (options.workspace) {
    if (terraformEnvVars.TF_WORKSPACE) {
      warn(
        `TF_WORKSPACE environment variable is set to '${terraformEnvVars.TF_WORKSPACE}' but will be overridden by workspace option '${options.workspace}'. Please unset TF_WORKSPACE or remove the workspace option to avoid confusion.`,
      );
    }
    process.env.TF_WORKSPACE = options.workspace;
  } else {
    delete process.env.TF_WORKSPACE;
  }

  const [command, ...rest] = normalizeArgs(cmd);

  return execSafe('terraform', [command, ...(options.options ?? []), ...rest], {
    silent: options.silent,
    cwd: options.dir,
  });
};

export const tf = (cmd: string | string[], options: TerraformOptions): string => {
  if (hasLocalTerraform()) {
    return execWithCli(cmd, options);
  }

  if (hasDocker()) {
    return execWithDocker(cmd, options);
  }

  throw new Error('Neither Terraform nor Docker installed. Please install one of them');
};
