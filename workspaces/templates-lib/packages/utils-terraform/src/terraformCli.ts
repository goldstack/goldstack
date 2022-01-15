import { exec, pwd, commandExists } from '@goldstack/utils-sh';
import {
  assertDocker,
  hasDocker,
  imageTerraform,
} from '@goldstack/utils-docker';
import { fatal } from '@goldstack/utils-log';
import { CloudProvider } from './cloudProvider';
import { TerraformVersion } from './types/utilsTerraformConfig';

export type Variables = [string, string][];

const renderVariables = (variables: Variables): string => {
  if (variables.length === 0) {
    return '';
  }
  return variables
    .map(([key, value]) => {
      const isWin = process.platform === 'win32';
      let valueFixed = value.replace(/"/g, '\\"');

      // on anything that is not Windows, ensure '$' is escaped
      // so it is not replaced with a variable
      if (!isWin) {
        valueFixed = valueFixed.replace(/\$/g, '\\$');
      }

      return `-var \"${key}=${valueFixed}\" `;
    })
    .join('');
};

const renderBackendConfig = (variables: Variables): string => {
  if (variables.length === 0) {
    return '';
  }
  return variables
    .map(([key, value]) => `-backend-config=\"${key}=${value}\" `)
    .join('');
};
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

  let workspaceEnvVariable = '';
  if (options.workspace) {
    workspaceEnvVariable = `-e TF_WORKSPACE=${options.workspace}`;
  }

  const cmd3 =
    `docker run --rm -v "${options.dir}":/app ` +
    ` ${options.provider.generateEnvVariableString()} ${workspaceEnvVariable} ` +
    '-w /app ' +
    `${imageTerraform(options.version)} ${cmd} ` +
    ` ${renderBackendConfig(options.backendConfig || [])} ` +
    ` ${renderVariables(options.variables || [])} ` +
    ` ${options.options?.join(' ') || ''} `;

  return exec(cmd3, { silent: options.silent });
};

export const assertTerraform = (): void => {
  if (!commandExists('terraform')) {
    fatal(
      'Terraform is not installed.\n\n' +
        'Install terraform CLI or Docker (preferred).'
    );
    throw new Error();
  }
};

const execWithCli = (cmd: string, options: TerraformOptions): string => {
  if (!options.dir) {
    options.dir = pwd();
  }

  assertTerraform();
  const version = exec('terraform version');
  if (version.indexOf(options.version) === -1) {
    throw new Error(
      `Invalid local Terraform version detected: [${
        version.split('\n')[0]
      }], expected version compatible with [${
        options.version
      }]. Please install this version locally or install Docker for Goldstack to run the correct Terraform version required for this deployment using Docker.`
    );
  }

  options.provider.setEnvVariables();

  if (options.workspace) {
    process.env.TF_WORKSPACE = options.workspace;
  }

  const execCmd =
    `terraform ${cmd} ` +
    ` ${renderBackendConfig(options.backendConfig || [])} ` +
    ` ${renderVariables(options.variables || [])} ` +
    ` ${options.options?.join(' ') || ''} `;

  return exec(execCmd, { silent: options.silent });
};

export const tf = (cmd: string, options: TerraformOptions): string => {
  // always prefer running with Docker
  if (hasDocker()) {
    return execWithDocker(cmd, options);
  }

  return execWithCli(cmd, options);
};
