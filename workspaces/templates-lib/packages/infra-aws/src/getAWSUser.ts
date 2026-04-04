import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { info } from '@goldstack/utils-log';
import {
  getAWSUserFromContainerEnvironment,
  getAWSUserFromDefaultLocalProfile,
  getAWSUserFromEnvironmentVariables,
  getAWSUserFromGoldstackConfig,
} from './awsUserUtils';
import { hasConfig, readConfig } from './infraAws';

/**
 * Obtains AWS user credentials from config file or environment variables.
 */

export const getAWSUser = async (
  userName: string,
  configPath?: string,
): Promise<AwsCredentialIdentityProvider> => {
  // Load from ECS environment if running in ECS
  if (process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
    return await getAWSUserFromContainerEnvironment();
  }

  // Load credentials from environment variables if available
  if (process.env.AWS_ACCESS_KEY_ID) {
    return await getAWSUserFromEnvironmentVariables();
  }

  // Try loading default local user first (supports 'aws login')
  try {
    const defaultProfile = await getAWSUserFromDefaultLocalProfile();
    info('Using default AWS profile obtained from aws login.');
    return defaultProfile;
  } catch {
    // Fall through to Goldstack config
  }

  // Load users as configured in Goldstack configuration
  if (!hasConfig(configPath)) {
    throw new Error("No AWS credentials found. Please run 'aws login' or configure Goldstack.");
  }

  const config = readConfig(configPath);
  return await getAWSUserFromGoldstackConfig(config, userName);
};
