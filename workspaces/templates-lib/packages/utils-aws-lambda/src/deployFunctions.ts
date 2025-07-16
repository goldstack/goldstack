import type { AWSDeployment } from '@goldstack/infra-aws';
import type { LambdaApiDeploymentConfiguration } from './types/LambdaDeploymentConfiguration';
import { getAWSUser } from '@goldstack/infra-aws';
import { deployFunction } from './deployFunction';
import type { LambdaConfig } from './types/LambdaConfig';
import { generateFunctionName } from './generate/generateFunctionName';

import { readLambdaConfig } from './generate/collectLambdasFromFiles';

import { mkdir } from '@goldstack/utils-sh';
import { getOutDirForLambda } from './buildFunctions';
import { info } from '@goldstack/utils-log';
import path from 'path';

export interface DeployFunctionsParams {
  routesPath: string;
  configuration: LambdaApiDeploymentConfiguration;
  deployment: AWSDeployment;
  config: LambdaConfig[];
  packageRootFolder: string;
}

export const deployFunctions = async (params: DeployFunctionsParams): Promise<void> => {
  const lambdaConfig = params.config; //readLambdaConfig(params.routesPath);

  const operations = lambdaConfig.map(async (config) => {
    const functionName = generateFunctionName(params.configuration.lambdaNamePrefix, config);
    info(`[${functionName}]: Starting deployment`);
    const functionDir = getOutDirForLambda(params.packageRootFolder, config);
    mkdir('-p', functionDir);
    const targetArchive = path.join(
      params.packageRootFolder,
      `distLambda/zips/${functionName}.zip`,
    );
    await deployFunction({
      targetArchiveName: targetArchive,
      lambdaPackageDir: functionDir,
      awsCredentials: await getAWSUser(params.deployment.awsUser),
      region: params.deployment.awsRegion,
      functionName,
    });
    info(`[${functionName}]: Deployment completed`);
  });
  await Promise.all(operations);
};
