import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import {
  fromContainerMetadata,
  fromEnv,
  fromIni,
  fromProcess,
} from '@aws-sdk/credential-providers';
import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { warn } from '@goldstack/utils-log';
import assert from 'assert';
import { hasInjectedCredentials, injectCredentials } from './awsAuthUtils';
import type {
  AWSAPIKeyUserConfig,
  AWSConfiguration,
  AWSEnvironmentVariableUserConfig,
  AWSProfileConfig,
  AWSRegion,
} from './types/awsAccount';

export async function getAWSUserFromEnvironmentVariables(): Promise<AwsCredentialIdentityProvider> {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS_ACCESS_KEY_ID not defined.');
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS_SECRET_ACCESS_KEY not defined');
  const credentials: AwsCredentialIdentityProvider = fromEnv();

  injectCredentials(credentials, {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  return credentials;
}
/**
 * Obtains AWS user credentials from container environment variables for ECS containers.
 */
export async function getAWSUserFromContainerEnvironment(): Promise<AwsCredentialIdentityProvider> {
  const ecsCredentials = fromContainerMetadata({
    timeout: 5000,
    maxRetries: 10, // retry 10 times
  });

  if (!process.env.AWS_REGION) {
    throw new Error('AWS region environment variable ("AWS_REGION") not defined for ECS task.');
  }

  return ecsCredentials;
}

async function validateCredentials(credentials: AwsCredentialIdentityProvider): Promise<boolean> {
  if (hasInjectedCredentials(credentials)) {
    return true;
  }
  const client = new STSClient({
    credentials,
  });
  const input = {};
  const command = new GetCallerIdentityCommand(input);
  try {
    const response = await client.send(command);
    if (!response.Account) {
      return false;
    }
  } catch (_e) {
    return false;
  }
  return true;
}

export async function getAWSUserFromDefaultLocalProfile(): Promise<AwsCredentialIdentityProvider> {
  let credentials = fromIni();

  const envVarValues = {
    AWS_SDK_LOAD_CONFIG: process.env.AWS_SDK_LOAD_CONFIG,
  };

  if (!(await validateCredentials(credentials))) {
    warn('Cannot load credentials from INI file. Trying process credentials instead.');
    // if no access key is found, try loading process_credentials
    // see https://github.com/aws/aws-sdk-js/pull/1391
    process.env.AWS_SDK_LOAD_CONFIG = '1';
    credentials = fromProcess();
  }

  resetEnvironmentVariables(envVarValues);

  return credentials;
}

export async function getAWSUserFromGoldstackConfig(
  config: AWSConfiguration,
  userName: string,
): Promise<AwsCredentialIdentityProvider> {
  const user = config.users.find((user) => user.name === userName);
  if (!user) {
    throw new Error(`User '${userName}' does not exist in AWS configuration.`);
  }

  if (user.type === 'profile') {
    const userConfig = user.config as AWSProfileConfig;

    if (process.env.AWS_SHARED_CREDENTIALS_FILE) {
      warn(
        `Using AWS_SHARED_CREDENTIALS_FILE environment variable: '${process.env.AWS_SHARED_CREDENTIALS_FILE}'. awsCredentialsFileName in configuration will be ignored.`,
      );
    }

    const envVarValues = {
      AWS_SDK_LOAD_CONFIG: process.env.AWS_SDK_LOAD_CONFIG,
      AWS_SHARED_CREDENTIALS_FILE: process.env.AWS_SHARED_CREDENTIALS_FILE,
      AWS_CONFIG_FILE: process.env.AWS_CONFIG_FILE,
    };

    if (userConfig.awsConfigFileName) {
      // support loading from both `config` and `credentials` files, see https://github.com/goldstack/goldstack/issues/17#issuecomment-1044811805  https://github.com/aws/aws-sdk-js/pull/1391
      process.env.AWS_SDK_LOAD_CONFIG = '1';
      // filename property is ignored if AWS_SDK_LOAD_CONFIG is set; thus need to set AWS_SHARED_CREDENTIALS_FILE.
      process.env.AWS_SHARED_CREDENTIALS_FILE = userConfig.awsCredentialsFileName;
      process.env.AWS_CONFIG_FILE = userConfig.awsConfigFileName;
    }

    let credentials: AwsCredentialIdentityProvider;
    let filename: string | undefined;
    if (!process.env.SHARE_CREDENTIALS_FILE) {
      filename = userConfig.awsCredentialsFileName;
    }

    if (userConfig.credentialsSource !== 'process') {
      credentials = fromIni({
        profile: userConfig.profile,
        filepath: filename,
      });
    } else {
      // Allow `AWS.ProcessCredentials` to search the default config location `~/.aws/config` in addition to `credentials`
      // This matches most other CLI / SDK implementations (including AWS JS SDK v3) and the behaviour of most `credential_process` helper tools
      // With this enabled, `AWS_CONFIG_FILE` must not contains an invalid path, but `AWS_SHARED_CREDENTIALS_FILE` can be missing.

      if (!userConfig.awsCredentialsFileName) {
        process.env.AWS_SDK_LOAD_CONFIG = '1';
      }

      credentials = fromProcess({
        profile: userConfig.profile,
        filepath: filename,
      });
    }

    resetEnvironmentVariables(envVarValues);

    // if (!(await validateCredentials(credentials))) {
    //   throw new Error(
    //     'Cannot load profile ' +
    //       userConfig.profile +
    //       ' from AWS configuration for user ' +
    //       user.name +
    //       '. Please perform `aws login` for the profile using the AWS CLI.'
    //   );
    // }

    return credentials;
  }

  if (user.type === 'apiKey') {
    const config = user.config as AWSAPIKeyUserConfig;
    if (!config.awsAccessKeyId || !config.awsSecretAccessKey) {
      throw new Error(
        `AWS Access credentials not defined for user ${userName}. Define them in infra/aws/config.json.`,
      );
    }

    process.env.AWS_ACCESS_KEY_ID = config.awsAccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = config.awsSecretAccessKey;

    const credentials = fromEnv();
    injectCredentials(credentials, {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    });
    return credentials;
  }

  if (user.type === 'environmentVariables') {
    const userConfig = user.config as AWSEnvironmentVariableUserConfig;

    const awsAccessKeyId = process.env[userConfig.awsAccessKeyIdVariableName];
    if (!awsAccessKeyId) {
      throw new Error(
        `Environment variable expected but not found: ${userConfig.awsAccessKeyIdVariableName}`,
      );
    }

    const awsSecretAccessKey = process.env[userConfig.awsSecretAccessKeyVariableName];
    if (!awsSecretAccessKey) {
      throw new Error(
        `Environment variable expected but not found: ${userConfig.awsSecretAccessKeyVariableName}`,
      );
    }

    const awsDefaultRegion = process.env[userConfig.awsDefaultRegionVariableName] as AWSRegion;
    if (!awsDefaultRegion) {
      throw new Error(
        `Environment variable expected but not found: ${userConfig.awsDefaultRegionVariableName}`,
      );
    }

    process.env.AWS_ACCESS_KEY_ID = awsAccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = awsSecretAccessKey;
    const credentials = fromEnv();

    injectCredentials(credentials, {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    return credentials;
  }

  throw new Error(`Unknown user config type ${user.type}`);
}
function resetEnvironmentVariables(envVarValues: { [key: string]: string | undefined }) {
  Object.entries(envVarValues).forEach(([key, value]) => {
    if (process.env[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
}
