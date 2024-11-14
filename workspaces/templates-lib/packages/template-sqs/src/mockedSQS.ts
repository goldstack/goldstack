import {
  SQSClient,
  SendMessageCommand,
  SendMessageRequest,
} from '@aws-sdk/client-sqs';
import { mockClient } from 'aws-sdk-client-mock';
import { v4 as uuid4 } from 'uuid';
import { MessageCallback } from './sqsConnect';

export type CreateSQSClientSignature = typeof createSQSClient;

export function createSQSClient({
  sqsClient,
  onMessageSend,
}: {
  sqsClient?: SQSClient;
  onMessageSend?: MessageCallback;
}): SQSClient {
  if (!sqsClient) {
    sqsClient = new SQSClient();
  }
  const mockedClient = mockClient(sqsClient);

  const sendMessageRequests: SendMessageRequest[] = [];

  (sqsClient as any)._goldstackSentRequests = sendMessageRequests;

  mockedClient.on(SendMessageCommand).callsFake(async (input): Promise<any> => {
    const queueUrl = input.QueueUrl;
    sendMessageRequests.push(input);

    // If a callback is provided, invoke it with the message input
    if (onMessageSend) {
      await onMessageSend(input);
    }

    return {
      MessageId: uuid4(),
    };
  });

  return sqsClient;
}
