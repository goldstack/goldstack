import type { DeploySetConfig } from '@goldstack/template-build-set';
import { createBackendGoGinBuildSetConfig } from './deploySets/backendGoGin';
import { createBackendLambdaApiBuildSetConfig } from './deploySets/backendLambdaApi';
import { createBackendNodejsExpressBuildSetConfig } from './deploySets/backendNodejsExpress';
import { createDynamoDBBuildSetConfig } from './deploySets/dynamodb';
import { createEmailSendBuildSetConfig } from './deploySets/emailSend';
import { createHetznerVPSBuildSetConfig } from './deploySets/hetznerVPS';
import { createLambdaNodeTriggerBuildSetConfig } from './deploySets/lambdaNodeTrigger';
import { createLambdaPythonJobBuildSetConfig } from './deploySets/lambdaPythonJob';
import { createNextjsBuildSetConfig } from './deploySets/nextjs';
import { createNextjsBootstrapBuildSetConfig } from './deploySets/nextjsBootstrap';
import { createNextjsTailwindBuildSetConfig } from './deploySets/nextjsTailwind';
import { createNoInfraBuildSetConfig } from './deploySets/noInfra';
import { createS3BuildSetConfig } from './deploySets/s3';
import { createServerSideRenderingBuildSetConfig } from './deploySets/serverSideRendering';
import { createStaticWebsiteBuildSetConfig } from './deploySets/staticWebsite';
import { createUserManagementBuildSetConfig } from './deploySets/userManagement';

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
    await createNextjsTailwindBuildSetConfig(),
    await createEmailSendBuildSetConfig(),
    await createS3BuildSetConfig(),
    await createDynamoDBBuildSetConfig(),
    await createServerSideRenderingBuildSetConfig(),
    await createUserManagementBuildSetConfig(),
    await createHetznerVPSBuildSetConfig(),
    await createLambdaNodeTriggerBuildSetConfig(),
  ];
};

export const getBuildSet = async (buildSetName: string): Promise<DeploySetConfig> => {
  const sets = await getAllBuildSets();
  const set = sets.find((buildSet) => {
    return buildSet.buildSetName === buildSetName;
  });

  if (!set) {
    throw new Error(`Unknown build set name ${buildSetName}`);
  }

  return set;
};
