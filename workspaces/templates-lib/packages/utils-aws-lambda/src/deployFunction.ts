import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { awsCli, hasAwsCli } from '@goldstack/utils-aws-cli';
import { debug } from '@goldstack/utils-log';
import { rmSafe, zip } from '@goldstack/utils-sh';
import { isAbsolute, relative, sep } from 'path';

export interface DeployFunctionParams {
  lambdaPackageDir: string;
  targetArchiveName?: string;
  awsCredentials: AwsCredentialIdentityProvider;
  region: string;
  functionName: string;
}

export const deployFunction = async (params: DeployFunctionParams): Promise<any> => {
  const targetArchive = params.targetArchiveName || `lambda-${Date.now()}.zip`;

  await rmSafe(targetArchive);
  // debug(
  //   `[${params.functionName}] Preparing Zip from ${params.lambdaPackageDir}`
  // );
  await zip({
    directory: params.lambdaPackageDir,
    target: targetArchive,
    mode: 511,
  });

  let fixedTargetArchive = targetArchive;

  if (!hasAwsCli()) {
    // When running in Docker via AWS CLI, we need to use paths relative to the mounted /app directory
    debug(`Original target archive path: ${targetArchive}`);

    // If it's an absolute path, make it relative to the working directory
    if (isAbsolute(fixedTargetArchive)) {
      fixedTargetArchive = relative(process.cwd(), fixedTargetArchive);
    }

    // Normalize to forward slashes
    fixedTargetArchive = fixedTargetArchive.split(sep).join('/');

    debug(`Fixed target archive path: ${fixedTargetArchive}`);
  }

  const deployResult = await awsCli({
    credentials: params.awsCredentials,
    region: params.region,
    options: {
      silent: true,
    },
    args: [
      'lambda',
      'update-function-code',
      '--function-name',
      params.functionName,
      '--zip-file',
      `fileb://${fixedTargetArchive}`,
    ],
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
      args: ['lambda', 'get-function', '--function-name', params.functionName],
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
