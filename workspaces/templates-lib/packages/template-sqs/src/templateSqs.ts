export {
  connect,
  getMockedSQS,
  getMockedDLQSQS,
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(excludeInBundle('./mockedSQS')).createSQSClient({
    sqsClient,
    onMessageSend,
  });
}

// Helper function to retrieve sent message requests from the mocked SQS client
export const getSentMessageRequests = (
  sqsClient: SQSClient
): SendMessageRequest[] => {
  // Check if the _goldstackSentRequests property exists and return the array of sent requests
  if ((sqsClient as any)._goldstackSentRequests) {
    return (sqsClient as any)._goldstackSentRequests;
  }

  // If no messages have been sent, return an empty array
  return [];
};

// Helper function to retrieve sent message requests from the mocked SQS client
export const getSentMessageBatchRequests = (
  sqsClient: SQSClient
): SendMessageRequest[] => {
  // Check if the _goldstackSentRequests property exists and return the array of sent requests
  if ((sqsClient as any)._goldstackSentBatchRequests) {
    return (sqsClient as any)._goldstackSentBatchRequests;
  }

  // If no messages have been sent, return an empty array
  return [];
};
