import { fatal } from '@goldstack/utils-log';
import { upload } from '@goldstack/utils-s3-deployment';
import { assertDirectoryExists } from '@goldstack/utils-sh';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import path from 'path';
import type {
  AWSStaticWebsiteDeployment,
  AWSStaticWebsitePackage,
} from './types/AWSStaticWebsitePackage';

export interface InfraAwsStaticWebsiteCliParams {
  operation: string;
  deploymentName: string;
  targetVersion?: string;
  confirm?: boolean;
  commandArgs?: string[];
}

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
};

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
    skipConfirmations: false,
    options: undefined,
  });
};
