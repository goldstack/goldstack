import type { AwsCredentialIdentity } from '@aws-sdk/types';
import {
  type AWSDeployment,
  type AWSTerraformState,
  assertTerraformConfig,
  getAWSCredentials,
  getAWSUser,
  type RemoteState,
  readDeploymentFromPackageConfig,
  writeTerraformConfig,
} from '@goldstack/infra-aws';
import {
  type CloudProvider,
  type TerraformDeployment,
  type TerraformOptions,
  terraformCli,
} from '@goldstack/utils-terraform';
import { type SpawnSyncOptionsWithStringEncoding, spawnSync } from 'child_process';
import crypto from 'crypto';
import os from 'os';
import { assertState, deleteState } from './tfState';

const getRemoteStateConfig = (config: AWSTerraformState, userName: string): RemoteState => {
  const userConfig = config.remoteState.filter((u) => u.user === userName);
  if (userConfig.length === 0) {
    throw new Error(`Cannot find aws user ${userName} in project terraform config`);
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

  getTfStateVariables = (deployment: TerraformDeployment): [string, string][] => {
    const remoteStateConfig = getRemoteStateConfig(
      this.remoteStateConfig,
      (deployment as AWSDeployment).awsUser,
    );
    const bucket = remoteStateConfig.terraformStateBucket;
    if (!bucket) {
      throw new Error(
        `TF state bucket not defined for user ${(deployment as AWSDeployment).awsUser}`,
      );
    }

    const ddTable = remoteStateConfig.terraformStateDynamoDBTable;
    if (!ddTable) {
      throw new Error(
        `TF state DynamoDB table not defined for user ${(deployment as AWSDeployment).awsUser}`,
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

  constructor(credentials: AwsCredentialIdentity, awsConfig: AWSTerraformState, region: string) {
    this.user = credentials;
    this.remoteStateConfig = awsConfig;
    this.region = region;
  }
}

const prompt = (message: string) => {
  process.stdout.write(message);

  let cmd: string;
  let args: string[];
  if (os.platform() === 'win32') {
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
  options?: TerraformOptions,
): Promise<void> => {
  const ignoreMissingDeployments = args.includes('--ignore-missing-deployments');

  let awsTerraformConfig: AWSTerraformState;
  let deployment: AWSDeployment;
  let credentials: AwsCredentialIdentity;
  let awsProvider: AWSCloudProvider;

  try {
    const envResult = await initTerraformEnvironment(args);
    ({ awsTerraformConfig, deployment, credentials, awsProvider } = envResult);
  } catch (e) {
    if (ignoreMissingDeployments) {
      console.warn(`Warning: Deployment '${args[1]}' does not exist. Skipping operation.`);
      return;
    }
    throw e;
  }

  const projectHash = crypto.randomBytes(20).toString('hex');

  const remoteStateConfig = getRemoteStateConfig(
    awsTerraformConfig,
    (deployment as AWSDeployment).awsUser,
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
          'Otherwise, press enter.\nYour Input: ',
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

  await assertState({
    bucketName: remoteStateConfig.terraformStateBucket,
    dynamoDBTableName: remoteStateConfig.terraformStateDynamoDBTable,
    credentials,
    awsRegion: deployment.awsRegion,
  });

  if (operation === 'create-state') {
    // using this operation, we only create the state and do nothing else.
    return;
  }

  terraformCli(args, {
    ...options,
    provider: awsProvider,
  });
};

export async function initTerraformEnvironment(args: string[]) {
  const deploymentName = args[1];

  const deployment = readDeploymentFromPackageConfig({
    deploymentName,
  });

  const awsUser = await getAWSUser(deployment.awsUser);
  const credentials = await getAWSCredentials(awsUser);

  const awsTerraformConfig = assertTerraformConfig(deployment.awsUser);

  const awsProvider = new AWSCloudProvider(credentials, awsTerraformConfig, deployment.awsRegion);
  return { awsTerraformConfig, deployment, credentials, awsProvider };
}
