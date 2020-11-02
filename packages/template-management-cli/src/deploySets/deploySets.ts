import { createBackendBuildSetConfig } from './backend';
import { createStaticWebsiteBuildSetConfig } from './staticWebsite';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const getAllBuildSets = async (): Promise<DeploySetConfig[]> => {
  return [
    await createBackendBuildSetConfig(),
    await createStaticWebsiteBuildSetConfig(),
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
