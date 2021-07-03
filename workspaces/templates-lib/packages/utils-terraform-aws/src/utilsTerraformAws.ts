import {
  readDeploymentFromPackageConfig,
  getAWSUser,
  readConfig,
  writeConfig,
  AWSConfiguration,
  AWSDeployment,
  AWSUser,
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

const getAWSUserFromConfig = (
  config: AWSConfiguration,
  userName: string
): AWSUser => {
  const userConfig = config.users.filter((u) => u.name === userName);
  if (userConfig.length === 0) {
    throw new Error(`Cannot find aws user ${userName}`);
  }
  return userConfig[0];
};

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

  getTfStateVariables = (
    deployment: TerraformDeployment
  ): [string, string][] => {
    const awsUserConfig = getAWSUserFromConfig(
      this.awsConfig,
      (deployment as AWSDeployment).awsUser
    );
    const bucket = awsUserConfig.config.terraformStateBucket;
    if (!bucket) {
      throw new Error(
        `TF state bucket not defined for user ${
          (deployment as AWSDeployment).awsUser
        }`
      );
    }

    const ddTable = awsUserConfig.config.terraformStateDynamoDBTable;
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

  const projectHash = crypto.randomBytes(20).toString('hex');

  const awsUserConfig = getAWSUserFromConfig(
    awsConfig,
    (deployment as AWSDeployment).awsUser
  );
  if (!awsUserConfig.config.terraformStateBucket) {
    awsUserConfig.config.terraformStateBucket = `goldstack-tfstate-${projectHash}`;
    writeConfig(awsConfig);
  }
  if (!awsUserConfig.config.terraformStateDynamoDBTable) {
    awsUserConfig.config.terraformStateDynamoDBTable = `goldstack-tfstate-${projectHash}-lock`;
    writeConfig(awsConfig);
  }

  await createState({
    bucketName: awsUserConfig.config.terraformStateBucket,
    dynamoDBTableName: awsUserConfig.config.terraformStateDynamoDBTable,
    credentials,
  });

  terraformCli(args, {
    provider: new AWSCloudProvider(credentials, awsConfig),
  });
};
