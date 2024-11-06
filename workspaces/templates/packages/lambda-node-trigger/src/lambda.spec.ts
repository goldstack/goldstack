import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { info } from '@goldstack/utils-log';
import {
  connectToSQSQueue,
  getSQSDLQQueueUrl,
  getSQSQueueName,
  getSQSQueueUrl,
  getSQSDLQQueueName,
} from './lambda';

describe('Lambda SQS Integration', () => {
  describe('SQS Operations', () => {
    test('should connect and send message to SQS queue', async () => {
      const client = await connectToSQSQueue();
      await client.send(
        new SendMessageCommand({
          QueueUrl: await getSQSDLQQueueUrl(),
          MessageBody: 'Hello World',
        })
      );
    });

    test('should connect to default SQS queue', async () => {
      const client = await connectToSQSQueue();
      expect(client).toBeDefined();
    });
  });

  describe('Queue Configuration', () => {
    test('should retrieve main queue name and URL for default deployment', async () => {
      const queueName = await getSQSQueueName();
      const queueUrl = await getSQSQueueUrl();
      info(`Default queue name: ${queueName}, URL: ${queueUrl}`);
      expect(queueName).toBeDefined();
      expect(queueUrl).toBeDefined();
    });

    test('should retrieve DLQ name and URL for default deployment', async () => {
      const dlqName = await getSQSDLQQueueName();
      const dlqUrl = await getSQSDLQQueueUrl();
      info(`Default DLQ name: ${dlqName}, URL: ${dlqUrl}`);
      expect(dlqName).toBeDefined();
      expect(dlqUrl).toBeDefined();
    });
  });
});
