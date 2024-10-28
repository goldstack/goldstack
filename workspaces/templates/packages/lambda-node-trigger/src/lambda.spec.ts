import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { connectToSQSQueue, getSQSDLQQueueUrl } from './lambda';

describe('Local testing for trigger Lambda', () => {
  test('Send message to SQS and trigger Lambda', async () => {
    const client = await connectToSQSQueue();

    await client.send(
      new SendMessageCommand({
        QueueUrl: getSQSDLQQueueUrl(),
        MessageBody: 'Hello World',
      })
    );
  });
});
