import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { info } from '@goldstack/utils-log';
import fs from 'fs';
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
  if (configPath && fs.existsSync(configPath)) {
    info(`Obtaining credentials from goldstack config file in ${configPath}`);
    const config = readConfig(configPath);
    try {
      return await getAWSUserFromGoldstackConfig(config, userName);
    } catch (error) {
      if (error instanceof Error && error.message.includes('does not exist in AWS configuration')) {
        info(
          `User '${userName}' not found in goldstack config. Falling back to default profile from aws login.`,
        );
        return await getAWSUserFromDefaultLocalProfile();
      }
      throw error;
    }
  }

  // Load from ECS environment if running in ECS
  if (process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
    return await getAWSUserFromContainerEnvironment();
  }

  // Load credentials from environment variables if available
  if (process.env.AWS_ACCESS_KEY_ID) {
    return await getAWSUserFromEnvironmentVariables();
  }

  // Try loading default local user first (supports 'aws login')
  // Only use default profile if no specific user was requested
  if (!userName) {
    try {
      const defaultProfile = await getAWSUserFromDefaultLocalProfile();
      info('Using default AWS profile obtained from aws login.');
      return defaultProfile;
    } catch {
      // Fall through to Goldstack config
    }
  }

  // Load users as configured in Goldstack configuration
  if (!hasConfig(configPath)) {
    throw new Error(
      `No AWS credentials found in config. Please run 'aws login' or configure Goldstack.`,
    );
  }

  info(`Obtaining credentials from goldstack config file.`);
  const config = readConfig(configPath);
  try {
    return await getAWSUserFromGoldstackConfig(config, userName);
  } catch (error) {
    if (error instanceof Error && error.message.includes('does not exist in AWS configuration')) {
      info(
        `User '${userName}' not found in goldstack config. Falling back to default profile from aws login.`,
      );
      return await getAWSUserFromDefaultLocalProfile();
    }
    throw error;
  }
};
