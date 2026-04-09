import { readDeploymentState, readTerraformStateVariable } from '@goldstack/infra';
import { getAWSUser } from '@goldstack/infra-aws';
import { awsCli } from '@goldstack/utils-aws-cli';
import { fatal, info, warn } from '@goldstack/utils-log';
import { upload } from '@goldstack/utils-s3-deployment';
import { assertDirectoryExists } from '@goldstack/utils-sh';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import path from 'path';
import type {
  AWSStaticWebsiteDeployment,
  AWSStaticWebsitePackage,
} from './types/AWSStaticWebsitePackage';

/**
 * @description Parameters for AWS Static Website CLI operations.
 */
export interface InfraAwsStaticWebsiteCliParams {
  /** The operation to perform, such as 'deploy' or 'plan'. */
  operation: string;
  /** The name of the deployment. */
  deploymentName: string;
  /** Optional target version for upgrades. */
  targetVersion?: string;
  /** Optional confirmation flag. */
  confirm?: boolean;
  /** Optional flag to skip confirmations. */
  skipConfirmations?: boolean;
  /** Optional additional command arguments. */
  commandArgs?: string[];
}

/**
 * @description Retrieves the deployment configuration by name from the package config.
 * @param config - The AWS Static Website package configuration.
 * @param args - Command line arguments containing the deployment name.
 * @returns The deployment configuration.
 */
const getDeployment = (
  config: AWSStaticWebsitePackage,
  args: string[],
): AWSStaticWebsiteDeployment => {
  if (args.length < 1) {
    fatal('Please specify the name of the deployment.');
  }
  const name = args[0];

  const deployment = config.deployments.find((deployment) => deployment.name === name);

  if (!deployment) {
    fatal(`Cannot find configuration for deployment '${name}''`);
    throw new Error('Cannot parse configuration.');
  }

  return deployment;
};

/**
 * @description Deploys the static website artifacts to AWS S3.
 * @param config - The AWS Static Website package configuration.
 * @param args - Command line arguments.
 */
export const deploy = async (config: AWSStaticWebsitePackage, args: string[]): Promise<void> => {
  const deployment = getDeployment(config, args);

  const webDistDir = path.resolve('./webDist');
  assertDirectoryExists(webDistDir, 'Cannot upload website artifacts.');
  await upload({
    userName: deployment.awsUser,
    bucket: `${deployment.configuration.websiteDomain}-root`,
    region: deployment.awsRegion,
    bucketPath: '/',
    localPath: webDistDir,
  });

  const deploymentState = readDeploymentState('./', deployment.name);
  const distributionId = readTerraformStateVariable(deploymentState, 'website_cdn_root_id');

  if (distributionId) {
    const user = await getAWSUser(deployment.awsUser);
    info(`Invalidating CloudFront cache for distribution ${distributionId}`);

    await awsCli({
      command: `cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*"`,
      credentials: user,
      region: deployment.awsRegion,
      options: { silent: false },
    });
  } else {
    warn(
      'Could not find website_cdn_root_id in Terraform state. Skipping CloudFront invalidation.',
    );
  }
};

/**
 * @description Main CLI handler for AWS Static Website infrastructure operations.
 * @param config - The AWS Static Website package configuration.
 * @param params - CLI parameters.
 */
export const infraAwsStaticWebsiteCli = async (
  config: AWSStaticWebsitePackage,
  params: InfraAwsStaticWebsiteCliParams,
): Promise<void> => {
  if (params.operation === 'deploy') {
    await deploy(config, [params.deploymentName]);
    return;
  }

  await terraformAwsCli({
    infraOperation: params.operation,
    deploymentName: params.deploymentName,
    targetVersion: params.targetVersion,
    confirm: params.confirm,
    commandArguments: params.commandArgs,
    ignoreMissingDeployments: false,
    skipConfirmations: params.skipConfirmations ?? false,
    options: undefined,
  });
};
