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
 *
 * @param deploymentName - The name of the deployment to get the repository URL for.
 * @returns The repository URL string.
 */
export const getRepo = (deploymentName: string): string => {
  return templateGetRepo(deploymentName, deploymentsState);
};

/**
 * Parameters for running a task in the Docker container.
 */
interface RunParams {
  /** The name of the deployment to run the task in. */
  deploymentName: string;
  /** The command to run in the container. */
  command: string[];
  /** Environment variables to set in the container. */
  env: any;
}

/**
 * Runs a one-time task in the Docker container and waits for it to complete.
 *
 * @param params - The parameters for running the task.
 * @returns A promise that resolves with the task execution result.
 */
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

/**
 * Starts a long-running task in the Docker container.
 *
 * @param params - The parameters for starting the task.
 * @returns A promise that resolves with the task execution result.
 */
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
