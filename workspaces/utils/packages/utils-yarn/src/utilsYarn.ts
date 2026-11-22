import {
  assertDocker,
  hasDocker,
  imageNodeYarn,
  renderHostEnvironmentVariablesArray,
} from '@goldstack/utils-docker';
import { debug, info } from '@goldstack/utils-log';
import { commandExists, execSafe } from '@goldstack/utils-sh';
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

/**
 * Ensure that templates can be built in a CI environment, see
 * https://github.com/goldstack/goldstack/issues/41#issuecomment-1007857278
 *
 * @param projectDir
 * @param globalDir
 */
export const configureForTemplateBuild = (projectDir: string, globalDir: string): void => {
  info('Perform Yarn config overwrite for template building:');
  yarn(projectDir, `config set globalFolder ${globalDir}`);
  yarn(projectDir, 'config set checksumBehavior update');
  yarn(projectDir, 'config set enableImmutableInstalls false');
  yarn(projectDir, 'config set enableImmutableCache false');
  // yarn(projectDir, 'config');
};

const execWithDocker = (dir: string, args: string): void => {
  assertDocker();
  execSafe('docker', [
    'run',
    '--rm',
    '-v',
    `${path.resolve(dir)}:/app`,
    '--workdir',
    '/app',
    ...renderHostEnvironmentVariablesArray(),
    imageNodeYarn(),
    'yarn',
    ...args.split(' '),
  ]);
};

const execWithCli = (dir: string, args: string): void => {
  assertYarn();
  execSafe('yarn', args.split(' '), { cwd: path.resolve(dir) });
};

export interface YarnRunOptions {
  preferDocker?: boolean;
}

export const yarn = (dir: string, args: string, options?: YarnRunOptions): void => {
  debug(`Performing yarn command: yarn ${args}`);
  // always prefer to run with cli
  if (hasYarn() && !options?.preferDocker) {
    execWithCli(dir, args);
    return;
  }
  if (!hasDocker()) {
    throw new Error(
      'Either yarn needs to be installed locally or Docker be available. Please install either yarn or Docker.',
    );
  }
  execWithDocker(dir, args);
};
