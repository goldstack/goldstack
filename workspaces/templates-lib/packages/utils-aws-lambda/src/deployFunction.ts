import {
  LambdaClient,
  UpdateFunctionCodeCommand,
  waitUntilFunctionActiveV2,
  waitUntilFunctionUpdatedV2,
} from '@aws-sdk/client-lambda';
import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { awsCli, hasAwsCli } from '@goldstack/utils-aws-cli';
import { debug } from '@goldstack/utils-log';
import { rmSafe, zip } from '@goldstack/utils-sh';
import fs from 'fs';
import { isAbsolute, relative, sep } from 'path';

/**
 * Maximum size of a deployment archive that can be uploaded directly using the AWS Lambda SDK.
 *
 * AWS only supports direct uploads for archives up to 50 MB. Larger archives must be uploaded
 * to S3 first or deployed using the AWS CLI.
 */
export const defaultSdkMaxSizeBytes = 50 * 1024 * 1024;

/**
 * Determines how a Lambda deployment archive is uploaded to AWS.
 *
 * - `auto`: Use the AWS SDK for small archives and fall back to the AWS CLI for large ones.
 * - `sdk`: Always use the AWS SDK, failing if the archive is too large.
 * - `cli`: Always use the AWS CLI.
 */
export type DeployFunctionMode = 'auto' | 'sdk' | 'cli';

export interface DeployFunctionParams {
  lambdaPackageDir: string;
  targetArchiveName?: string;
  awsCredentials: AwsCredentialIdentityProvider;
  region: string;
  functionName: string;
  /**
   * Determines how the deployment archive is uploaded. Defaults to `auto`.
   */
  deploymentMode?: DeployFunctionMode;
  /**
   * Maximum archive size in bytes for uploads using the AWS SDK. Defaults to
   * `defaultSdkMaxSizeBytes`.
   */
  sdkMaxSizeBytes?: number;
}

export interface SelectDeploymentMethodParams {
  /**
   * Size of the deployment archive in bytes.
   */
  archiveSizeBytes: number;
  /**
   * Requested deployment mode. Defaults to `auto`.
   */
  deploymentMode?: DeployFunctionMode;
  /**
   * Maximum archive size in bytes for uploads using the AWS SDK. Defaults to
   * `defaultSdkMaxSizeBytes`.
   */
  sdkMaxSizeBytes?: number;
}

/**
 * Selects whether a deployment archive should be uploaded using the AWS SDK or the AWS CLI.
 *
 * @param params - Parameters used to determine the deployment method.
 * @returns The deployment method to use.
 */
export function selectDeploymentMethod(params: SelectDeploymentMethodParams): 'sdk' | 'cli' {
  const deploymentMode = params.deploymentMode ?? 'auto';
  const sdkMaxSizeBytes = params.sdkMaxSizeBytes ?? defaultSdkMaxSizeBytes;

  if (deploymentMode === 'cli') {
    return 'cli';
  }

  if (params.archiveSizeBytes <= sdkMaxSizeBytes) {
    return 'sdk';
  }

  if (deploymentMode === 'sdk') {
    throw new Error(
      `Deployment archive is ${params.archiveSizeBytes} bytes, which exceeds the maximum ` +
        `size for SDK uploads of ${sdkMaxSizeBytes} bytes. Use deployment mode 'cli' or ` +
        'reduce the size of the deployment package.',
    );
  }

  return 'cli';
}

interface DeployFunctionWithSdkParams {
  /**
   * AWS credentials used to deploy the function.
   */
  awsCredentials: AwsCredentialIdentityProvider;
  /**
   * Region the Lambda function is deployed to.
   */
  region: string;
  /**
   * Name of the Lambda function.
   */
  functionName: string;
  /**
   * Path to the deployment archive.
   */
  targetArchive: string;
}

interface DeployFunctionWithCliParams {
  /**
   * AWS credentials used to deploy the function.
   */
  awsCredentials: AwsCredentialIdentityProvider;
  /**
   * Region the Lambda function is deployed to.
   */
  region: string;
  /**
   * Name of the Lambda function.
   */
  functionName: string;
  /**
   * Path to the deployment archive.
   */
  targetArchive: string;
}

interface WaitForFunctionActiveWithCliParams {
  /**
   * AWS credentials used to query the function.
   */
  awsCredentials: AwsCredentialIdentityProvider;
  /**
   * Region the Lambda function is deployed to.
   */
  region: string;
  /**
   * Name of the Lambda function.
   */
  functionName: string;
}

/**
 * Uploads a deployment archive using the AWS SDK and waits until the function has been updated.
 */
async function deployFunctionWithSdk(params: DeployFunctionWithSdkParams): Promise<any> {
  const client = new LambdaClient({
    credentials: params.awsCredentials,
    region: params.region,
  });

  try {
    const deployResult = await client.send(
      new UpdateFunctionCodeCommand({
        FunctionName: params.functionName,
        ZipFile: await fs.promises.readFile(params.targetArchive),
      }),
    );

    await waitUntilFunctionUpdatedV2(
      { client, maxWaitTime: 120, minDelay: 1, maxDelay: 5 },
      { FunctionName: params.functionName },
    );
    await waitUntilFunctionActiveV2(
      { client, maxWaitTime: 120, minDelay: 1, maxDelay: 5 },
      { FunctionName: params.functionName },
    );

    return deployResult;
  } finally {
    client.destroy();
  }
}

/**
 * Uploads a deployment archive using the AWS CLI and waits until the function becomes active.
 */
async function deployFunctionWithCli(params: DeployFunctionWithCliParams): Promise<any> {
  let fixedTargetArchive = params.targetArchive;

  if (!hasAwsCli()) {
    // When running in Docker via AWS CLI, we need to use paths relative to the mounted /app directory
    debug(`Original target archive path: ${fixedTargetArchive}`);

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

  await waitForFunctionActiveWithCli(params);

  return JSON.parse(deployResult);
}

/**
 * Waits until a Lambda function reaches the `Active` state using the AWS CLI.
 */
async function waitForFunctionActiveWithCli(
  params: WaitForFunctionActiveWithCliParams,
): Promise<void> {
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
  if (state !== 'Active') {
    throw new Error(`Function was still in state '${state}' after deployment`);
  }
}

/**
 * Deploys a Lambda function from a directory by packaging it and uploading it to AWS.
 *
 * Small archives are uploaded directly using the AWS SDK, while larger archives fall back to
 * the AWS CLI. This keeps deployments fast for small functions without changing the behaviour
 * for functions whose archives exceed the direct upload limit.
 */
export async function deployFunction(params: DeployFunctionParams): Promise<any> {
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

  const archiveSizeBytes = fs.statSync(targetArchive).size;
  const deploymentMethod = selectDeploymentMethod({
    archiveSizeBytes,
    deploymentMode: params.deploymentMode,
    sdkMaxSizeBytes: params.sdkMaxSizeBytes,
  });

  const deployParams = {
    awsCredentials: params.awsCredentials,
    region: params.region,
    functionName: params.functionName,
    targetArchive,
  };

  const deployResult =
    deploymentMethod === 'sdk'
      ? await deployFunctionWithSdk(deployParams)
      : await deployFunctionWithCli(deployParams);

  if (!params.targetArchiveName) {
    await rmSafe(targetArchive);
  }

  return deployResult;
}
