import { LambdaExpressDeployment } from './types/LambdaExpressPackage';
import { getAWSUser } from '@goldstack/infra-aws';
import {
  readDeploymentState,
  readTerraformStateVariable,
  DeploymentState,
} from '@goldstack/infra';
import archiver from 'archiver';
import fs from 'fs';
import { awsCli } from '@goldstack/utils-aws-cli';

interface DeployLambdaParams {
  deployment: LambdaExpressDeployment;
  deploymentState: DeploymentState;
}

export const deployLambda = async (
  params: DeployLambdaParams
): Promise<void> => {
  const targetArchive = 'lambda.zip';
  const lambdaDistDir = './distLambda';

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(targetArchive);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('warning', function (err) {
      console.warn(err.message);
    });

    output.on('finish', () => {
      resolve();
    });
    output.on('error', reject);

    archive.pipe(output);

    archive.directory(lambdaDistDir, false);

    archive.finalize();
  });

  awsCli({
    credentials: await getAWSUser(params.deployment.awsUser),
    region: params.deployment.awsRegion,
    command: `lambda update-function-code --function-name ${readTerraformStateVariable(
      params.deploymentState,
      'lambda_function_name'
    )} --zip-file fileb://${targetArchive}`,
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
