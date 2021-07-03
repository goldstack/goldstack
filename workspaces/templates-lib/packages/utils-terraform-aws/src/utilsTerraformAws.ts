import {
  readDeploymentFromPackageConfig,
  getAWSUser,
  readConfig,
  writeConfig,
  AWSConfiguration,
} from '@goldstack/infra-aws';
import { terraformCli, CloudProvider } from '@goldstack/utils-terraform';
import { sh } from '@goldstack/utils-sh';
import AWS, { FileSystemCredentials } from 'aws-sdk';
import { createState } from './tfState';
import cryto from 'crypto';

export class AWSCloudProvider implements CloudProvider {
  user: AWS.Credentials;
  awsConfig: AWSConfiguration;

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

  getAWSConfig = (): AWSConfiguration => {
    return this.awsConfig;
  };

  constructor(credentials: AWS.Credentials, awsConfig: AWSConfiguration) {
    this.user = credentials;
    this.awsConfig = awsConfig;
  }
}

export const terraformAwsCli = async (args: string[]): Promise<void> => {
  const deploymentName = args[1];

  const deployment = readDeploymentFromPackageConfig(deploymentName);

  const credentials = await getAWSUser(deployment.awsUser);

  const awsConfig = readConfig();

  const projectHash = cryto.randomBytes(20).toString('hex');
  if (!awsConfig.terraformStateBucket) {
    awsConfig.terraformStateBucket = `goldstack-tfstate-${projectHash}`;
    writeConfig(awsConfig);
  }
  if (!awsConfig.terraformStateDynamoDBTable) {
    awsConfig.terraformStateDynamoDBTable = `goldstack-tfstate-${projectHash}-lock`;
    writeConfig(awsConfig);
  }

  await createState({
    bucketName: awsConfig.terraformStateDynamoDBTable,
    dynamoDBTableName: awsConfig.terraformStateDynamoDBTable,
    credentials,
  });

  terraformCli(args, {
    provider: new AWSCloudProvider(credentials, awsConfig),
  });
};
