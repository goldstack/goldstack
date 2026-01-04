export {
  connect,
  getMockedDLQSQS,
  getMockedSQS,
  getSQSDLQQueueName,
  getSQSDLQQueueUrl,
  getSQSQueueName,
  getSQSQueueUrl,
} from './sqsConnect';

import type { SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import type { MessageCallback } from './sqsConnect';

export { MessageCallback } from './sqsConnect';

export * from './types/SqsPackage';

export function createSQSClient({
  sqsClient,
  onMessageSend,
}: {
  sqsClient?: SQSClient;
  onMessageSend?: MessageCallback;
}): SQSClient {
  return require(excludeInBundle('./mockedSQS')).createSQSClient({
    sqsClient,
    onMessageSend,
  });
}

// Helper function to retrieve sent message requests from the mocked SQS client
export const getSentMessageRequests = (sqsClient: SQSClient): SendMessageRequest[] => {
  // Check if the _goldstackSentRequests property exists and return the array of sent requests
    // biome-ignore lint/suspicious/noExplicitAny: monkey patching sqsClient
  if ((sqsClient as any)._goldstackSentRequests) {
        // biome-ignore lint/suspicious/noExplicitAny: monkey patching sqsClient
    return (sqsClient as any)._goldstackSentRequests;
  }

  // If no messages have been sent, return an empty array
  return [];
};

// Helper function to retrieve sent message requests from the mocked SQS client
export const getSentMessageBatchRequests = (sqsClient: SQSClient): SendMessageRequest[] => {
  // Check if the _goldstackSentRequests property exists and return the array of sent requests
    // biome-ignore lint/suspicious/noExplicitAny: monkey patching sqsClient
  if ((sqsClient as any)._goldstackSentBatchRequests) {
        // biome-ignore lint/suspicious/noExplicitAny: monkey patching sqsClient
    return (sqsClient as any)._goldstackSentBatchRequests;
  }

  // If no messages have been sent, return an empty array
  return [];
};
