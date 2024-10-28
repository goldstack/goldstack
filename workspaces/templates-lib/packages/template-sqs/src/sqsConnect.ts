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

// Get the SQS queue name
export const getSQSQueueName = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  const packageConfig = new EmbeddedPackageConfig({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      'GOLDSTACK_DEPLOYMENT environment variable is not set.'
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }

  if (deploymentName === 'local') {
    return 'test-local-queue';
  }

  const deployment = packageConfig.getDeployment(deploymentName);
  const queueName = deployment.configuration.sqs_queue_name;

  if (!queueName) {
    throw new Error(
      `No SQS queue name for deployment ${deploymentName}. Provide the SQS queue name in the configuration.`
    );
  }

  return queueName;
};

// Get the SQS Dead Letter Queue (DLQ) name
export const getSQSDLQQueueName = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  const packageConfig = new EmbeddedPackageConfig({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      'GOLDSTACK_DEPLOYMENT environment variable is not set.'
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }

  if (deploymentName === 'local') {
    return 'test-local-dlq';
  }

  const deployment = packageConfig.getDeployment(deploymentName);
  const dlqQueueName = deployment.configuration.sqs_dlq_queue_name;

  if (!dlqQueueName) {
    throw new Error(
      `No SQS DLQ queue name for deployment ${deploymentName}. Provide the SQS DLQ queue name in the configuration.`
    );
  }

  return dlqQueueName;
};

// Get the SQS queue URL
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

  let region = process.env.AWS_REGION;
  let accountId = process.env.AWS_ACCOUNT_ID;

  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      'GOLDSTACK_DEPLOYMENT environment variable is not set.'
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }

  if (deploymentName === 'local') {
    region = 'mock-region';
    accountId = '123456789012'; // Mock Account ID for local deployment
  }

  if (!region || !accountId) {
    throw new Error(
      'AWS_REGION or AWS_ACCOUNT_ID environment variable is not set.'
    );
  }

  return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
};

// Get the SQS DLQ URL
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

  let region = process.env.AWS_REGION;
  let accountId = process.env.AWS_ACCOUNT_ID;

  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      'GOLDSTACK_DEPLOYMENT environment variable is not set.'
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }

  if (deploymentName === 'local') {
    region = 'mock-region';
    accountId = '123456789012'; // Mock Account ID for local deployment
  }

  if (!region || !accountId) {
    throw new Error(
      'AWS_REGION or AWS_ACCOUNT_ID environment variable is not set.'
    );
  }

  return `https://sqs.${region}.amazonaws.com/${accountId}/${dlqQueueName}`;
};
