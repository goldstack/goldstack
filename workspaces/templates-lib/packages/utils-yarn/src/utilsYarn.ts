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

const execWithDocker = (dir: string, args: string): void => {
  assertDocker();
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
  exec(`yarn ${args}`);
  cd(currentWorkDir);
};

export const yarn = (dir: string, args: string): void => {
  // always prefer to run with cli
  if (hasYarn()) {
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
