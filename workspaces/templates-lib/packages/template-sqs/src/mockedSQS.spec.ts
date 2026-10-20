import {
  SendMessageBatchCommand,
  SendMessageCommand,
  type SendMessageRequest,
} from '@aws-sdk/client-sqs';
import { createSQSClient } from './templateSqs';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Mocked SQS sequential processing', () => {
  it('Should process messages one at a time in send order', async () => {
    const processed: string[] = [];
    let active = 0;
    let maxActive = 0;
    const queueUrl = 'http://localhost:4566/000000000000/sequential-order';

    const sqs = createSQSClient({
      queueUrl,
      enableSequential: true,
      onMessageSend: async (message: SendMessageRequest) => {
        active++;
        maxActive = Math.max(maxActive, active);
        await delay(message.MessageBody === 'first' ? 15 : 1);
        processed.push(message.MessageBody || '');
        active--;
      },
    });

    await Promise.all([
      sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: 'first' })),
      sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: 'second' })),
      sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: 'third' })),
    ]);

    expect(processed).toEqual(['first', 'second', 'third']);
    expect(maxActive).toBe(1);
  });

  it('Should process batch messages sequentially across batches', async () => {
    const processed: string[] = [];
    const queueUrl = 'http://localhost:4566/000000000000/sequential-batches';

    const sqs = createSQSClient({
      queueUrl,
      enableSequential: true,
      onMessageSend: async (message: SendMessageRequest) => {
        await delay(1);
        processed.push(message.MessageBody || '');
      },
    });

    await Promise.all([
      sqs.send(
        new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: [
            { Id: '1', MessageBody: 'batch-1' },
            { Id: '2', MessageBody: 'batch-2' },
          ],
        }),
      ),
      sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: 'single' })),
    ]);

    expect(processed).toEqual(['batch-1', 'batch-2', 'single']);
  });

  it('Should continue processing after a handler error', async () => {
    const processed: string[] = [];
    const queueUrl = 'http://localhost:4566/000000000000/sequential-errors';

    const sqs = createSQSClient({
      queueUrl,
      enableSequential: true,
      onMessageSend: (message: SendMessageRequest) => {
        if (message.MessageBody === 'fail') {
          throw new Error('processing failed');
        }
        processed.push(message.MessageBody || '');
      },
    });

    const failing = sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: 'fail' }));
    const succeeding = sqs.send(
      new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: 'succeed' }),
    );

    await expect(failing).rejects.toThrow('processing failed');
    await succeeding;

    expect(processed).toEqual(['succeed']);
  });

  it('Should preserve immediate processing when sequential mode is not enabled', async () => {
    const processed: string[] = [];
    const queueUrl = 'http://localhost:4566/000000000000/sequential-disabled';

    const sqs = createSQSClient({
      queueUrl,
      onMessageSend: (message: SendMessageRequest) => {
        processed.push(message.MessageBody || '');
      },
    });

    await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: 'immediate' }));

    expect(processed).toEqual(['immediate']);
  });
});
