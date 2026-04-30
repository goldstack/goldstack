import { assertDocker, hasDocker, imageTerraform } from '@goldstack/utils-docker';
import { fatal, warn } from '@goldstack/utils-log';
import { commandExists, exec, pwd } from '@goldstack/utils-sh';
import child_process from 'child_process';
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

  const dockerEnvArgs: string[] = [];
  if (options.workspace) {
    if (terraformEnvVars.TF_WORKSPACE) {
      warn(
        `TF_WORKSPACE environment variable is set to '${terraformEnvVars.TF_WORKSPACE}' but will be overridden by workspace option '${options.workspace}'. Please unset TF_WORKSPACE or remove the workspace option to avoid confusion.`,
      );
    }
    if (typeof options.workspace === 'string') {
      dockerEnvArgs.push('-e', `TF_WORKSPACE=${options.workspace}`);
    }
  }

  for (const [key, value] of Object.entries(terraformEnvVars)) {
    dockerEnvArgs.push('-e', `${key}=${value}`);
  }

  const [command, ...rest] = cmd.split(' ');
  const dockerArgs: string[] = [
    'run',
    '--rm',
    '-v',
    `${options.dir}:/app`,
    ...dockerEnvArgs,
    '-w',
    '/app',
    imageTerraform(options.version),
    command,
    ...(options.options || []),
    ...rest,
  ];

  const result = child_process.spawnSync('docker', dockerArgs, {
    shell: false,
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    throw new Error(
      result.stderr || `Docker terraform command failed with exit code ${result.status}`,
    );
  }

  return result.stdout || '';
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

  // Set environment variables from provider
  const envVars = options.provider
    .generateEnvVariableString()
    .split(' -e ')
    .filter((v) => v)
    .map((v) => v.trim());

  for (const envVar of envVars) {
    const [key, ...valueParts] = envVar.split('=');
    const value = valueParts.join('=');
    if (key) {
      if (key in terraformEnvVars) {
        warn(
          `Environment variable '${key}' is a Terraform environment variable, taking precedence over provider config: '${process.env[key]}' -> '${value.replace(/^["']|["']$/g, '')}'`,
        );
        continue;
      }
      if (key in process.env) {
        warn(
          "Environment variable '" +
            key +
            "' is already set, overwriting with value from provider config: '" +
            process.env[key] +
            "' -> '" +
            value.replace(/^["']|["']$/g, '') +
            "'",
        );
      }
      process.env[key] = value.replace(/^["']|["']$/g, '');
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
