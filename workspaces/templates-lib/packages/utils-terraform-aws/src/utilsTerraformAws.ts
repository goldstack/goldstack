import {
  readDeploymentFromPackageConfig,
  getAWSUser,
  AWSDeployment,
  assertTerraformConfig,
  writeTerraformConfig,
  AWSTerraformState,
  RemoteState,
  getAWSCredentials,
} from '@goldstack/infra-aws';
import {
  terraformCli,
  CloudProvider,
  TerraformDeployment,
  TerraformOptions,
} from '@goldstack/utils-terraform';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { createState, deleteState } from './tfState';
import crypto from 'crypto';
import { spawnSync, SpawnSyncOptionsWithStringEncoding } from 'child_process';

import os from 'os';

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
  user: AwsCredentialIdentity;
  region: string;
  remoteStateConfig: AWSTerraformState;

  generateEnvVariableString = (): string => {
    return (
      `-e AWS_ACCESS_KEY_ID=${this.user.accessKeyId} ` +
      `-e AWS_SECRET_ACCESS_KEY=${this.user.secretAccessKey} ` +
      `-e AWS_SESSION_TOKEN=${this.user.sessionToken || ''} ` +
      `-e AWS_DEFAULT_REGION=${this.region} `
    );
  };

  setEnvVariables = (): void => {
    process.env.AWS_ACCESS_KEY_ID = this.user.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = this.user.secretAccessKey;
    process.env.AWS_DEFAULT_REGION = this.region;
    process.env.AWS_SESSION_TOKEN = this.user.sessionToken || '';
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

    const tfKey = (deployment as TerraformDeployment).tfStateKey;

    if (!tfKey) {
      throw new Error('Terraform state key not defined');
    }

    return [
      ['bucket', bucket],
      ['key', `${tfKey}`],
      ['region', this.region],
      ['dynamodb_table', ddTable],
    ];
  };

  constructor(
    credentials: AwsCredentialIdentity,
    awsConfig: AWSTerraformState,
    region: string
  ) {
    this.user = credentials;
    this.remoteStateConfig = awsConfig;
    this.region = region;
  }
}

const prompt = (message: string) => {
  process.stdout.write(message);

  let cmd: string;
  let args: string[];
  if (os.platform() == 'win32') {
    cmd = 'cmd';
    args = ['/V:ON', '/C', 'set /p response= && echo !response!'];
  } else {
    cmd = 'bash';
    args = ['-c', 'read response; echo "$response"'];
  }

  const opts: SpawnSyncOptionsWithStringEncoding = {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: false,
    encoding: 'utf-8',
  };

  return spawnSync(cmd, args, opts).stdout.toString().trim();
};

export const terraformAwsCli = async (
  args: string[],
  options?: TerraformOptions
): Promise<void> => {
  const deploymentName = args[1];

  const deployment = readDeploymentFromPackageConfig(deploymentName);

  const provider = await getAWSUser(deployment.awsUser);
  const credentials = await getAWSCredentials(provider);

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

  const [operation] = args;
  if (operation === 'destroy-state') {
    const ciConfirmed = args.find((str) => str === '-y');
    if (!ciConfirmed) {
      const value = prompt(
        'Are you sure to destroy your remote deployment state? If yes, please type `y` and enter.\n' +
          'Otherwise, press enter.\nYour Input: '
      );
      if (value !== 'y') {
        new Error('Prompt not confirmed with `y`');
      }
    }
    await deleteState({
      bucketName: remoteStateConfig.terraformStateBucket,
      dynamoDBTableName: remoteStateConfig.terraformStateDynamoDBTable,
      credentials,
      awsRegion: deployment.awsRegion,
    });
    return;
  }

  await createState({
    bucketName: remoteStateConfig.terraformStateBucket,
    dynamoDBTableName: remoteStateConfig.terraformStateDynamoDBTable,
    credentials,
    awsRegion: deployment.awsRegion,
  });

  terraformCli(args, {
    ...options,
    provider: new AWSCloudProvider(
      credentials,
      awsTerraformConfig,
      deployment.awsRegion
    ),
  });
};
