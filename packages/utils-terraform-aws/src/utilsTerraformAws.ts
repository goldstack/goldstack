import {
  readDeploymentFromPackageConfig,
  getAWSUser,
} from '@goldstack/infra-aws';
import { terraformCli, CloudProvider } from '@goldstack/utils-terraform';
import { sh } from '@goldstack/utils-sh';
import AWS from 'aws-sdk';

export class AWSCloudProvider implements CloudProvider {
  user: AWS.Credentials;

  generateEnvVariableString = (): string => {
    return (
      `-e AWS_ACCESS_KEY_ID=${this.user.accessKeyId} ` +
      `-e AWS_SECRET_ACCESS_KEY=${this.user.secretAccessKey} ` +
      `-e AWS_SESSION_TOKEN=${this.user.sessionToken || ''} ` +
      `-e AWS_DEFAULT_REGION=${AWS.config.region} `
    );
  };

  setEnvVariables = (): void => {
    sh.env['AWS_ACCESS_KEY_ID'] = this.user.accessKeyId;
    sh.env['AWS_SECRET_ACCESS_KEY'] = this.user.secretAccessKey;
    sh.env['AWS_DEFAULT_REGION'] = AWS.config.region;
    sh.env['AWS_SESSION_TOKEN'] = this.user.sessionToken || '';
  };

  constructor(credentials: AWS.Credentials) {
    this.user = credentials;
  }
}

export const terraformAwsCli = async (args: string[]): Promise<void> => {
  const deploymentName = args[1];

  const deployment = readDeploymentFromPackageConfig(deploymentName);

  const credentials = await getAWSUser(deployment.awsUser);
  terraformCli(args, { provider: new AWSCloudProvider(credentials) });
};
