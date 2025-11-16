import { info } from '@goldstack/utils-log';
import {
  connectToSQSQueue,
  getSQSDLQQueueName,
  getSQSDLQQueueUrl,
  getSQSQueueName,
  getSQSQueueUrl,
} from './lambda';

/**
 * Tests excluded in template, only for testing
 */
describe('Lambda SQS Integration (Production)', () => {
  describe('SQS Operations', () => {
    test('should connect to SQS queue with production deployment', async () => {
      const clientWithDeployment = await connectToSQSQueue('prod');
      expect(clientWithDeployment).toBeDefined();
    });
  });

  describe('Queue Configuration', () => {
    test('should retrieve main queue name and URL for production', async () => {
      const queueNameProd = await getSQSQueueName('prod');
      const queueUrlProd = await getSQSQueueUrl('prod');
      info(`Production queue name: ${queueNameProd}, URL: ${queueUrlProd}`);
      expect(queueNameProd).toBeDefined();
      expect(queueUrlProd).toBeDefined();
    });

    test('should retrieve DLQ name and URL for production', async () => {
      const dlqNameProd = await getSQSDLQQueueName('prod');
      const dlqUrlProd = await getSQSDLQQueueUrl('prod');
      info(`Production DLQ name: ${dlqNameProd}, URL: ${dlqUrlProd}`);
      expect(dlqNameProd).toBeDefined();
      expect(dlqUrlProd).toBeDefined();
    });
  });
});
