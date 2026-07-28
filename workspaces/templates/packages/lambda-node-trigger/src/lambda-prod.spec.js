'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const utils_log_1 = require('@goldstack/utils-log');
const lambda_1 = require('./lambda');
/**
 * Tests excluded in template, only for testing
 */
describe('Lambda SQS Integration (Production)', () => {
  describe('SQS Operations', () => {
    test('should connect to SQS queue with production deployment', async () => {
      if (!process.env.AWS_ACCESS_KEY_ID) {
        console.warn(
          'Testing of SQS production connection skipped since no AWS credentials available',
        );
        return;
      }
      const clientWithDeployment = await (0, lambda_1.connectToSQSQueue)('prod');
      expect(clientWithDeployment).toBeDefined();
    });
  });
  describe('Queue Configuration', () => {
    test('should retrieve main queue name and URL for production', async () => {
      const queueNameProd = await (0, lambda_1.getSQSQueueName)('prod');
      const queueUrlProd = await (0, lambda_1.getSQSQueueUrl)('prod');
      (0, utils_log_1.info)(`Production queue name: ${queueNameProd}, URL: ${queueUrlProd}`);
      expect(queueNameProd).toBeDefined();
      expect(queueUrlProd).toBeDefined();
    });
    test('should retrieve DLQ name and URL for production', async () => {
      const dlqNameProd = await (0, lambda_1.getSQSDLQQueueName)('prod');
      const dlqUrlProd = await (0, lambda_1.getSQSDLQQueueUrl)('prod');
      (0, utils_log_1.info)(`Production DLQ name: ${dlqNameProd}, URL: ${dlqUrlProd}`);
      expect(dlqNameProd).toBeDefined();
      expect(dlqUrlProd).toBeDefined();
    });
  });
});
//# sourceMappingURL=lambda-prod.spec.js.map
