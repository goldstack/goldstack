/* eslint-disable @typescript-eslint/no-var-requires */
import { SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { fromEnv } from '@aws-sdk/credential-providers';

import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { CreateSQSClientSignature } from './mockedSQS';
import { SqsDeployment, SqsPackage } from './templateSqs';
import { AWSDeploymentRegion, getAWSUser } from '@goldstack/infra-aws';

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

export type MessageCallback = (
  input: SendMessageRequest
) => Promise<void> | void;

/**
 * Retrieves a mocked SQS client for local development. Initializes the client if not already created.
 * @param {MessageCallback} [onMessageSend] - Optional callback to handle the message sent event.
 * @returns {SQSClient} The mocked SQS client.
 */
export const getMockedSQS = (
  goldstackConfig: any,
  onMessageSend?: MessageCallback
): SQSClient => {
  if (!mockedSQS) {
    const createSQSClient: CreateSQSClientSignature = require(excludeInBundle(
      './mockedSQS'
    )).createSQSClient;
    mockedSQS = createSQSClient({
      queueUrl: getLocalSQSQueueUrl(goldstackConfig),
      sqsClient: undefined,
      onMessageSend,
    });
  }
  if (!mockedSQS) {
    throw new Error('Mocked SQS client not initialized');
  }
  return mockedSQS;
};

/**
 * Retrieves a mocked SQS client for local development for the DLQ queue. Initializes the client if not already created.
 * @param {MessageCallback} [onMessageSend] - Optional callback to handle the message sent event.
 * @returns {SQSClient} The mocked SQS client.
 */
export const getMockedDLQSQS = (
  goldstackConfig: any,
  onMessageSend?: MessageCallback
): SQSClient => {
  if (!mockedSQS) {
    const createSQSClient: CreateSQSClientSignature = require(excludeInBundle(
      './mockedSQS'
    )).createSQSClient;
    mockedSQS = createSQSClient({
      queueUrl: getLocalSQSDLQUrl(goldstackConfig),
      sqsClient: undefined,
      onMessageSend,
    });
  }
  if (!mockedSQS) {
    throw new Error('Mocked SQS client not initialized');
  }
  return mockedSQS;
};

/**
 * Gets the package configuration and deployment for SQS operations
 * @param {any} goldstackConfig - Goldstack configuration object
 * @param {any} packageSchema - Package schema
 * @param {string} [deploymentName] - Optional deployment name
 * @returns {{ packageConfig: EmbeddedPackageConfig<SqsPackage, SqsDeployment>, deployment: SqsDeployment }} Package config and deployment
 */
const getPackageConfigAndDeployment = (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): {
  packageConfig: EmbeddedPackageConfig<SqsPackage, SqsDeployment>;
  deployment: SqsDeployment;
} => {
  const packageConfig = new EmbeddedPackageConfig<SqsPackage, SqsDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  deploymentName = deploymentName || getEnvVar('GOLDSTACK_DEPLOYMENT');

  if (deploymentName === 'local') {
    return {
      packageConfig,
      deployment: {
        name: 'local',
        awsRegion: 'us-east-1' as AWSDeploymentRegion,
        awsUser: process.env.AWS_USER || 'local',
        configuration: {
          sqs_queue_name: 'test-local-queue',
          sqs_dlq_queue_name: 'test-local-dlq',
        },
      } as SqsDeployment,
    };
  }

  const deployment = packageConfig.getDeployment(deploymentName);
  if (!deployment) {
    throw new Error(`Cannot find deployment ${deploymentName}.`);
  }

  return { packageConfig, deployment };
};

/**
 * Connects to SQS, using a mocked client for local deployment or a real SQS client for other environments.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {any} deploymentsData - Deployment data.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<SQSClient>} The SQS client.
 */
export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentsData: any,
  deploymentName?: string
): Promise<SQSClient> => {
  const { deployment } = getPackageConfigAndDeployment(
    goldstackConfig,
    packageSchema,
    deploymentName
  );

  if (deployment.name === 'local') {
    return getMockedSQS(goldstackConfig);
  }

  const awsUser = process.env.AWS_ACCESS_KEY_ID
    ? fromEnv()
    : await getAwsUser(deployment.awsUser);

  return new SQSClient({
    credentials: awsUser,
    region: deployment.awsRegion,
  });
};

/**
 * Retrieves the AWS user credentials based on a user name.
 * @param {any} awsUserName - Name of the user
 * @returns {Promise<AwsCredentialIdentityProvider>} The AWS credential provider.
 */
const getAwsUser = async (
  awsUserName: string
): Promise<AwsCredentialIdentityProvider> => {
  return getAWSUser(awsUserName);
};

/**
 * Gets the deployment data for the specified deployment name
 * @param {any} deploymentsData - The deployments data
 * @param {string} deploymentName - The deployment name
 * @returns {any} The deployment data
 */
const getDeploymentData = (
  deploymentsData: any,
  deploymentName: string
): any => {
  const deployment = deploymentsData.find(
    (d: any) => d.name === deploymentName
  );
  if (!deployment) {
    throw new Error(
      `Cannot find deployment ${deploymentName} in deployments data`
    );
  }
  return deployment;
};

/**
 * Retrieves the SQS queue name for the specified deployment or environment.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {any} deploymentsData - Deployment data.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<string>} The name of the SQS queue.
 */
export const getSQSQueueName = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentsData: any,
  deploymentName?: string
): Promise<string> => {
  deploymentName = deploymentName || getEnvVar('GOLDSTACK_DEPLOYMENT');

  if (deploymentName === 'local') {
    return 'test-local-queue';
  }

  const deployment = getDeploymentData(deploymentsData, deploymentName);
  return deployment.terraform.sqs_queue_name.value;
};

/**
 * Retrieves the SQS queue URL for the specified deployment or environment.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {any} deploymentsData - Deployment data.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<string>} The URL of the SQS queue.
 */
export const getSQSQueueUrl = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentsData: any,
  deploymentName?: string
): Promise<string> => {
  deploymentName = deploymentName || getEnvVar('GOLDSTACK_DEPLOYMENT');

  if (deploymentName === 'local') {
    return getLocalSQSQueueUrl(goldstackConfig);
  }

  const deployment = getDeploymentData(deploymentsData, deploymentName);
  return deployment.terraform.sqs_queue_url.value;
};

/**
 * Retrieves the SQS Dead Letter Queue (DLQ) name for the specified deployment or environment.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {any} deploymentsData - Deployment data.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<string>} The name of the SQS DLQ queue.
 */
export const getSQSDLQQueueName = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentsData: any,
  deploymentName?: string
): Promise<string> => {
  deploymentName = deploymentName || getEnvVar('GOLDSTACK_DEPLOYMENT');

  if (deploymentName === 'local') {
    return 'test-local-dlq';
  }

  const deployment = getDeploymentData(deploymentsData, deploymentName);
  return deployment.terraform.sqs_dlq_queue_name.value;
};

/**
 * Constructs the SQS Dead Letter Queue (DLQ) URL for the given deployment.
 * @param {any} goldstackConfig - Goldstack configuration object.
 * @param {any} packageSchema - Package schema.
 * @param {any} deploymentsData - Deployment data.
 * @param {string} [deploymentName] - Optional deployment name. Defaults to environment variable GOLDSTACK_DEPLOYMENT.
 * @returns {Promise<string>} The URL of the SQS DLQ queue.
 */
export const getSQSDLQQueueUrl = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentsData: any,
  deploymentName?: string
): Promise<string> => {
  deploymentName = deploymentName || getEnvVar('GOLDSTACK_DEPLOYMENT');

  if (deploymentName === 'local') {
    return getLocalSQSDLQUrl(goldstackConfig);
  }

  const deployment = getDeploymentData(deploymentsData, deploymentName);

  return deployment.terraform.sqs_dlq_queue_url.value;
};
function getLocalSQSDLQUrl(goldstackConfig: any): string {
  return `http://localhost:4566/000000000000/${goldstackConfig.name}-dlq`;
}

function getLocalSQSQueueUrl(goldstackConfig: any): string {
  return 'http://localhost:4566/000000000000/' + goldstackConfig.name;
}
