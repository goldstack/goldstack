import assert from 'assert';
import {
  AWSConfiguration,
  AWSRegion,
  AWSProfileConfig,
  AWSAPIKeyUserConfig,
  AWSEnvironmentVariableUserConfig,
} from './types/awsAccount';
import AWS from 'aws-sdk';

export async function getAWSUserFromEnvironmentVariables(): Promise<AWS.Credentials> {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS_ACCESS_KEY_ID not defined.');
  assert(
    process.env.AWS_SECRET_ACCESS_KEY,
    'AWS_SECRET_ACCESS_KEY not defined'
  );
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  assert(region, 'Neither AWS_REGION nor AWS_DEFAULT_REGION are defined.');
  const credentials = new AWS.EnvironmentCredentials('AWS');
  await credentials.getPromise();
  AWS.config.credentials = credentials;

  AWS.config.update({ region });

  return credentials;
}
/**
 * Obtains AWS user credentials from container environment variables for ECS containers.
 */
export async function getAWSUserFromContainerEnvironment(): Promise<AWS.ECSCredentials> {
  const ecsCredentials = new AWS.ECSCredentials({
    httpOptions: { timeout: 5000 },
    maxRetries: 10, // retry 10 times
  });
  await ecsCredentials.getPromise();

  AWS.config.credentials = ecsCredentials;

  if (!process.env.AWS_REGION) {
    throw new Error(
      'AWS region environment variable ("AWS_REGION") not defined for ECS task.'
    );
  }

  AWS.config.update({ region: process.env.AWS_REGION });

  return ecsCredentials;
}

export async function getAWSUserFromDefaultLocalProfile(): Promise<AWS.Credentials> {
  let credentials = new AWS.SharedIniFileCredentials();

  // if no access key is found, try loading process_credentials
  if (!credentials.accessKeyId) {
    credentials = new AWS.ProcessCredentials();
    await credentials.refreshPromise();
  }

  AWS.config.credentials = credentials;
  // see https://github.com/aws/aws-sdk-js/pull/1391
  process.env.AWS_SDK_LOAD_CONFIG = 'true';
  return credentials;
}

export async function getAWSUserFromGoldstackConfig(
  config: AWSConfiguration,
  userName: string
): Promise<AWS.Credentials> {
  const user = config.users.find((user) => user.name === userName);
  if (!user) {
    throw new Error(`User '${userName}' does not exist in AWS configuration.`);
  }

  if (user.type === 'profile') {
    const userConfig = user.config as AWSProfileConfig;

    if (process.env.AWS_SHARED_CREDENTIALS_FILE) {
      console.warn(
        'Using AWS_SHARED_CREDENTIALS_FILE environment variable. awsConfigFileName in configuration will be ignored.'
      );
    }

    // support loading from both `config` and `credentials` files, see https://github.com/goldstack/goldstack/issues/17#issuecomment-1044811805
    // process.env.AWS_SDK_LOAD_CONFIG = '1';

    let credentials: AWS.Credentials;
    if (userConfig.credentialsSource !== 'process') {
      credentials = new AWS.SharedIniFileCredentials({
        profile: userConfig.profile,
        filename:
          process.env.AWS_SHARED_CREDENTIALS_FILE ||
          userConfig.awsConfigFileName,
      });
    } else {
      credentials = new AWS.ProcessCredentials({
        profile: userConfig.profile,
        filename:
          process.env.AWS_SHARED_CREDENTIALS_FILE ||
          userConfig.awsConfigFileName,
      });
      await credentials.refreshPromise();
    }

    if (!credentials.accessKeyId) {
      throw new Error(
        'Cannot load profile ' +
          userConfig.profile +
          ' from AWS configuration for user ' +
          user.name +
          '. Please perform `aws login` for the profile using the AWS CLI.'
      );
    }
    AWS.config.credentials = credentials;
    AWS.config.update({ region: userConfig.awsDefaultRegion });
    return credentials;
  }

  if (user.type === 'apiKey') {
    const config = user.config as AWSAPIKeyUserConfig;
    if (!config.awsAccessKeyId || !config.awsSecretAccessKey) {
      throw new Error(
        `AWS Access credentials not defined for user ${userName}. Define them in infra/aws/config.json.`
      );
    }
    const credentials = new AWS.Credentials({
      accessKeyId: config.awsAccessKeyId || '',
      secretAccessKey: config.awsSecretAccessKey || '',
    });
    AWS.config.credentials = credentials;
    AWS.config.update({ region: config.awsDefaultRegion });
    return credentials;
  }

  if (user.type === 'environmentVariables') {
    const userConfig = user.config as AWSEnvironmentVariableUserConfig;

    const awsAccessKeyId = process.env[userConfig.awsAccessKeyIdVariableName];
    if (!awsAccessKeyId) {
      throw new Error(
        `Environment variable expected but not found: ${userConfig.awsAccessKeyIdVariableName}`
      );
    }

    const awsSecretAccessKey =
      process.env[userConfig.awsSecretAccessKeyVariableName];
    if (!awsSecretAccessKey) {
      throw new Error(
        `Environment variable expected but not found: ${userConfig.awsSecretAccessKeyVariableName}`
      );
    }

    const awsDefaultRegion = process.env[
      userConfig.awsDefaultRegionVariableName
    ] as AWSRegion;
    if (!awsDefaultRegion) {
      throw new Error(
        `Environment variable expected but not found: ${userConfig.awsDefaultRegionVariableName}`
      );
    }

    const credentials = new AWS.Credentials({
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    });
    AWS.config.credentials = credentials;
    AWS.config.update({ region: awsDefaultRegion });
    return credentials;
  }

  throw new Error(`Unknown user config type ${user.type}`);
}
