import type { SQSClient } from '@aws-sdk/client-sqs';
import type { Context, ScheduledEvent, SQSEvent } from 'aws-lambda';
/**
 * AWS Lambda handler function for processing SQS events or scheduled events.
 *
 * @param event - The AWS Lambda event (SQS event or scheduled event).
 * @param context - The AWS Lambda context object.
 * @returns A promise that resolves when the event processing is complete.
 */
export declare const handler: (event: ScheduledEvent | SQSEvent, context: Context) => Promise<void>;
/**
 * Mock SQS client for local development.
 *
 * Sending a message to a client created in this way will trigger the handler function
 * with the provided message payload.
 *
 * @returns {SQSClient} The mocked SQS client.
 */
export declare const getMockedSQS: () => SQSClient;
/**
 * Mock SQS client for local development for testing the DLQ.
 *
 * Sending a message to a client created in this way will trigger the handler function
 * with the provided message payload.
 *
 * @returns {SQSClient} The mocked SQS client.
 */
export declare const getMockedDLQSQS: () => SQSClient;
/**
 * Connects to the SQS Dead Letter Queue (DLQ) for the specified deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with an SQSClient connected to the DLQ.
 */
export declare const connectToSQSDLQQueue: (deploymentName?: string) => Promise<SQSClient>;
/**
 * Connects to the main SQS queue that triggers this Lambda function.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with an SQSClient connected to the main queue.
 */
export declare const connectToSQSQueue: (deploymentName?: string) => Promise<SQSClient>;
/**
 * Retrieves the name of the SQS queue that triggers this Lambda function.
 *
 * @returns {Promise<string>} The name of the SQS queue.
 */
export declare function getSQSQueueName(deploymentName?: string): Promise<string>;
/**
 * Retrieves the URL of the SQS queue that triggers this Lambda function.
 *
 * @returns {Promise<string>} The URL of the SQS queue.
 */
export declare function getSQSQueueUrl(deploymentName?: string): Promise<string>;
/**
 * Retrieves the name of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {Promise<string>} The name of the SQS DLQ queue.
 */
export declare function getSQSDLQQueueName(deploymentName?: string): Promise<string>;
/**
 * Retrieves the URL of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {Promise<string>} The URL of the SQS DLQ queue.
 */
export declare function getSQSDLQQueueUrl(deploymentName?: string): Promise<string>;
//# sourceMappingURL=lambda.d.ts.map
