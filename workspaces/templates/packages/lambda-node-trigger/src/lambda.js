'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.connectToSQSQueue =
  exports.connectToSQSDLQQueue =
  exports.getMockedDLQSQS =
  exports.getMockedSQS =
  exports.handler =
    void 0;
exports.getSQSQueueName = getSQSQueueName;
exports.getSQSQueueUrl = getSQSQueueUrl;
exports.getSQSDLQQueueName = getSQSDLQQueueName;
exports.getSQSDLQQueueUrl = getSQSDLQQueueUrl;
require('source-map-support').install();
const template_sqs_1 = require('@goldstack/template-sqs');
const utils_log_1 = require('@goldstack/utils-log');
const goldstack_json_1 = __importDefault(require('./../goldstack.json'));
const package_schema_json_1 = __importDefault(require('./../schemas/package.schema.json'));
const handler_1 = require('./handler');
const deployments_json_1 = __importDefault(require('./state/deployments.json'));
/**
 * AWS Lambda handler function for processing SQS events or scheduled events.
 *
 * @param event - The AWS Lambda event (SQS event or scheduled event).
 * @param context - The AWS Lambda context object.
 * @returns A promise that resolves when the event processing is complete.
 */
const handler = async (event, context) => {
  return await (0, handler_1.handler)(event, context);
};
exports.handler = handler;
/**
 * Mock SQS client for local development.
 *
 * Sending a message to a client created in this way will trigger the handler function
 * with the provided message payload.
 *
 * @returns {SQSClient} The mocked SQS client.
 */
const getMockedSQS = () => {
  const messageSendHandler = async (message) => {
    // Constructing a mock event to pass to the handler
    const sqsEvent = {
      Records: [
        {
          body: message.MessageBody,
          // Other required fields can be filled as needed
          messageId: 'mockMessageId',
          receiptHandle: 'mockReceiptHandle',
          // biome-ignore lint/suspicious/noExplicitAny: Mock attributes object
          attributes: {},
          messageAttributes: {},
          md5OfBody: 'mockMd5',
          eventSource: 'aws:sqs',
          eventSourceARN: 'mockARN',
          awsRegion: 'mockRegion',
        },
      ],
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mock context object
    await (0, exports.handler)(sqsEvent, {});
  };
  return (0, template_sqs_1.getMockedSQS)(goldstack_json_1.default, messageSendHandler);
};
exports.getMockedSQS = getMockedSQS;
/**
 * Mock SQS client for local development for testing the DLQ.
 *
 * Sending a message to a client created in this way will trigger the handler function
 * with the provided message payload.
 *
 * @returns {SQSClient} The mocked SQS client.
 */
const getMockedDLQSQS = () => {
  const messageSendHandler = async (message) => {
    (0, utils_log_1.warn)(`DLQ Message received ${message.MessageBody}`);
  };
  return (0, template_sqs_1.getMockedDLQSQS)(goldstack_json_1.default, messageSendHandler);
};
exports.getMockedDLQSQS = getMockedDLQSQS;
/**
 * Connects to the SQS Dead Letter Queue (DLQ) for the specified deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with an SQSClient connected to the DLQ.
 */
const connectToSQSDLQQueue = async (deploymentName) => {
  deploymentName = deploymentName || process.env.GOLDSTACK_DEPLOYMENT;
  if (deploymentName === 'local') {
    return (0, exports.getMockedDLQSQS)();
  }
  return await (0, template_sqs_1.connect)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deployments_json_1.default,
    deploymentName,
  );
};
exports.connectToSQSDLQQueue = connectToSQSDLQQueue;
/**
 * Connects to the main SQS queue that triggers this Lambda function.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with an SQSClient connected to the main queue.
 */
const connectToSQSQueue = async (deploymentName) => {
  deploymentName = deploymentName || process.env.GOLDSTACK_DEPLOYMENT;
  if (deploymentName === 'local') {
    return (0, exports.getMockedSQS)();
  }
  return await (0, template_sqs_1.connect)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deployments_json_1.default,
    deploymentName,
  );
};
exports.connectToSQSQueue = connectToSQSQueue;
/**
 * Retrieves the name of the SQS queue that triggers this Lambda function.
 *
 * @returns {Promise<string>} The name of the SQS queue.
 */
async function getSQSQueueName(deploymentName) {
  return await (0, template_sqs_1.getSQSQueueName)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deployments_json_1.default,
    deploymentName,
  );
}
/**
 * Retrieves the URL of the SQS queue that triggers this Lambda function.
 *
 * @returns {Promise<string>} The URL of the SQS queue.
 */
async function getSQSQueueUrl(deploymentName) {
  return await (0, template_sqs_1.getSQSQueueUrl)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deployments_json_1.default,
    deploymentName,
  );
}
/**
 * Retrieves the name of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {Promise<string>} The name of the SQS DLQ queue.
 */
async function getSQSDLQQueueName(deploymentName) {
  return await (0, template_sqs_1.getSQSDLQQueueName)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deployments_json_1.default,
    deploymentName,
  );
}
/**
 * Retrieves the URL of the SQS Dead Letter Queue (DLQ) for failed messages.
 *
 * @returns {Promise<string>} The URL of the SQS DLQ queue.
 */
async function getSQSDLQQueueUrl(deploymentName) {
  return await (0, template_sqs_1.getSQSDLQQueueUrl)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deployments_json_1.default,
    deploymentName,
  );
}
//# sourceMappingURL=lambda.js.map
