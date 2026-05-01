import { assertDocker, hasDocker, imageTerraform } from '@goldstack/utils-docker';
import { fatal, warn } from '@goldstack/utils-log';
import { commandExists, exec, pwd } from '@goldstack/utils-sh';
import path from 'path';
import type { CloudProvider } from './cloudProvider';
import type { TerraformVersion } from './types/utilsTerraformConfig';
import { writeBackendConfig } from './writeBackendConfig';
import { writeCredentials } from './writeCredentials';
import { writeVarsFile } from './writeVarsFile';

export type Variables = [string, string][];

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

const execWithDocker = (cmd: string, options: TerraformOptions): string => {
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

  let workspaceEnvVariable = '';
  if (options.workspace) {
    if (terraformEnvVars.TF_WORKSPACE) {
      warn(
        `TF_WORKSPACE environment variable is set to '${terraformEnvVars.TF_WORKSPACE}' but will be overridden by workspace option '${options.workspace}'. Please unset TF_WORKSPACE or remove the workspace option to avoid confusion.`,
      );
    }
    workspaceEnvVariable =
      '-e ' +
      'TF_WORKSPACE="' +
      options.workspace
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\$/g, '\\$')
        .replace(/`/g, '\\`') +
      '"';
  }

  const terraformEnvFlags = Object.entries(terraformEnvVars)
    .map(
      ([key, value]) =>
        '-e ' +
        key +
        '="' +
        value
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\$/g, '\\$')
          .replace(/`/g, '\\`') +
        '"',
    )
    .join(' ');

  const [command, ...rest] = cmd.split(' ');

  const cmd3 =
    `docker run --rm -v "${options.dir}":/app ` +
    ` ${terraformEnvFlags} ` +
    ` ${workspaceEnvVariable} ` +
    ` -w /app ${imageTerraform(options.version)} ${command} ${rest.join(' ')}`;

  return exec(cmd3, { silent: options.silent });
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

const execWithCli = (cmd: string, options: TerraformOptions): string => {
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

  const [command, ...rest] = cmd.split(' ');

  // Change to specified directory, execute command, then change back
  const currentDir = pwd();
  const execCmd =
    `cd "${options.dir}" && terraform ` +
    ` ${command} ` +
    ` ${options.options?.join(' ') || ''} ` +
    ` ${rest.join(' ')} ` +
    ` && cd "${currentDir}"`;

  return exec(execCmd, { silent: options.silent });
};

export const tf = (cmd: string, options: TerraformOptions): string => {
  if (hasLocalTerraform()) {
    return execWithCli(cmd, options);
  }

  if (hasDocker()) {
    return execWithDocker(cmd, options);
  }

  throw new Error('Neither Terraform nor Docker installed. Please install one of them');
};
