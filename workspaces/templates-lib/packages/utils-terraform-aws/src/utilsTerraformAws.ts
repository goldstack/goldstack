import {
  readDeploymentFromPackageConfig,
  getAWSUser,
  AWSDeployment,
  assertTerraformConfig,
  writeTerraformConfig,
  AWSTerraformState,
  RemoteState,
} from '@goldstack/infra-aws';
import {
  terraformCli,
  CloudProvider,
  TerraformDeployment,
} from '@goldstack/utils-terraform';
import { sh } from '@goldstack/utils-sh';
import AWS from 'aws-sdk';
import { createState } from './tfState';
import crypto from 'crypto';

const getRemoteStateConfig = (
  config: AWSTerraformState,
  userName: string
): RemoteState => {
  const userConfig = config.remoteState.filter((u) => u.user === userName);
  if (userConfig.length === 0) {
    throw new Error(
      `Cannot find aws user ${userName} in project terraform config`
    );
  }
  return userConfig[0];
};

export class AWSCloudProvider implements CloudProvider {
  user: AWS.Credentials;
  remoteStateConfig: AWSTerraformState;

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

  getTfStateVariables = (
    deployment: TerraformDeployment
  ): [string, string][] => {
    const remoteStateConfig = getRemoteStateConfig(
      this.remoteStateConfig,
      (deployment as AWSDeployment).awsUser
    );
    const bucket = remoteStateConfig.terraformStateBucket;
    if (!bucket) {
      throw new Error(
        `TF state bucket not defined for user ${
          (deployment as AWSDeployment).awsUser
        }`
      );
    }

    const ddTable = remoteStateConfig.terraformStateDynamoDBTable;
    if (!ddTable) {
      throw new Error(
        `TF state DynamoDB table not defined for user ${
          (deployment as AWSDeployment).awsUser
        }`
      );
    }

    if (!AWS.config.region) {
      throw new Error('AWS region not defined');
    }

    const tfKey = (deployment as TerraformDeployment).tfStateKey;

    if (!tfKey) {
      throw new Error('Terraform state key not defined');
    }

    return [
      ['bucket', bucket],
      ['key', `${tfKey}`],
      ['region', AWS.config.region],
      ['dynamodb_table', ddTable],
    ];
  };

  constructor(credentials: AWS.Credentials, awsConfig: AWSTerraformState) {
    this.user = credentials;
    this.remoteStateConfig = awsConfig;
  }
}

export const terraformAwsCli = async (args: string[]): Promise<void> => {
  const deploymentName = args[1];

  const deployment = readDeploymentFromPackageConfig(deploymentName);

  const credentials = await getAWSUser(deployment.awsUser);

  const awsTerraformConfig = assertTerraformConfig(deployment.awsUser);

  const projectHash = crypto.randomBytes(20).toString('hex');

  const remoteStateConfig = getRemoteStateConfig(
    awsTerraformConfig,
    (deployment as AWSDeployment).awsUser
  );
  if (!remoteStateConfig.terraformStateBucket) {
    remoteStateConfig.terraformStateBucket = `goldstack-tfstate-${projectHash}`;
    writeTerraformConfig(awsTerraformConfig);
  }
  if (!remoteStateConfig.terraformStateDynamoDBTable) {
    remoteStateConfig.terraformStateDynamoDBTable = `goldstack-tfstate-${projectHash}-lock`;
    writeTerraformConfig(awsTerraformConfig);
  }

  await createState({
    bucketName: remoteStateConfig.terraformStateBucket,
    dynamoDBTableName: remoteStateConfig.terraformStateDynamoDBTable,
    credentials,
  });

  terraformCli(args, {
    provider: new AWSCloudProvider(credentials, awsTerraformConfig),
  });
};
