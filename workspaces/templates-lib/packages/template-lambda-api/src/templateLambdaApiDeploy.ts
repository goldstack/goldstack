import { LambdaApiDeployment } from './types/LambdaApiPackage';
import { getAWSUser } from '@goldstack/infra-aws';
import {
  deployFunction,
  LambdaConfig,
  generateFunctionName,
} from '@goldstack/utils-aws-lambda';

import { readLambdaConfig } from '@goldstack/utils-aws-lambda';
import { defaultRoutesPath } from './templateLambdaConsts';

import { mkdir, rmSafe } from '@goldstack/utils-sh';
import { getOutDirForLambda } from './templateLambdaApiBuild';

interface DeployLambdaParams {
  deployment: LambdaApiDeployment;
  config: LambdaConfig[];
}

export const deployLambdas = async (
  params: DeployLambdaParams
): Promise<void> => {
  await rmSafe('./distLambda/zips');
  mkdir('-p', './distLambda/zips');
  const lambdaConfig = readLambdaConfig(defaultRoutesPath);

  const operations = lambdaConfig.map(async (config) => {
    const functionName = generateFunctionName(
      params.deployment.configuration.lambdaNamePrefix,
      config
    );
    console.log(`[${functionName}]: Starting deployment`);
    const functionDir = getOutDirForLambda(config);
    mkdir('-p', functionDir);
    const targetArchive = `./distLambda/zips/${functionName}.zip`;
    await deployFunction({
      targetArchiveName: targetArchive,
      lambdaPackageDir: functionDir,
      awsCredentials: await getAWSUser(params.deployment.awsUser),
      region: params.deployment.awsRegion,
      functionName,
    });
    console.log(`[${functionName}]: Deployment completed`);
  });
  await Promise.all(operations);
};

export const deployCli = async (
  deployment: LambdaApiDeployment,
  config: LambdaConfig[]
): Promise<void> => {
  await deployLambdas({
    deployment,
    config,
  });
};
