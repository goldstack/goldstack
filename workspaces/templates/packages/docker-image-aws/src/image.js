'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.start = exports.run = exports.getRepo = void 0;
const template_docker_image_aws_1 = require('@goldstack/template-docker-image-aws');
const goldstack_json_1 = __importDefault(require('./../goldstack.json'));
const deployments_json_1 = __importDefault(require('./state/deployments.json'));
/**
 * Returns the URL for the repository where the image is deployed to.
 *
 * @param deploymentName - The name of the deployment to get the repository URL for.
 * @returns The repository URL string.
 */
const getRepo = (deploymentName) => {
  return (0, template_docker_image_aws_1.getRepo)(deploymentName, deployments_json_1.default);
};
exports.getRepo = getRepo;
/**
 * Runs a one-time task in the Docker container and waits for it to complete.
 *
 * @param params - The parameters for running the task.
 * @returns A promise that resolves with the task execution result.
 */
const run = async (params) => {
  const config = goldstack_json_1.default;
  const deploymentState = (0, template_docker_image_aws_1.getDeploymentState)(
    params.deploymentName,
    deployments_json_1.default,
  );
  return await (0, template_docker_image_aws_1.runTask)({
    cmd: params.command,
    deployment: (0, template_docker_image_aws_1.getDeployment)(params.deploymentName),
    env: params.env,
    config,
    deploymentState,
  });
};
exports.run = run;
/**
 * Starts a long-running task in the Docker container.
 *
 * @param params - The parameters for starting the task.
 * @returns A promise that resolves with the task execution result.
 */
const start = async (params) => {
  const config = goldstack_json_1.default;
  const deploymentState = (0, template_docker_image_aws_1.getDeploymentState)(
    params.deploymentName,
    deployments_json_1.default,
  );
  return await (0, template_docker_image_aws_1.startTask)({
    cmd: params.command,
    deployment: (0, template_docker_image_aws_1.getDeployment)(params.deploymentName),
    env: params.env,
    config,
    deploymentState,
  });
};
exports.start = start;
//# sourceMappingURL=image.js.map
