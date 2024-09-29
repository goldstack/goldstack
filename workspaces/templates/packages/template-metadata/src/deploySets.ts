import { createBackendNodejsExpressBuildSetConfig } from './deploySets/backendNodejsExpress';
import { createBackendGoGinBuildSetConfig } from './deploySets/backendGoGin';
import { createStaticWebsiteBuildSetConfig } from './deploySets/staticWebsite';
import { DeploySetConfig } from '@goldstack/template-build-set';
import { createNoInfraBuildSetConfig } from './deploySets/noInfra';
import { createBackendLambdaApiBuildSetConfig } from './deploySets/backendLambdaApi';
import { createNextjsBootstrapBuildSetConfig } from './deploySets/nextjsBootstrap';
import { createEmailSendBuildSetConfig } from './deploySets/emailSend';
import { createS3BuildSetConfig } from './deploySets/s3';
import { createNextjsBuildSetConfig } from './deploySets/nextjs';
import { createDynamoDBBuildSetConfig } from './deploySets/dynamodb';
import { createServerSideRenderingBuildSetConfig } from './deploySets/serverSideRendering';
import { createUserManagementBuildSetConfig } from './deploySets/userManagement';
import { createHetznerVPSBuildSetConfig } from './deploySets/hetznerVPS';
import { createLambdaPythonJobBuildSetConfig } from './deploySets/lambdaPythonJob';

export { createServerSideRenderingBuildSetConfig } from './deploySets/serverSideRendering';

export const getAllBuildSets = async (): Promise<DeploySetConfig[]> => {
  return [
    await createBackendNodejsExpressBuildSetConfig(),
    await createStaticWebsiteBuildSetConfig(),
    await createBackendGoGinBuildSetConfig(),
    await createLambdaPythonJobBuildSetConfig(),
    await createNoInfraBuildSetConfig(),
    await createBackendLambdaApiBuildSetConfig(),
    await createNextjsBootstrapBuildSetConfig(),
    await createNextjsBuildSetConfig(),
    await createEmailSendBuildSetConfig(),
    await createS3BuildSetConfig(),
    await createDynamoDBBuildSetConfig(),
    await createServerSideRenderingBuildSetConfig(),
    await createUserManagementBuildSetConfig(),
    await createHetznerVPSBuildSetConfig(),
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
