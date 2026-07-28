import { type StartTaskResult } from '@goldstack/template-docker-image-aws';
/**
 * Returns the URL for the repository where the image is deployed to.
 */
export declare const getRepo: (deploymentName: string) => string;
interface RunParams {
  deploymentName: string;
  command: string[];
  env: Array<{
    name: string;
    value: string;
  }>;
}
export declare const run: (params: RunParams) => Promise<StartTaskResult>;
export declare const start: (params: RunParams) => Promise<StartTaskResult>;
export {};
//# sourceMappingURL=image.d.ts.map
