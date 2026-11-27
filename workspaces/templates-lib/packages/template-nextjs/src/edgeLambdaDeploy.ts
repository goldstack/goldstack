import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { type DeploymentState, readTerraformStateVariable } from '@goldstack/infra';
import { getAWSUser } from '@goldstack/infra-aws';
import { awsCli } from '@goldstack/utils-aws-cli';
import { deployFunction } from '@goldstack/utils-aws-lambda';
import { mkdir, rmSafe, write } from '@goldstack/utils-sh';
import { packageEdgeLambda } from './edgeLambdaPackage';
import { handlerUsesRoutesManifest, injectRoutesManifest } from './routesManifest';
import type { NextjsDeployment } from './types/NextJsPackage';

interface DeployLambdaParams {
  deployment: NextjsDeployment;
  deploymentState: DeploymentState;
}

/**
 * Wait for Lambda function to be in Active state and ready for version publishing
 * @param functionName - The name of the Lambda function
 * @param credentials - AWS credentials
 * @param region - AWS region
 * @param maxRetries - Maximum number of retries (default: 30)
 * @param retryDelayMs - Delay between retries in milliseconds (default: 2000)
 */
async function waitForLambdaActive(
  functionName: string,
  credentials: AwsCredentialIdentityProvider,
  region: string,
  maxRetries = 30,
  retryDelayMs = 2000,
): Promise<void> {
  let counter = 0;
  let state = '';
  let lastUpdateStatus = '';

  while (counter < maxRetries) {
    const res = await awsCli({
      credentials,
      region,
      options: { silent: true },
      args: ['lambda', 'get-function', '--function-name', functionName],
    });

    const data = JSON.parse(res);
    state = data.Configuration.State;
    lastUpdateStatus = data.Configuration.LastUpdateStatus;

    // Function is ready when it's Active and LastUpdateStatus is Successful
    if (state === 'Active' && lastUpdateStatus === 'Successful') {
      return;
    }

    counter++;
    if (counter < maxRetries) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), retryDelayMs);
      });
    }
  }

  throw new Error(
    `Function '${functionName}' was not ready after ${maxRetries} retries. ` +
      `Current state: '${state}', LastUpdateStatus: '${lastUpdateStatus}'`,
  );
}

/**
 * Wait for Lambda version to be available and ready for CloudFront association
 * @param functionName - The name of the Lambda function
 * @param version - The version number to check
 * @param credentials - AWS credentials
 * @param region - AWS region
 * @param maxRetries - Maximum number of retries (default: 15)
 * @param retryDelayMs - Delay between retries in milliseconds (default: 2000)
 */
async function waitForLambdaVersion(
  functionName: string,
  version: string,
  credentials: AwsCredentialIdentityProvider,
  region: string,
  maxRetries = 15,
  retryDelayMs = 2000,
): Promise<void> {
  let counter = 0;

  while (counter < maxRetries) {
    try {
      const res = await awsCli({
        credentials,
        region,
        options: { silent: true },
        args: ['lambda', 'get-function', '--function-name', functionName, '--qualifier', version],
      });

      const data = JSON.parse(res);
      const state = data.Configuration.State;
      const lastUpdateStatus = data.Configuration.LastUpdateStatus;

      // Version is ready when it's Active and LastUpdateStatus is Successful
      if (state === 'Active' && lastUpdateStatus === 'Successful') {
        return;
      }

      counter++;
      if (counter < maxRetries) {
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), retryDelayMs);
        });
      }
    } catch (_error) {
      // Version might not exist yet, continue retrying
      counter++;
      if (counter < maxRetries) {
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), retryDelayMs);
        });
      }
    }
  }

  throw new Error(
    `Lambda version '${version}' for function '${functionName}' was not ready after ${maxRetries} retries`,
  );
}

export const deployEdgeLambda = async (params: DeployLambdaParams): Promise<void> => {
  const targetArchive = 'lambda.zip';
  const lambdaSourceDir = './src/utils/routing/';
  const lambdaCompiledDir = './dist/src/utils/routing/';
  const lambdaPackageDir = './dist/edgeLambda/';

  // Static exports map every page deterministically to `<path>.html`, so the
  // handler no longer needs the routes manifest. Legacy handlers that still
  // import it keep the previous manifest injection behaviour.
  if (handlerUsesRoutesManifest(`${lambdaCompiledDir}lambda.js`)) {
    await injectRoutesManifest({
      sourceDir: lambdaSourceDir,
      compiledDir: lambdaCompiledDir,
    });
  }

  // pack source for Lambda Node.js runtime

  await rmSafe(lambdaPackageDir);
  mkdir('-p', lambdaPackageDir);

  await packageEdgeLambda({
    sourceFile: `${lambdaCompiledDir}lambda.js`,
    destFile: `${lambdaPackageDir}lambda.js`,
  });

  const functionName = readTerraformStateVariable(params.deploymentState, 'edge_function_name');
  const credentials = await getAWSUser(params.deployment.awsUser);
  const deployResult = await deployFunction({
    targetArchiveName: targetArchive,
    lambdaPackageDir,
    functionName,
    awsCredentials: credentials,
    region: 'us-east-1',
  });

  const { FunctionArn } = deployResult;

  // Wait for Lambda function to be fully active and ready for version publishing
  // The deployFunction already waits for Active state, but we also need to ensure
  // LastUpdateStatus is Successful before we can publish a version
  await waitForLambdaActive(functionName, credentials, 'us-east-1');

  const publishResults = await awsCli({
    credentials,
    region: 'us-east-1',
    args: ['lambda', 'publish-version', '--function-name', functionName],
  });

  const { Version } = JSON.parse(publishResults);

  const qualifiedArn = `${FunctionArn}:${Version}`;

  // Wait for the published Lambda version to be fully ready for CloudFront association
  // This ensures the version is active and available before updating CloudFront
  await waitForLambdaVersion(functionName, Version, credentials, 'us-east-1');

  const distributionId = readTerraformStateVariable(params.deploymentState, 'website_cdn_root_id');
  const cfDistributionResult = await awsCli({
    credentials,
    region: 'us-east-1',
    args: ['cloudfront', 'get-distribution-config', '--id', distributionId],
    options: { silent: true },
  });

  const cfDistribution = JSON.parse(cfDistributionResult);

  const eTag = cfDistribution.ETag;
  const lambdaFunctionAssociations =
    cfDistribution.DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations.Items;
  lambdaFunctionAssociations[0].LambdaFunctionARN = `${qualifiedArn}`;

  await rmSafe('./dist/cf.json');
  write(JSON.stringify(cfDistribution.DistributionConfig, null, 2), './dist/cf.json');
  await awsCli({
    credentials: credentials,
    region: 'us-east-1',
    args: [
      'cloudfront',
      'update-distribution',
      '--id',
      distributionId,
      '--distribution-config',
      'file://dist/cf.json',
      '--if-match',
      eTag,
    ],
    options: { silent: true },
  });
  await rmSafe('./dist/cf.json');
};
