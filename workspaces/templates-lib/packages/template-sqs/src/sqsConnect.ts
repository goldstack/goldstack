/* eslint-disable @typescript-eslint/no-var-requires */
import { SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { fromEnv } from '@aws-sdk/credential-providers';
import assert from 'assert';

import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { excludeInBundle } from '@goldstack/utils-esbuild';

let mockedSQS: SQSClient | undefined;

// Construct queue URL based on the queue name and environment variables
const constructQueueUrl = (queueName: string): string => {
  const region = process.env.AWS_REGION;
  const accountId = process.env.AWS_ACCOUNT_ID;

  if (!region || !accountId) {
    throw new Error(
      'AWS_REGION or AWS_ACCOUNT_ID environment variable is not set.'
    );
  }

  return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
};

// Get the SQS queue name from the deployment configuration
export const getSQSQueueName = (deploymentData: any): string => {
  const deployment = process.env.GOLDSTACK_DEPLOYMENT;
  if (!deployment) {
    throw new Error('GOLDSTACK_DEPLOYMENT environment variable is not set');
  }
  const deploymentConfig = deploymentData[deployment];
  if (!deploymentConfig) {
    throw new Error(`No deployment state for ${deployment}`);
  }
  const queueName = deploymentConfig['sqs_queue_name'];
  if (!queueName) {
    throw new Error(
      `No SQS queue name for deployment ${deployment}. Provide the SQS queue name in the configuration.`
    );
  }
  return queueName;
};

// Get the SQS queue URL from the queue name
export const getSQSQueueUrl = (deploymentData: any): string => {
  return constructQueueUrl(getSQSQueueName(deploymentData));
};

// Get the SQS Dead Letter Queue (DLQ) name
export const getSQSDLQQueueName = (deploymentData: any): string => {
  const deployment = process.env.GOLDSTACK_DEPLOYMENT;
  if (!deployment) {
    throw new Error('GOLDSTACK_DEPLOYMENT environment variable is not set');
  }
  const deploymentConfig = deploymentData[deployment];
  if (!deploymentConfig) {
    throw new Error(`No deployment state for ${deployment}`);
  }
  const queueName = deploymentConfig['sqs_dlq_queue_name'];
  if (!queueName) {
    throw new Error(
      `No SQS DLQ queue name for deployment ${deployment}. Provide the SQS DLQ queue name in the configuration.`
    );
  }
  return queueName;
};

// Get the SQS DLQ URL
export const getSQSDLQQueueUrl = (deploymentData: any): string => {
  return constructQueueUrl(getSQSDLQQueueName(deploymentData));
};

export type MessageCallback = (
  input: SendMessageRequest
) => Promise<void> | void;

// Mock SQS client for local development
export const getMockedSQS = (onMessageSend?: MessageCallback): SQSClient => {
  const createSQSClient = require(excludeInBundle(
    './mockedSQS'
  )).createSQSClient;
  if (!mockedSQS) {
    mockedSQS = createSQSClient(onMessageSend);
  }
  return mockedSQS as any;
};

export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentData: any,
  deploymentName?: string
): Promise<SQSClient> => {
  const packageConfig = new EmbeddedPackageConfig({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      `Cannot connect to SQS for package ${goldstackConfig.name}. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.`
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }

  if (deploymentName === 'local') {
    if (!mockedSQS) {
      const createSQSClient = require(excludeInBundle(
        './mockedSQS'
      )).createSQSClient;
      mockedSQS = createSQSClient();
    }
    return mockedSQS as any;
  }

  const deployment = deploymentData[deploymentName];

  let awsUser: AwsCredentialIdentityProvider;
  if (process.env.AWS_ACCESS_KEY_ID) {
    awsUser = fromEnv();
  } else {
    const infraAWSLib = require(excludeInBundle('@goldstack/infra-aws'));
    awsUser = await infraAWSLib.getAWSUser(deployment.awsUser);
  }

  const sqs = new SQSClient({
    credentials: awsUser,
    region: deployment.awsRegion,
  });

  return sqs;
};
