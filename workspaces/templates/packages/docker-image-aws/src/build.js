'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const template_docker_image_aws_1 = require('@goldstack/template-docker-image-aws');
const utils_git_1 = require('@goldstack/utils-git');
const utils_sh_1 = require('@goldstack/utils-sh');
const build = async () => {
  const config = (0, template_docker_image_aws_1.getConfig)();
  const rootDir = './';
  let commitHash;
  try {
    commitHash = (0, utils_git_1.hash)();
  } catch (e) {
    console.warn(`Cannot determine commit hash for tagging docker image: ${e}`);
  }
  if (!commitHash) {
    (0, utils_sh_1.exec)(
      `docker build -f ./docker/Dockerfile -t ${config.configuration.imageTag}:latest ${rootDir}`,
    );
  } else {
    (0, utils_sh_1.exec)(
      `docker build -f ./docker/Dockerfile -t ${config.configuration.imageTag}:${commitHash} ${rootDir}`,
    );
    (0, utils_sh_1.exec)(
      `docker image tag ${config.configuration.imageTag}:${commitHash} ${config.configuration.imageTag}:latest`,
    );
  }
};
const clean = async () => {
  const config = (0, template_docker_image_aws_1.getConfig)();
  (0, utils_sh_1.exec)(`docker image rm -f ${config.configuration.imageTag}`);
};
const cli = async (args) => {
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
//# sourceMappingURL=build.js.map
