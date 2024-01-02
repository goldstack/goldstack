import { awsCli } from '@goldstack/utils-aws-cli';
import { zip, rmSafe } from '@goldstack/utils-sh';
import { getAWSCredentials } from '@goldstack/infra-aws';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';

export interface DeployFunctionParams {
  lambdaPackageDir: string;
  targetArchiveName?: string;
  awsCredentials: AwsCredentialIdentityProvider;
  region: string;
  functionName: string;
}

export const deployFunction = async (
  params: DeployFunctionParams
): Promise<any> => {
  const targetArchive =
    params.targetArchiveName || `lambda-${new Date().getTime()}.zip`;

  await rmSafe(targetArchive);
  await zip({
    directory: params.lambdaPackageDir,
    target: targetArchive,
    mode: 511,
  });

  let fixedTargetArchive = targetArchive;

  const isWin = process.platform === 'win32';

  if (!isWin) {
    fixedTargetArchive = fixedTargetArchive.replace(/\$/g, '\\$');
  }

  const deployResult = await awsCli({
    credentials: params.awsCredentials,
    region: params.region,
    options: {
      silent: true,
    },
    command: `lambda update-function-code --function-name ${params.functionName} --zip-file fileb://${fixedTargetArchive}`,
  });
  if (!params.targetArchiveName) {
    await rmSafe(targetArchive);
  }

  // wait until lambda becomes active
  let counter = 0;
  let state = '';
  while (counter < 20 && state !== 'Active') {
    const res = await awsCli({
      credentials: params.awsCredentials,
      region: params.region,
      options: {
        silent: true,
      },
      command: `lambda get-function --function-name ${params.functionName}`,
    });
    const data = JSON.parse(res);
    state = data.Configuration.State;
    counter++;
  }
  if (counter >= 20) {
    throw new Error(`Function was still in state '${state}' after deployment`);
  }
  return JSON.parse(deployResult);
};
