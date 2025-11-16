/* eslint-disable @typescript-eslint/no-unused-vars */

import { DeploymentState, readDeploymentState, readTerraformStateVariable } from '@goldstack/infra';
import { getAWSUser } from '@goldstack/infra-aws';
import type {
  UserManagementConfiguration,
  UserManagementDeployment,
} from '@goldstack/template-user-management';
import { deployFunction } from '@goldstack/utils-aws-lambda';

export const deployCli = async (
  config: UserManagementConfiguration,
  deployment: UserManagementDeployment,
): Promise<void> => {
  const deploymentState = readDeploymentState('./', deployment.name);

  const preSignUpFunctionName = readTerraformStateVariable(
    deploymentState,
    'pre_sign_up_lambda_function_name',
  );

  const postConfirmationLambdaName = readTerraformStateVariable(
    deploymentState,
    'post_confirmation_lambda_function_name',
  );

  await deployFunction({
    functionName: preSignUpFunctionName,
    awsCredentials: await getAWSUser(deployment.awsUser),
    lambdaPackageDir: './distLambda/preSignUp',
    region: deployment.awsRegion,
    targetArchiveName: './distLambda/preSignUp.zip',
  });

  await deployFunction({
    functionName: postConfirmationLambdaName,
    awsCredentials: await getAWSUser(deployment.awsUser),
    lambdaPackageDir: './distLambda/postConfirmation',
    region: deployment.awsRegion,
    targetArchiveName: './distLambda/postConfirmation.zip',
  });
};
