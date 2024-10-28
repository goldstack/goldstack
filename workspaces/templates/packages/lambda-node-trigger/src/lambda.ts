// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { Handler, SQSEvent } from 'aws-lambda';
import {
  getSQSQueueName,
  getSQSQueueUrl,
  getSQSDLQQueueName,
  getSQSDLQQueueUrl,
} from '@goldstack/template-sqs';

import { SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs';

import deployments from './state/deployments.json'; // Import deployments

import {
  connect as templateConnect,
  getMockedSQS as templateGetMockedSQS,
} from '@goldstack/template-sqs';
import { MessageCallback } from '@goldstack/template-sqs/src/sqsConnect';

export const handler: Handler = async (event, context) => {
  // SQS message handling
  if (event.Records) {
    const sqsEvent = event as SQSEvent;
    const message = sqsEvent.Records[0].body;
    console.log('SQS message received:');

    // Process the message here if needed
    console.log(message);
    return;
  }

  // Handle Scheduled Event
  if (event['detail-type'] && event['detail-type'] === 'Scheduled Event') {
    const time = event['time'];
    console.log(`This is a scheduled event from ${time}`);
    return;
  }
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

  return templateGetMockedSQS(messageSendHandler);
};

import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';

export const connectToSQSQueue = async (
  deploymentName?: string
): Promise<SQSClient> => {
  return await templateConnect(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};

/**
 * Retrieves the name of the SQS queue that triggers this Lambda function.
 *
 * @returns {string} The name of the SQS queue.
 */
export function getSQSQueueNameWrapper(): string {
  return getSQSQueueName(deployments);
}

/**
 * Retrieves the URL of the SQS queue that triggers this Lambda function.
 *
 * @returns {string} The URL of the SQS queue.
 */
export function getSQSQueueUrlWrapper(): string {
  return getSQSQueueUrl(deployments);
}

/**
 * Retrieves the name of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {string} The name of the SQS DLQ queue.
 */
export function getSQSDLQQueueNameWrapper(): string {
  return getSQSDLQQueueName(deployments);
}

/**
 * Retrieves the URL of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {string} The URL of the SQS DLQ queue.
 */
export function getSQSDLQQueueUrlWrapper(): string {
  return getSQSDLQQueueUrl(deployments);
}
