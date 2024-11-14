import {
  SQSClient,
  SendMessageCommand,
  SendMessageRequest,
  SendMessageBatchCommand,
  SendMessageBatchRequest,
} from '@aws-sdk/client-sqs';
import { mockClient } from 'aws-sdk-client-mock';
import { v4 as uuid4 } from 'uuid';
import { MessageCallback } from './sqsConnect';

export type CreateSQSClientSignature = typeof createSQSClient;

let singleMockClient: ReturnType<typeof mockClient> | undefined;
const messageHandlers = new Map<string, MessageCallback>();

const sendMessageRequests: SendMessageRequest[] = [];
const sendMessageBatchRequests: SendMessageBatchRequest[] = [];

export function createSQSClient({
  queueUrl,
  sqsClient,
  onMessageSend,
}: {
  sqsClient?: SQSClient;
  onMessageSend?: MessageCallback;
  queueUrl: string;
}): SQSClient {
  if (!sqsClient) {
    sqsClient = new SQSClient();
  }
  if (!singleMockClient) {
    singleMockClient = mockClient(sqsClient);
    (sqsClient as any)._goldstackSentRequests = sendMessageRequests;
    (sqsClient as any)._goldstackSentBatchRequests = sendMessageBatchRequests;
    singleMockClient
      .on(SendMessageCommand)
      .callsFake(async (input: SendMessageRequest): Promise<any> => {
        sendMessageRequests.push(input);
        const handler = messageHandlers.get(input.QueueUrl || '');
        if (handler) {
          await handler(input);
        }

        return {
          MessageId: uuid4(),
        };
      });

    singleMockClient
      .on(SendMessageBatchCommand)
      .callsFake(async (input: SendMessageBatchRequest): Promise<any> => {
        sendMessageBatchRequests.push(input);
        const handler = messageHandlers.get(input.QueueUrl || '');
        if (handler && input.Entries) {
          for (const entry of input.Entries) {
            await handler({ ...input, MessageBody: entry.MessageBody });
          }
        }

        return {
          Successful: input.Entries?.map(() => ({ MessageId: uuid4() })),
          Failed: [],
        };
      });
  }

  if (onMessageSend) {
    messageHandlers.set(queueUrl, onMessageSend);
  }

  return sqsClient;
}
