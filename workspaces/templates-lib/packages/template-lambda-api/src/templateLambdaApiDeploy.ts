import { LambdaApiDeployment } from './types/LambdaApiPackage';
import { getAWSUser } from '@goldstack/infra-aws';
import { deployFunction, LambdaConfig } from '@goldstack/utils-aws-lambda';

import { readLambdaConfig } from '@goldstack/utils-aws-lambda';
import { defaultRoutesPath } from './templateLambdaConsts';

import { mkdir, rmSafe } from '@goldstack/utils-sh';
import { generateFunctionName } from './generateLambdaConfig';
import { getOutDirForLambda } from './templateLambdaApiBuild';

interface DeployLambdaParams {
  deployment: LambdaApiDeployment;
  config: LambdaConfig[];
}

export const deployLambdas = async (
  params: DeployLambdaParams
): Promise<void> => {
  const lambdaConfig = readLambdaConfig(defaultRoutesPath);

  const operations = lambdaConfig.map(async (config) => {
    const functionName = generateFunctionName(params.deployment, config);
    const functionDir = getOutDirForLambda(config);
    mkdir('-p', functionDir);
    const targetArchive = `${functionDir}/${config.name}.zip`;
    await rmSafe(targetArchive);
    await deployFunction({
      targetArchiveName: targetArchive,
      lambdaPackageDir: functionDir,
      awsCredentials: await getAWSUser(params.deployment.awsUser),
      region: params.deployment.awsRegion,
      functionName,
    });
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
