import { getConfig } from '@goldstack/template-docker-image-aws';
import { hash } from '@goldstack/utils-git';
import { execSafe } from '@goldstack/utils-sh';

const build = async (): Promise<void> => {
  const config = getConfig();
  const rootDir = './../../../../';

  let commitHash: string | undefined;
  try {
    commitHash = hash();
  } catch (e) {
    console.warn(`Cannot determine commit hash for tagging docker image: ${e}`);
  }

  const imageTag = config.configuration.imageTag;
  if (!commitHash) {
    execSafe('docker', ['build', '-f', './docker/Dockerfile', '-t', `${imageTag}:latest`, rootDir]);
  } else {
    execSafe('docker', [
      'build',
      '-f',
      './docker/Dockerfile',
      '-t',
      `${imageTag}:${commitHash}`,
      rootDir,
    ]);
    execSafe('docker', ['image', 'tag', `${imageTag}:${commitHash}`, `${imageTag}:latest`]);
  }
};

const clean = async (): Promise<void> => {
  const config = getConfig();
  execSafe('docker', ['image', 'rm', '-f', config.configuration.imageTag]);
};

const cli = async (args: string[]): Promise<void> => {
  const [, , operation] = args;

  if (operation === 'build') {
    return await build();
  }
  if (operation === 'clean') {
    return await clean();
  }

  throw new Error(`Unknown operation: ${operation}`);
};

cli(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
