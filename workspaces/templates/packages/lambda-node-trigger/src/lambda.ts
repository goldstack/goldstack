require('source-map-support').install();

import type { SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs';
import type { MessageCallback } from '@goldstack/template-sqs';
import {
  getSQSDLQQueueName as fetchDLQQueueName,
  getSQSDLQQueueUrl as fetchDLQQueueUrl,
  getSQSQueueName as fetchQueueName,
  getSQSQueueUrl as fetchQueueUrl,
  connect as templateConnect,
  getMockedDLQSQS as templateGetMockedDLQSQS,
  getMockedSQS as templateGetMockedSQS,
} from '@goldstack/template-sqs';
import { warn } from '@goldstack/utils-log';
import type {
  Context,
  ScheduledEvent,
  SQSMessageAttribute,
  SQSEvent,
} from 'aws-lambda';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';
import { handler as lambdaHandler } from './handler';
import deployments from './state/deployments.json';

/**
 * AWS Lambda handler function for processing SQS events or scheduled events.
 *
 * @param event - The AWS Lambda event (SQS event or scheduled event).
 * @param context - The AWS Lambda context object.
 * @returns A promise that resolves when the event processing is complete.
 */
export const handler = async (
  event: ScheduledEvent | SQSEvent,
  context: Context,
): Promise<void> => {
  return await lambdaHandler(event, context);
};

/**
 * Mock SQS client for local development.
 *
 * Sending a message to a client created in this way will trigger the handler function
 * with the provided message payload.
 *
 * @returns {SQSClient} The mocked SQS client.
 */
export const getMockedSQS = (): SQSClient => {
  const messageSendHandler: MessageCallback = async (message: SendMessageRequest) => {
    // Constructing a mock event to pass to the handler
    const sqsEvent: SQSEvent = {
      Records: [
        {
          body: message.MessageBody as string,
          // Other required fields can be filled as needed
          messageId: 'mockMessageId',
          receiptHandle: 'mockReceiptHandle',
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '1523232000000',
            SenderId: '123456789012',
            ApproximateFirstReceiveTimestamp: '1523232000001',
          },
          messageAttributes: {},
          md5OfBody: 'mockMd5',
          eventSource: 'aws:sqs',
          eventSourceARN: 'mockARN',
          awsRegion: 'mockRegion',
        },
      ],
    };

    await handler(sqsEvent, {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'mock-function',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:us-west-2:123456789012:function:mock-function',
      memoryLimitInMB: '128',
      awsRequestId: 'mock-request-id',
      logGroupName: 'mock-log-group',
      logStreamName: 'mock-log-stream',
      getRemainingTimeInMillis: () => 30000,
      done: () => {},
      fail: () => {},
      succeed: () => {},
    });
  };

  return templateGetMockedSQS(goldstackConfig, messageSendHandler);
};

/**
 * Mock SQS client for local development for testing the DLQ.
 *
 * Sending a message to a client created in this way will trigger the handler function
 * with the provided message payload.
 *
 * @returns {SQSClient} The mocked SQS client.
 */
export const getMockedDLQSQS = (): SQSClient => {
  const messageSendHandler: MessageCallback = async (message: SendMessageRequest) => {
    warn('DLQ Message received ' + message.MessageBody);
  };

  return templateGetMockedDLQSQS(goldstackConfig, messageSendHandler);
};

/**
 * Connects to the SQS Dead Letter Queue (DLQ) for the specified deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with an SQSClient connected to the DLQ.
 */
export const connectToSQSDLQQueue = async (deploymentName?: string): Promise<SQSClient> => {
  deploymentName = deploymentName || process.env['GOLDSTACK_DEPLOYMENT'];

  if (deploymentName === 'local') {
    return getMockedDLQSQS();
  }

  return await templateConnect(goldstackConfig, goldstackSchema, deployments, deploymentName);
};

/**
 * Connects to the main SQS queue that triggers this Lambda function.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with an SQSClient connected to the main queue.
 */
export const connectToSQSQueue = async (deploymentName?: string): Promise<SQSClient> => {
  deploymentName = deploymentName || process.env['GOLDSTACK_DEPLOYMENT'];

  if (deploymentName === 'local') {
    return getMockedSQS();
  }

  return await templateConnect(goldstackConfig, goldstackSchema, deployments, deploymentName);
};

/**
 * Retrieves the name of the SQS queue that triggers this Lambda function.
 *
 * @returns {Promise<string>} The name of the SQS queue.
 */
export async function getSQSQueueName(deploymentName?: string): Promise<string> {
  return await fetchQueueName(goldstackConfig, goldstackSchema, deployments, deploymentName);
}

/**
 * Retrieves the URL of the SQS queue that triggers this Lambda function.
 *
 * @returns {Promise<string>} The URL of the SQS queue.
 */
export async function getSQSQueueUrl(deploymentName?: string): Promise<string> {
  return await fetchQueueUrl(goldstackConfig, goldstackSchema, deployments, deploymentName);
}

/**
 * Retrieves the name of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {Promise<string>} The name of the SQS DLQ queue.
 */
export async function getSQSDLQQueueName(deploymentName?: string): Promise<string> {
  return await fetchDLQQueueName(goldstackConfig, goldstackSchema, deployments, deploymentName);
}

/**
 * Retrieves the URL of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {Promise<string>} The URL of the SQS DLQ queue.
 */
export async function getSQSDLQQueueUrl(deploymentName?: string): Promise<string> {
  return await fetchDLQQueueUrl(goldstackConfig, goldstackSchema, deployments, deploymentName);
}
