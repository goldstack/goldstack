import {
  type AWSDockerImagePackage,
  getDeployment,
  getDeploymentState,
  runTask,
  type StartTaskResult,
  startTask,
  getRepo as templateGetRepo,
} from '@goldstack/template-docker-image-aws';
import goldstackConfig from './../goldstack.json';
import deploymentsState from './state/deployments.json';

/**
 * Returns the URL for the repository where the image is deployed to.
 */
export const getRepo = (deploymentName: string): string => {
  return templateGetRepo(deploymentName, deploymentsState);
};

interface RunParams {
  deploymentName: string;
  command: string[];

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
