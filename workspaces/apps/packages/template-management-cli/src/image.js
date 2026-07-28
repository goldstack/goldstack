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
 */
const getRepo = (deploymentName) => {
  return (0, template_docker_image_aws_1.getRepo)(deploymentName, deployments_json_1.default);
};
exports.getRepo = getRepo;
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
