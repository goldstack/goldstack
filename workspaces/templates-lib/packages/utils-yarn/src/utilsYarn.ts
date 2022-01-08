import { commandExists, pwd, exec, cd } from '@goldstack/utils-sh';
import {
  assertDocker,
  hasDocker,
  imageNodeYarn,
  renderHostEnvironmentVariables,
} from '@goldstack/utils-docker';
import path from 'path';

export const hasYarn = (): boolean => {
  if (!commandExists('yarn')) {
    return false;
  } else {
    return true;
  }
};

export const assertYarn = (): void => {
  if (!commandExists('yarn')) {
    throw new Error('Yarn must be installed. Please install yarn.');
  }
};

export const setGlobalCacheDir = (
  projectDir: string,
  globalDir: string
): void => {
  yarn(projectDir, `config set globalFolder ${globalDir}`);
  yarn(projectDir, 'config set checksumBehavior update');
  yarn(projectDir, 'config');
};

const execWithDocker = (dir: string, args: string): void => {
  assertDocker();
  console.log('Yarn execute with Docker');
  exec(
    'docker run --rm ' +
      `-v "${path.resolve(dir)}":/app ` +
      '--workdir /app ' +
      renderHostEnvironmentVariables() +
      ' ' +
      `${imageNodeYarn()} ` +
      `yarn ${args}`
  );
};

const execWithCli = (dir: string, args: string): void => {
  assertYarn();
  const currentWorkDir = pwd();
  cd(path.resolve(dir));
  console.log('Yarn execute with cli');
  exec('yarn --version', { silent: false });
  exec(`yarn ${args}`);
  cd(currentWorkDir);
};

export interface YarnRunOptions {
  preferDocker?: boolean;
}

export const yarn = (
  dir: string,
  args: string,
  options?: YarnRunOptions
): void => {
  // always prefer to run with cli
  if (hasYarn() && !options?.preferDocker) {
    execWithCli(dir, args);
    return;
  }
  if (!hasDocker()) {
    throw new Error(
      'Either yarn needs to be installed locally or Docker be avaialbe. Please install either yarn or Docker.'
    );
  }
  execWithDocker(dir, args);
};
