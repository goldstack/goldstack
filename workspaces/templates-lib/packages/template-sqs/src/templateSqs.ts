export {
  connect,
  getMockedSQS,
  getSQSDLQQueueName,
  getSQSDLQQueueUrl,
  getSQSQueueName,
  getSQSQueueUrl,
} from './sqsConnect'; // Now importing from SQS-related module

import { SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs';
import { excludeInBundle } from '@goldstack/utils-esbuild';

export function createSQSClient(sqsClient?: SQSClient): SQSClient {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(excludeInBundle('./mockedSQS')).createSQSClient(sqsClient);
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
