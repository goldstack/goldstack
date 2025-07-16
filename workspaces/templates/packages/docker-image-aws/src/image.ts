import deploymentsState from './state/deployments.json';
import goldstackConfig from './../goldstack.json';

import {
  getRepo as templateGetRepo,
  runTask,
  startTask,
  getDeploymentState,
  getDeployment,
  type StartTaskResult,
  type AWSDockerImagePackage,
} from '@goldstack/template-docker-image-aws';

/**
 * Returns the URL for the repository where the image is deployed to.
 */
export const getRepo = (deploymentName: string): string => {
  return templateGetRepo(deploymentName, deploymentsState);
};

interface RunParams {
  deploymentName: string;
  command: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  env: any;
}

export const run = async (params: RunParams): Promise<StartTaskResult> => {
  const config = goldstackConfig as AWSDockerImagePackage;
  const deploymentState = getDeploymentState(params.deploymentName, deploymentsState);

  return await runTask({
    cmd: params.command,
    deployment: getDeployment(params.deploymentName),
    env: params.env,
    config,
    deploymentState,
  });
};

export const start = async (params: RunParams): Promise<StartTaskResult> => {
  const config = goldstackConfig as AWSDockerImagePackage;
  const deploymentState = getDeploymentState(params.deploymentName, deploymentsState);

  return await startTask({
    cmd: params.command,
    deployment: getDeployment(params.deploymentName),
    env: params.env,
    config,
    deploymentState,
  });
};
