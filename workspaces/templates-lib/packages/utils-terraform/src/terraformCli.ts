import { exec, pwd, commandExists } from '@goldstack/utils-sh';
import { assertDocker, hasDocker, imageTerraform } from '@goldstack/utils-docker';
import { fatal, warn } from '@goldstack/utils-log';
import type { CloudProvider } from './cloudProvider';
import type { TerraformVersion } from './types/utilsTerraformConfig';
import { writeCredentials } from './writeCredentials';
import { writeVarsFile } from './writeVarsFile';
import { writeBackendConfig } from './writeBackendConfig';
import path from 'path';

export type Variables = [string, string][];

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

  let workspaceEnvVariable = '';
  if (options.workspace) {
    workspaceEnvVariable = `-e TF_WORKSPACE=${options.workspace}`;
  }

  const [command, ...rest] = cmd.split(' ');

  const cmd3 =
    `docker run --rm -v "${options.dir}":/app ` +
    // ` ${options.provider.generateEnvVariableString()} ` +
    ` ${workspaceEnvVariable} ` +
    '-w /app ' +
    `${imageTerraform(options.version)} ` +
    ` ${command} ` +
    ` ${options.options?.join(' ') || ''} ` +
    ` ${rest.join(' ')} `;

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

  // Set environment variables from provider
  const envVars = options.provider
    .generateEnvVariableString()
    .split(' -e ')
    .filter((v) => v)
    .map((v) => v.trim());

  for (const envVar of envVars) {
    const [key, value] = envVar.split('=');
    if (key && value) {
      process.env[key] = value.replace(/["']/g, '');
    }
  }

  if (options.workspace) {
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
