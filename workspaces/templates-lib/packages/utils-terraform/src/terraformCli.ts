import { exec, pwd, commandExists } from '@goldstack/utils-sh';
import {
  assertDocker,
  hasDocker,
  imageTerraform,
} from '@goldstack/utils-docker';
import { fatal, warn } from '@goldstack/utils-log';
import { CloudProvider } from './cloudProvider';
import { TerraformVersion } from './types/utilsTerraformConfig';
import { writeAwsCredentials } from './writeAwsCredentials';
import { writeVarsFile } from './writeVarsFile';

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

export const formatTerraformValue = (value: any): string => {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatTerraformValue).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return `{${Object.entries(value)
      .map(([k, v]) => `"${k}" = ${formatTerraformValue(v)}`)
      .join(', ')}}`;
  }
  return 'null';
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

  // Write variables to tfvars file
  if (options.variables) {
    writeVarsFile(options.variables, options.dir);
  }

  // Write AWS credentials file
  writeAwsCredentials(
    options.provider.generateEnvVariableString(),
    options.dir
  );

  let workspaceEnvVariable = '';
  if (options.workspace) {
    workspaceEnvVariable = `-e TF_WORKSPACE=${options.workspace}`;
  }

  const [command, ...rest] = cmd.split(' ');

  const cmd3 =
    `docker run --rm -v "${options.dir}":/app ` +
    ` ${options.provider.generateEnvVariableString()} ${workspaceEnvVariable} ` +
    '-w /app ' +
    `${imageTerraform(options.version)} ` +
    ` ${command} ` +
    ` ${renderBackendConfig(options.backendConfig || [])} ` +
    ` ${renderVariables(options.variables || [])} ` +
    ` ${options.options?.join(' ') || ''} ` +
    ` ${rest.join(' ')} `;

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
      `Not matching local Terraform version detected: [${
        version.split('\n')[0]
      }], expected version compatible with [${
        options.version
      }]. Please install this version locally or install Docker for Goldstack to run the correct Terraform version required for this deployment using Docker.`
    );
  }

  // Write variables to tfvars file
  if (options.variables) {
    writeVarsFile(options.variables, options.dir);
  }

  // Write AWS credentials file
  writeAwsCredentials(
    options.provider.generateEnvVariableString(),
    options.dir
  );

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
    ` ${renderBackendConfig(options.backendConfig || [])} ` +
    // ` ${renderVariables(options.variables || [])} ` +
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

  throw new Error(
    'Neither Terraform nor Docker installed. Please install one of them'
  );
};
