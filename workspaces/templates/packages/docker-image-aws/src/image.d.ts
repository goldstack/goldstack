import { type StartTaskResult } from '@goldstack/template-docker-image-aws';
interface EnvVarDefinition {
  name: string;
  value: string;
}
/**
 * Returns the URL for the repository where the image is deployed to.
 *
 * @param deploymentName - The name of the deployment to get the repository URL for.
 * @returns The repository URL string.
 */
export declare const getRepo: (deploymentName: string) => string;
/**
 * Parameters for running a task in the Docker container.
 */
interface RunParams {
  /** The name of the deployment to run the task in. */
  deploymentName: string;
  /** The command to run in the container. */
  command: string[];
  /** Environment variables to set in the container. */
  env: EnvVarDefinition[];
}
/**
 * Runs a one-time task in the Docker container and waits for it to complete.
 *
 * @param params - The parameters for running the task.
 * @returns A promise that resolves with the task execution result.
 */
export declare const run: (params: RunParams) => Promise<StartTaskResult>;
/**
 * Starts a long-running task in the Docker container.
 *
 * @param params - The parameters for starting the task.
 * @returns A promise that resolves with the task execution result.
 */
export declare const start: (params: RunParams) => Promise<StartTaskResult>;
export {};
//# sourceMappingURL=image.d.ts.map
