import { LambdaExpressDeployment } from './types/LambdaExpressPackage';
import { getAWSUser } from '@goldstack/infra-aws';
import {
  readDeploymentState,
  readTerraformStateVariable,
  DeploymentState,
} from '@goldstack/infra';
import { deployFunction } from '@goldstack/utils-aws-lambda';

interface DeployLambdaParams {
  deployment: LambdaExpressDeployment;
  deploymentState: DeploymentState;
}

export const deployLambda = async (
  params: DeployLambdaParams
): Promise<void> => {
  const targetArchive = 'lambda.zip';
  const lambdaDistDir = './distLambda';
  const functionName = readTerraformStateVariable(
    params.deploymentState,
    'lambda_function_name'
  );

  await deployFunction({
    targetArchiveName: targetArchive,
    lambdaPackageDir: lambdaDistDir,
    awsCredentials: await getAWSUser(params.deployment.awsUser),
    region: params.deployment.awsRegion,
    functionName,
  });
};

export const deployCli = async (
  deployment: LambdaExpressDeployment
): Promise<void> => {
  const deploymentState = readDeploymentState('./', deployment.name);

  await deployLambda({
    deployment,
    deploymentState,
  });
};
