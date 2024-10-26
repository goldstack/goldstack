// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { Handler, SQSEvent } from 'aws-lambda';

import deployments from './state/deployments.json';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: Handler = async (event, context) => {
  // SQS message
  if (event.Records) {
    const sqsEvent = event as SQSEvent;
    const message = sqsEvent.Records[0].body;
    console.log('SQS message received:');
    console.log(message);
    return;
  }

  if (event['detail-type'] && event['detail-type'] === 'Scheduled Event') {
    const time = event['time'];
    console.log(`This is a scheduled event from ${time}`);
    return;
  }
};

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

/**
 *
 * @returns The name of the SQS queue that will trigger this lambda to run.
 */
export function getSQSQueueName(): string {
  const deployment = process.env.GOLDSTACK_DEPLOYMENT;
  if (!deployment) {
    throw new Error('GOLDSTACK_DEPLOYMENT environment variable is not set');
  }
  const deploymentData = deployments[deployment];
  if (!deploymentData) {
    throw new Error(`No deployment state for ${deployment}`);
  }
  const queueName = deploymentData['sqs_queue_name'];
  if (!queueName) {
    throw new Error(
      `No SQS queue name for deployment ${deployment}. Provide the sqs queue name in goldstack.json`
    );
  }
  return queueName;
}

/**
 * @returns Returns the URL of the SQS queue that will trigger this lambda to run.
 */
export function getSQSQueueUrl(): string {
  return constructQueueUrl(getSQSQueueName());
}

/**
 *
 * @returns Name of the SQL Dead Letter Queue that failed messages will be written to.
 */
export function getSQSDLQQueueName(): string {
  const deployment = process.env.GOLDSTACK_DEPLOYMENT;
  if (!deployment) {
    throw new Error('GOLDSTACK_DEPLOYMENT environment variable is not set');
  }
  const deploymentData = deployments[deployment];
  if (!deploymentData) {
    throw new Error(`No deployment state for ${deployment}`);
  }
  const queueName = deploymentData['sqs_dlq_queue_name'];
  if (!queueName) {
    throw new Error(
      `No SQS DLQ queue name for deployment ${deployment}. Provide the sqs queue name in goldstack.json`
    );
  }
  return queueName;
}

/**
 * @returns Returns the URL of the SQS Dead Letter Queue that failed messages will be written to.
 */
export function getSQSDLQQueueUrl(): string {
  return constructQueueUrl(getSQSDLQQueueName());
}
