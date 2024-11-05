import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { info } from '@goldstack/utils-log';
import { connectToSQSQueue, getSQSDLQQueueUrl, getSQSQueueUrl } from './lambda';

describe('Local testing for trigger Lambda', () => {
  test('Send message to SQS and trigger Lambda', async () => {
    const client = await connectToSQSQueue();

    await client.send(
      new SendMessageCommand({
        QueueUrl: await getSQSDLQQueueUrl(),
        MessageBody: 'Hello World',
      })
    );
  });
  test.only('Can retrieve queue url', async () => {
    const queueURL = await getSQSQueueUrl('prod');
    info(`Retrieved queue URL: ${queueURL}`);
    expect(queueURL).toBeDefined();
  });
});
