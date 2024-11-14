// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { Handler, SQSEvent } from 'aws-lambda';

import {
  getSQSQueueName as fetchQueueName,
  getSQSQueueUrl as fetchQueueUrl,
  getSQSDLQQueueName as fetchDLQQueueName,
  getSQSDLQQueueUrl as fetchDLQQueueUrl,
} from '@goldstack/template-sqs';

import { SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs';

import deployments from './state/deployments.json';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';

import {
  connect as templateConnect,
  getMockedSQS as templateGetMockedSQS,
} from '@goldstack/template-sqs';
import { MessageCallback } from '@goldstack/template-sqs';
import { handler as lambdaHandler } from './handler';

export const handler: Handler = lambdaHandler;
/**
 * Mock SQS client for local development.
 *
 * Sending a message to a client created in this way will trigger the handler function
 * with the provided message payload.
 *
 * @returns {SQSClient} The mocked SQS client.
 */
export const getMockedSQS = (): SQSClient => {
  const messageSendHandler: MessageCallback = async (
    message: SendMessageRequest
  ) => {
    // Constructing a mock event to pass to the handler
    const sqsEvent: SQSEvent = {
      Records: [
        {
          body: message.MessageBody as string,
          // Other required fields can be filled as needed
          messageId: 'mockMessageId',
          receiptHandle: 'mockReceiptHandle',
          attributes: {} as any,
          messageAttributes: {},
          md5OfBody: 'mockMd5',
          eventSource: 'aws:sqs',
          eventSourceARN: 'mockARN',
          awsRegion: 'mockRegion',
        },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await handler(sqsEvent, {} as any, () => {});
  };

  return templateGetMockedSQS(goldstackConfig, messageSendHandler);
};

export const connectToSQSQueue = async (
  deploymentName?: string
): Promise<SQSClient> => {
  deploymentName = deploymentName || process.env['GOLDSTACK_DEPLOYMENT'];

  if (deploymentName === 'local') {
    return getMockedSQS();
  }

  return await templateConnect(
    goldstackConfig,
    goldstackSchema,
    deployments,
    deploymentName
  );
};

/**
 * Retrieves the name of the SQS queue that triggers this Lambda function.
 *
 * @returns {Promise<string>} The name of the SQS queue.
 */
export async function getSQSQueueName(
  deploymentName?: string
): Promise<string> {
  return await fetchQueueName(
    goldstackConfig,
    goldstackSchema,
    deployments,
    deploymentName
  );
}

/**
 * Retrieves the URL of the SQS queue that triggers this Lambda function.
 *
 * @returns {Promise<string>} The URL of the SQS queue.
 */
export async function getSQSQueueUrl(deploymentName?: string): Promise<string> {
  return await fetchQueueUrl(
    goldstackConfig,
    goldstackSchema,
    deployments,
    deploymentName
  );
}

/**
 * Retrieves the name of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {Promise<string>} The name of the SQS DLQ queue.
 */
export async function getSQSDLQQueueName(
  deploymentName?: string
): Promise<string> {
  return await fetchDLQQueueName(
    goldstackConfig,
    goldstackSchema,
    deployments,
    deploymentName
  );
}

/**
 * Retrieves the URL of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {Promise<string>} The URL of the SQS DLQ queue.
 */
export async function getSQSDLQQueueUrl(
  deploymentName?: string
): Promise<string> {
  return await fetchDLQQueueUrl(
    goldstackConfig,
    goldstackSchema,
    deployments,
    deploymentName
  );
}
