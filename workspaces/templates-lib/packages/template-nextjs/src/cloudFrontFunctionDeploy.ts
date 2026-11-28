import type { DeploymentState } from '@goldstack/infra';
import { getAWSUser } from '@goldstack/infra-aws';
import { awsCli } from '@goldstack/utils-aws-cli';
import { mkdir, rmSafe } from '@goldstack/utils-sh';
import { packageCloudFrontFunction } from './cloudFrontFunctionPackage';
import { handlerUsesRoutesManifest, injectRoutesManifest } from './routesManifest';
import type { NextjsDeployment } from './types/NextJsPackage';

interface DeployFunctionParams {
  deployment: NextjsDeployment;
  deploymentState: DeploymentState;
}

export const deployCloudFrontFunction = async (params: DeployFunctionParams): Promise<void> => {
  const functionSourceDir = './src/utils/routing/';
  const functionCompiledDir = './dist/src/utils/routing/';
  const functionPackageDir = './dist/cloudFrontFunction/';

  // Static exports map every page deterministically to `<path>.html`, so the
  // handler no longer needs the routes manifest. Legacy handlers that still
  // import it keep the previous manifest injection behaviour.
  if (handlerUsesRoutesManifest(`${functionCompiledDir}lambda.js`)) {
    await injectRoutesManifest({
      sourceDir: functionSourceDir,
      compiledDir: functionCompiledDir,
    });
  }

  // Package source for CloudFront Functions runtime
  await rmSafe(functionPackageDir);
  mkdir('-p', functionPackageDir);

  await packageCloudFrontFunction({
    sourceFile: `${functionCompiledDir}lambda.js`,
    destFile: `${functionPackageDir}function.js`,
  });

  // Deploy the function code via CloudFront API
  // Since Terraform ignores changes to the function code, we can update it here
  const functionName = params.deploymentState.terraform?.routing_function_name?.value;
  if (!functionName) {
    throw new Error(
      'CloudFront routing function name not found in deployment state. Ensure Terraform outputs are properly loaded.',
    );
  }
  const credentials = await getAWSUser(params.deployment.awsUser);

  // Get ETag for update - function must exist (created by Terraform)
  let eTag = '';
  try {
    const describeResult = await awsCli({
      credentials,
      region: 'us-east-1',
      args: ['cloudfront', 'describe-function', '--name', functionName],
      options: { silent: true },
    });
    const describeData = JSON.parse(describeResult);
    eTag = describeData.ETag;
  } catch (error) {
    throw new Error(
      `CloudFront function '${functionName}' does not exist. Please ensure Terraform infrastructure is set up first.`,
    );
  }

  try {
    // Update the existing function
    const updateResult = await awsCli({
      credentials,
      region: 'us-east-1',
      args: [
        'cloudfront',
        'update-function',
        '--name',
        functionName,
        '--function-config',
        'Comment=Next.js routing function,Runtime=cloudfront-js-2.0',
        '--function-code',
        `fileb://${functionPackageDir}function.js`,
        '--if-match',
        eTag,
      ],
      options: { silent: true },
    });
    const updateData = JSON.parse(updateResult);
    const updatedETag = updateData.ETag;

    // Publish the updated function
    await awsCli({
      credentials,
      region: 'us-east-1',
      args: ['cloudfront', 'publish-function', '--name', functionName, '--if-match', updatedETag],
      options: { silent: true },
    });
  } catch (error) {
    console.error(`Failed to update or publish CloudFront function '${functionName}':`, error);
    throw new Error(
      `Failed to update or publish CloudFront function '${functionName}'. Please check AWS permissions and function status.`,
    );
  }
};
