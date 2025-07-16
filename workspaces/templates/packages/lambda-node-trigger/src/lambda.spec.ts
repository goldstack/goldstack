import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { info } from '@goldstack/utils-log';
import { getSentMessageRequests } from '@goldstack/template-sqs';
import {
  connectToSQSQueue,
  connectToSQSDLQQueue,
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
          QueueUrl: await getSQSQueueUrl(),
          MessageBody: 'Hello World',
        }),
      );

      expect(getSentMessageRequests(client)).toHaveLength(1);
    });

    test('should connect and send message to SQS DLQ queue', async () => {
      const dlqClient = await connectToSQSDLQQueue();
      await dlqClient.send(
        new SendMessageCommand({
          QueueUrl: await getSQSDLQQueueUrl(),
          MessageBody: 'Hello DLQ World',
        }),
      );

      const sentRequests = getSentMessageRequests(dlqClient);
      expect(sentRequests).toHaveLength(1);
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
