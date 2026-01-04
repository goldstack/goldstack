import {
  SendMessageBatchCommand,
  type SendMessageBatchRequest,
  SendMessageCommand,
  type SendMessageRequest,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { warn } from '@goldstack/utils-log';
import { mockClient } from 'aws-sdk-client-mock';
import { v4 as uuid4 } from 'uuid';
import type { MessageCallback } from './sqsConnect';
export type CreateSQSClientSignature = typeof createSQSClient;

const clientsByUrl = new Map<string, SQSClient>();
const mockClientsByUrl = new Map<string, ReturnType<typeof mockClient>>();
const messageHandlers = new Map<string, MessageCallback>();

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
    sqsClient = clientsByUrl.get(queueUrl) || new SQSClient();
    clientsByUrl.set(queueUrl, sqsClient);
  }

  if (!mockClientsByUrl.has(queueUrl)) {
    const mockClient_ = mockClient(sqsClient);
    mockClientsByUrl.set(queueUrl, mockClient_);

    // biome-ignore lint/suspicious/noExplicitAny: monkey patching sqsClient
    (sqsClient as any)._goldstackSentRequests = [];
    // biome-ignore lint/suspicious/noExplicitAny: monkey patching sqsClient
    (sqsClient as any)._goldstackSentBatchRequests = [];

    mockClient_
      .on(SendMessageCommand)
      .callsFake(async (input: SendMessageRequest): Promise<SendMessageCommandOutput> => {
                // biome-ignore lint/suspicious/noExplicitAny: monkey patching sqsClient
        (sqsClient as any)._goldstackSentRequests.push(input);
        const handler = messageHandlers.get(input.QueueUrl || '');
        if (handler) {
          await handler(input);
        } else {
          warn(
            `No message handler registered for queue ${input.QueueUrl}. Message will not be processed. Ensure you connect to the correct SQS queue to create the client.`,
          );
        }

        return {
          MessageId: uuid4(),
        };
      });

    mockClient_
      .on(SendMessageBatchCommand)
      .callsFake(async (input: SendMessageBatchRequest): Promise<SendMessageBatchCommandOutput> => {
                // biome-ignore lint/suspicious/noExplicitAny: monkey patching sqsClient
        (sqsClient as any)._goldstackSentBatchRequests.push(input);
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
