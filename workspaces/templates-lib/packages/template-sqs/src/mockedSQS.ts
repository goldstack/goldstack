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

/**
 * A message that has been queued for sequential processing.
 */
interface QueuedMessage {
  /** The request that should be passed to the message handler. */
  request: SendMessageRequest;
  /** Resolves once the message has been processed. */
  resolve: () => void;
  /** Rejects with the error thrown by the message handler. */
  reject: (error: unknown) => void;
}

const clientsByUrl = new Map<string, SQSClient>();
const mockClientsByUrl = new Map<string, ReturnType<typeof mockClient>>();
const messageHandlers = new Map<string, MessageCallback>();
const messageQueues = new Map<string, QueuedMessage[]>();
const processingLocks = new Map<string, Promise<void>>();
const sequentialProcessing = new Map<string, boolean>();

/**
 * Determines whether messages for a queue should be processed sequentially.
 * @param {string} queueUrl - The URL of the queue.
 * @returns {boolean} `true` if sequential processing is enabled for the queue.
 */
function isSequentialProcessing(queueUrl: string): boolean {
  return sequentialProcessing.get(queueUrl) ?? false;
}

/**
 * Adds a message to the queue and starts sequential processing if enabled.
 * @param {string} queueUrl - The URL of the queue the message belongs to.
 * @param {SendMessageRequest} request - The message to enqueue.
 * @returns {Promise<void>} Resolves once this message has been processed.
 */
function enqueueMessage(queueUrl: string, request: SendMessageRequest): Promise<void> {
  const processed = new Promise<void>((resolve, reject) => {
    const queue = messageQueues.get(queueUrl) ?? [];
    queue.push({ request, resolve, reject });
    messageQueues.set(queueUrl, queue);
  });

  startProcessing(queueUrl);

  return processed;
}

/**
 * Processes a message immediately or queues it for sequential processing.
 * @param {string} queueUrl - The URL of the queue the message belongs to.
 * @param {SendMessageRequest} request - The message to process.
 * @returns {Promise<void>} Resolves once this message has been processed.
 */
async function queueMessage(queueUrl: string, request: SendMessageRequest): Promise<void> {
  if (!isSequentialProcessing(queueUrl)) {
    await processMessage(queueUrl, request);
    return;
  }

  await enqueueMessage(queueUrl, request);
}

/**
 * Processes all messages currently queued for a queue, one at a time.
 * @param {string} queueUrl - The URL of the queue to process.
 * @returns {Promise<void>} Resolves once the queue has been drained.
 */
async function processSequentially(queueUrl: string): Promise<void> {
  const queue = messageQueues.get(queueUrl);
  if (!queue) {
    return;
  }

  while (queue.length > 0) {
    const queuedMessage = queue.shift();
    if (!queuedMessage) {
      continue;
    }

    try {
      await processMessage(queueUrl, queuedMessage.request);
      queuedMessage.resolve();
    } catch (error) {
      queuedMessage.reject(error);
    }
  }
}

/**
 * Starts processing a queue if it is not already being processed.
 * @param {string} queueUrl - The URL of the queue to process.
 * @returns {void}
 */
function startProcessing(queueUrl: string): void {
  if (processingLocks.has(queueUrl)) {
    return;
  }

  const processing = processSequentially(queueUrl).finally(() => {
    processingLocks.delete(queueUrl);
    if ((messageQueues.get(queueUrl)?.length ?? 0) > 0) {
      startProcessing(queueUrl);
    }
  });

  processingLocks.set(queueUrl, processing);
}

/**
 * Passes a message to the registered handler for its queue.
 * @param {string} queueUrl - The URL of the queue the message belongs to.
 * @param {SendMessageRequest} request - The message to process.
 * @returns {Promise<void>} Resolves once the handler has processed the message.
 */
async function processMessage(queueUrl: string, request: SendMessageRequest): Promise<void> {
  const handler = messageHandlers.get(queueUrl);
  if (handler) {
    await handler(request);
  } else {
    warn(
      `No message handler registered for queue ${queueUrl}. Message will not be processed. Ensure you connect to the correct SQS queue to create the client.`,
    );
  }
}

export function createSQSClient({
  queueUrl,
  sqsClient,
  onMessageSend,
  enableSequential,
}: {
  sqsClient?: SQSClient;
  onMessageSend?: MessageCallback;
  queueUrl: string;
  /**
   * If `true`, messages sent to this queue are processed one at a time in the
   * order they were sent. Defaults to `false`, preserving immediate processing.
   */
  enableSequential?: boolean;
}): SQSClient {
  if (!sqsClient) {
    sqsClient = clientsByUrl.get(queueUrl) || new SQSClient();
    clientsByUrl.set(queueUrl, sqsClient);
  }

  if (enableSequential !== undefined) {
    sequentialProcessing.set(queueUrl, enableSequential);
  }

  if (!mockClientsByUrl.has(queueUrl)) {
    const mockClient_ = mockClient(sqsClient);
    mockClientsByUrl.set(queueUrl, mockClient_);

    (sqsClient as any)._goldstackSentRequests = [];
    (sqsClient as any)._goldstackSentBatchRequests = [];

    mockClient_
      .on(SendMessageCommand)
      .callsFake(async (input: SendMessageRequest): Promise<any> => {
        (sqsClient as any)._goldstackSentRequests.push(input);
        await queueMessage(input.QueueUrl || '', input);

        return {
          MessageId: uuid4(),
        };
      });

    mockClient_
      .on(SendMessageBatchCommand)
      .callsFake(async (input: SendMessageBatchRequest): Promise<any> => {
        (sqsClient as any)._goldstackSentBatchRequests.push(input);
        if (input.Entries) {
          const queueUrl = input.QueueUrl || '';
          if (isSequentialProcessing(queueUrl)) {
            const processed = input.Entries.map((entry) =>
              enqueueMessage(queueUrl, {
                ...input,
                MessageBody: entry.MessageBody,
              }),
            );
            await Promise.all(processed);
          } else {
            const handler = messageHandlers.get(queueUrl);
            if (handler) {
              for (const entry of input.Entries) {
                await handler({ ...input, MessageBody: entry.MessageBody });
              }
            }
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
