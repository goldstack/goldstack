import { info } from '@goldstack/utils-log';
import {
  connectToSQSQueue,
  getSQSDLQQueueName,
  getSQSDLQQueueUrl,
  getSQSQueueName,
  getSQSQueueUrl,
} from './lambda';
import deployments from './state/deployments.json';

/**
 * Subset of the deployment state required to check whether Terraform outputs are available.
 */
interface DeploymentState {
  name: string;
  terraform?: Record<string, { value?: unknown }>;
}

/**
 * Determines whether the deployment state contains all the given Terraform outputs.
 *
 * Production tests can only verify queue configuration after the deployment has
 * been applied and its Terraform outputs are present in `src/state/deployments.json`.
 *
 * @param deploymentName - The deployment to inspect.
 * @param outputNames - The Terraform output names that must be present.
 * @returns `true` if all outputs are available.
 */
function hasTerraformOutputs(deploymentName: string, outputNames: string[]): boolean {
  const deployment = (deployments as unknown as DeploymentState[]).find(
    (candidate) => candidate.name === deploymentName,
  );
  if (!deployment?.terraform) {
    return false;
  }
  return outputNames.every((outputName) => deployment.terraform?.[outputName] !== undefined);
}

/**
 * Skips a production test when the deployment state is not available.
 *
 * @param outputNames - The Terraform output names required by the test.
 * @returns `true` if the test should be skipped.
 */
function skipIfDeploymentStateUnavailable(outputNames: string[]): boolean {
  if (hasTerraformOutputs('prod', outputNames)) {
    return false;
  }
  console.warn(
    'Testing of SQS production deployment skipped since deployment state is not available',
  );
  return true;
}

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
      const clientWithDeployment = await connectToSQSQueue('prod');
      expect(clientWithDeployment).toBeDefined();
    });
  });

  describe('Queue Configuration', () => {
    test('should retrieve main queue name and URL for production', async () => {
      if (skipIfDeploymentStateUnavailable(['sqs_queue_name', 'sqs_queue_url'])) {
        return;
      }
      const queueNameProd = await getSQSQueueName('prod');
      const queueUrlProd = await getSQSQueueUrl('prod');
      info(`Production queue name: ${queueNameProd}, URL: ${queueUrlProd}`);
      expect(queueNameProd).toBeDefined();
      expect(queueUrlProd).toBeDefined();
    });

    test('should retrieve DLQ name and URL for production', async () => {
      if (skipIfDeploymentStateUnavailable(['sqs_dlq_queue_name', 'sqs_dlq_queue_url'])) {
        return;
      }
      const dlqNameProd = await getSQSDLQQueueName('prod');
      const dlqUrlProd = await getSQSDLQQueueUrl('prod');
      info(`Production DLQ name: ${dlqNameProd}, URL: ${dlqUrlProd}`);
      expect(dlqNameProd).toBeDefined();
      expect(dlqUrlProd).toBeDefined();
    });
  });
});
