import { createBackendNodejsExpressBuildSetConfig } from './backendNodejsExpress';
import { createBackendGoGinBuildSetConfig } from './backendGoGin';
import { createStaticWebsiteBuildSetConfig } from './staticWebsite';
import { DeploySetConfig } from '@goldstack/template-build-set';
import { createNoInfraBuildSetConfig } from './noInfra';
import { createBackendLambdaApiBuildSetConfig } from './backendLambdaApi';

export const getAllBuildSets = async (): Promise<DeploySetConfig[]> => {
  return [
    await createBackendNodejsExpressBuildSetConfig(),
    await createStaticWebsiteBuildSetConfig(),
    await createBackendGoGinBuildSetConfig(),
    await createNoInfraBuildSetConfig(),
    await createBackendLambdaApiBuildSetConfig(),
  ];
};

export const getBuildSet = async (
  buildSetName: string
): Promise<DeploySetConfig> => {
  const sets = await getAllBuildSets();
  const set = sets.find((buildSet) => {
    return buildSet.buildSetName === buildSetName;
  });

  if (!set) {
    throw new Error(`Unknown build set name ${buildSetName}`);
  }

  return set;
};
