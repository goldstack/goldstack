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

    test('should connect to SQS queue with and without deployment name', async () => {
      const clientWithDeployment = await connectToSQSQueue('prod');
      const clientWithoutDeployment = await connectToSQSQueue();
      expect(clientWithDeployment).toBeDefined();
      expect(clientWithoutDeployment).toBeDefined();
    });
  });

  describe('Queue Configuration', () => {
    test('should retrieve main queue name and URL (with/without deployment)', async () => {
      // With deployment name
      const queueNameProd = await getSQSQueueName('prod');
      const queueUrlProd = await getSQSQueueUrl('prod');
      info(`Production queue name: ${queueNameProd}, URL: ${queueUrlProd}`);
      expect(queueNameProd).toBeDefined();
      expect(queueUrlProd).toBeDefined();

      // Without deployment name
      const queueName = await getSQSQueueName();
      const queueUrl = await getSQSQueueUrl();
      info(`Default queue name: ${queueName}, URL: ${queueUrl}`);
      expect(queueName).toBeDefined();
      expect(queueUrl).toBeDefined();
    });

    test('should retrieve DLQ name and URL (with/without deployment)', async () => {
      // With deployment name
      const dlqNameProd = await getSQSDLQQueueName('prod');
      const dlqUrlProd = await getSQSDLQQueueUrl('prod');
      info(`Production DLQ name: ${dlqNameProd}, URL: ${dlqUrlProd}`);
      expect(dlqNameProd).toBeDefined();
      expect(dlqUrlProd).toBeDefined();

      // Without deployment name
      const dlqName = await getSQSDLQQueueName();
      const dlqUrl = await getSQSDLQQueueUrl();
      info(`Default DLQ name: ${dlqName}, URL: ${dlqUrl}`);
      expect(dlqName).toBeDefined();
      expect(dlqUrl).toBeDefined();
    });
  });
});
