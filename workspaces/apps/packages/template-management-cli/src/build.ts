import { exec } from '@goldstack/utils-sh';
import { hash } from '@goldstack/utils-git';
import { getConfig } from '@goldstack/template-docker-image-aws';

const build = async (): Promise<void> => {
  const config = getConfig();
  const rootDir = './../../../../';

  let commitHash: string | undefined ;
  try {
    commitHash = hash();
  } catch (e) {
    console.warn(`Cannot determine commit hash for tagging docker image: ${e}`);
  }

  if (!commitHash) {
    exec(
      `docker build -f ./docker/Dockerfile -t ${config.configuration.imageTag}:latest ${rootDir}`
    );
  } else {
    exec(
      `docker build -f ./docker/Dockerfile -t ${config.configuration.imageTag}:${commitHash} ${rootDir}`
    );
    exec(
      `docker image tag ${config.configuration.imageTag}:${commitHash} ${config.configuration.imageTag}:latest`
    );
  }
};

const clean = async (): Promise<void> => {
  const config = getConfig();
  exec(`docker image rm -f ${config.configuration.imageTag}`);
};

const cli = async (args: string[]): Promise<void> => {
  const [, , operation] = args;

  if (operation === 'build') {
    return await build();
  }
  if (operation === 'clean') {
    return await clean();
  }

  throw new Error('Unknown operation: ' + operation);
};

cli(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
