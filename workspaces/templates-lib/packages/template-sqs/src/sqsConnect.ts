/* eslint-disable @typescript-eslint/no-var-requires */
import { SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { fromEnv } from '@aws-sdk/credential-providers';
import assert from 'assert';

import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { CreateSQSClientSignature } from './mockedSQS';

let mockedSQS: SQSClient | undefined;

/**
 * Retrieves an environment variable by key. Throws an error if the variable is not set.
 * @param {string} key - The environment variable key.
 * @returns {string} The value of the environment variable.
 * @throws Will throw an error if the environment variable is not set.
 */
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not set.`);
  return value;
};

/**
 * Constructs the SQS Queue URL based on the queue name, region, and account ID.
 * @param {string} queueName - The name of the SQS queue.
 * @param {string} region - AWS region.
 * @param {string} accountId - AWS account ID.
 * @returns {string} The constructed SQS Queue URL.
 */
const constructQueueUrl = (
  queueName: string,
  region: string,
  accountId: string
): string => `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;

export type MessageCallback = (
  input: SendMessageRequest
) => Promise<void> | void;

/**
 * Retrieves a mocked SQS client for local development. Initializes the client if not already created.
 * @param {MessageCallback} [onMessageSend] - Optional callback to handle the message sent event.
 * @returns {SQSClient} The mocked SQS client.
 */
export const getMockedSQS = (onMessageSend?: MessageCallback): SQSClient => {
  if (!mockedSQS) {
    const createSQSClient: CreateSQSClientSignature = require(excludeInBundle(
      './mockedSQS'
    )).createSQSClient;
    mockedSQS = createSQSClient({ sqsClient: undefined, onMessageSend });
  }
  if (!mockedSQS) {
    throw new Error('Mocked SQS client not initialized');
  }
  return mockedSQS;
};

/**
 * Connects to SQS, using a mocked client for local deployment or a real SQS client for other environments.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {any} deploymentData - Deployment data.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<SQSClient>} The SQS client.
 */
export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentData: any,
  deploymentName?: string
): Promise<SQSClient> => {
  deploymentName = deploymentName || getEnvVar('GOLDSTACK_DEPLOYMENT');

  if (deploymentName === 'local') {
    return getMockedSQS();
  }

  const deployment = deploymentData[deploymentName];
  const awsUser = process.env.AWS_ACCESS_KEY_ID
    ? fromEnv()
    : await getAwsUser(deployment.awsUser);

  return new SQSClient({
    credentials: awsUser,
    region: deployment.awsRegion,
  });
};

/**
 * Retrieves the AWS user credentials based on the given configuration.
 * @param {any} awsUserConfig - Configuration for the AWS user.
 * @returns {Promise<AwsCredentialIdentityProvider>} The AWS credential provider.
 */
const getAwsUser = async (
  awsUserConfig: any
): Promise<AwsCredentialIdentityProvider> => {
  const infraAWSLib = require(excludeInBundle('@goldstack/infra-aws'));
  return infraAWSLib.getAWSUser(awsUserConfig);
};

/**
 * Retrieves the SQS queue name for the specified deployment or environment.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<string>} The name of the SQS queue.
 */
export const getSQSQueueName = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  const packageConfig = new EmbeddedPackageConfig({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  deploymentName = deploymentName || getEnvVar('GOLDSTACK_DEPLOYMENT');

  if (deploymentName === 'local') return 'test-local-queue';

  const deployment = packageConfig.getDeployment(deploymentName);
  return getRequiredConfig(deployment, 'sqs_queue_name', deploymentName);
};

/**
 * Retrieves the SQS Dead Letter Queue (DLQ) name for the specified deployment or environment.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<string>} The name of the SQS DLQ queue.
 */
export const getSQSDLQQueueName = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  const packageConfig = new EmbeddedPackageConfig({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  deploymentName = deploymentName || getEnvVar('GOLDSTACK_DEPLOYMENT');

  if (deploymentName === 'local') return 'test-local-dlq';

  const deployment = packageConfig.getDeployment(deploymentName);
  return getRequiredConfig(deployment, 'sqs_dlq_queue_name', deploymentName);
};

/**
 * Retrieves the required configuration value from the deployment configuration.
 * @param {any} deployment - Deployment configuration.
 * @param {string} configKey - Key for the configuration value (e.g., sqs_queue_name).
 * @param {string} deploymentName - Name of the deployment.
 * @returns {string} The configuration value.
 * @throws Will throw an error if the configuration value is not found.
 */
const getRequiredConfig = (
  deployment: any,
  configKey: string,
  deploymentName: string
): string => {
  const value = deployment.configuration[configKey];
  if (!value) {
    throw new Error(
      `No ${configKey} for deployment ${deploymentName}. Provide it in the configuration.`
    );
  }
  return value;
};

/**
 * Constructs the SQS queue URL for the given deployment.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<string>} The URL of the SQS queue.
 */
export const getSQSQueueUrl = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  const queueName = await getSQSQueueName(
    goldstackConfig,
    packageSchema,
    deploymentName
  );
  const { region, accountId } = getAwsInfo(deploymentName);

  return constructQueueUrl(queueName, region, accountId);
};

/**
 * Constructs the SQS Dead Letter Queue (DLQ) URL for the given deployment.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<string>} The URL of the SQS DLQ queue.
 */
export const getSQSDLQQueueUrl = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  const dlqQueueName = await getSQSDLQQueueName(
    goldstackConfig,
    packageSchema,
    deploymentName
  );
  const { region, accountId } = getAwsInfo(deploymentName);

  return constructQueueUrl(dlqQueueName, region, accountId);
};

/**
 * Helper function to retrieve the AWS region and account ID. Defaults to mock values for local deployment.
 * @param {string} [deploymentName] - Optional deployment name.
 * @returns {{region: string, accountId: string}} The AWS region and account ID.
 */
const getAwsInfo = (
  deploymentName?: string
): { region: string; accountId: string } => {
  deploymentName = deploymentName || getEnvVar('GOLDSTACK_DEPLOYMENT');
  if (deploymentName === 'local') {
    return { region: 'mock-region', accountId: '123456789012' };
  }
  const region = getEnvVar('AWS_REGION');
  const accountId = getEnvVar('AWS_ACCOUNT_ID');
  return { region, accountId };
};
