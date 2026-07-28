'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const client_sqs_1 = require('@aws-sdk/client-sqs');
const template_sqs_1 = require('@goldstack/template-sqs');
const utils_log_1 = require('@goldstack/utils-log');
const lambda_1 = require('./lambda');
describe('Lambda SQS Integration', () => {
  describe('SQS Operations', () => {
    test('should connect and send message to SQS queue', async () => {
      const client = await (0, lambda_1.connectToSQSQueue)();
      await client.send(
        new client_sqs_1.SendMessageCommand({
          QueueUrl: await (0, lambda_1.getSQSQueueUrl)(),
          MessageBody: 'Hello World',
        }),
      );
      expect((0, template_sqs_1.getSentMessageRequests)(client)).toHaveLength(1);
    });
    test('should connect and send message to SQS DLQ queue', async () => {
      const dlqClient = await (0, lambda_1.connectToSQSDLQQueue)();
      await dlqClient.send(
        new client_sqs_1.SendMessageCommand({
          QueueUrl: await (0, lambda_1.getSQSDLQQueueUrl)(),
          MessageBody: 'Hello DLQ World',
        }),
      );
      const sentRequests = (0, template_sqs_1.getSentMessageRequests)(dlqClient);
      expect(sentRequests).toHaveLength(1);
    });
    test('should connect to default SQS queue', async () => {
      const client = await (0, lambda_1.connectToSQSQueue)();
      expect(client).toBeDefined();
    });
  });
  describe('Queue Configuration', () => {
    test('should retrieve main queue name and URL for default deployment', async () => {
      const queueName = await (0, lambda_1.getSQSQueueName)();
      const queueUrl = await (0, lambda_1.getSQSQueueUrl)();
      (0, utils_log_1.info)(`Default queue name: ${queueName}, URL: ${queueUrl}`);
      expect(queueName).toBeDefined();
      expect(queueUrl).toBeDefined();
    });
    test('should retrieve DLQ name and URL for default deployment', async () => {
      const dlqName = await (0, lambda_1.getSQSDLQQueueName)();
      const dlqUrl = await (0, lambda_1.getSQSDLQQueueUrl)();
      (0, utils_log_1.info)(`Default DLQ name: ${dlqName}, URL: ${dlqUrl}`);
      expect(dlqName).toBeDefined();
      expect(dlqUrl).toBeDefined();
    });
  });
});
//# sourceMappingURL=lambda.spec.js.map
