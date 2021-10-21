import { commandExists, pwd, exec, cd } from '@goldstack/utils-sh';
import {
  hasDocker,
  imageGoldstackBuild,
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
  exec(
    'docker run --rm ' +
      `-v "${path.resolve(dir)}":/app ` +
      renderHostEnvironmentVariables() +
      ' ' +
      `${imageGoldstackBuild()} ` +
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
  // always prefer to run with docker
  if (hasDocker()) {
    execWithDocker(dir, args);
    return;
  }

  execWithCli(dir, args);
};
