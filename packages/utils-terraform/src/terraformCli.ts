import { exec, pwd, sh } from '@goldstack/utils-sh';
import {
  assertDocker,
  hasDocker,
  imageGoldstackBuild,
} from '@goldstack/utils-docker';
import { fatal } from '@goldstack/utils-log';
import { CloudProvider } from './cloudProvider';

export type Variables = [string, string][];

const renderVariables = (variables: Variables): string => {
  if (variables.length === 0) {
    return '';
  }
  return variables.map(([key, value]) => `-var \"${key}=${value}\" `).join('');
};

interface TerraformOptions {
  dir?: string;
  provider: CloudProvider;
  variables?: Variables;
  options?: string[];
}

const execWithDocker = (cmd: string, options: TerraformOptions): string => {
  if (!options.dir) {
    options.dir = pwd();
  }

  assertDocker();

  return exec(
    `docker run --rm -v "${options.dir}":/app ` +
      ` ${options.provider.generateEnvVariableString()} ` +
      '-w /app ' +
      `${imageGoldstackBuild()} terraform ${cmd} ` +
      ` ${renderVariables(options.variables || [])} ` +
      ` ${options.options?.join(' ') || ''} `
  );
};

export const assertTerraform = (): void => {
  if (!sh.which('terraform')) {
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

  options.provider.setEnvVariables();

  return exec(
    `terraform ${cmd} ${renderVariables(options.variables || [])} ` +
      ` ${options.options?.join(' ') || ''} `
  );
};

export const tf = (cmd: string, options: TerraformOptions): string => {
  // always prefer running with Docker
  if (hasDocker()) {
    return execWithDocker(cmd, options);
  }

  return execWithCli(cmd, options);
};
