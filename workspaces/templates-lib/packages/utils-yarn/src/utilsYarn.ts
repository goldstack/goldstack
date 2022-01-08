import { commandExists, pwd, exec, cd } from '@goldstack/utils-sh';
import {
  assertDocker,
  hasDocker,
  imageNodeYarn,
  renderHostEnvironmentVariables,
} from '@goldstack/utils-docker';
import path from 'path';
import { execFile } from 'child_process';

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

const execWithDocker = (dir: string, args: string): void => {
  assertDocker();
  console.log('Yarn execute with Docker');
  exec(
    'docker run --rm ' +
      `-v "${path.resolve(dir)}":/app ` +
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
