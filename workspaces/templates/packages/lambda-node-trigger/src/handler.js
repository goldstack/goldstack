'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const lambda_1 = require('./lambda');
const handler = async (event, _context) => {
  // SQS message handling
  if ('Records' in event) {
    const sqsEvent = event;
    const message = sqsEvent.Records[0].body;
    console.log('SQS message received:');
    // Process the message here if needed
    console.log(message);
    return;
  }
  // Handle Scheduled Event
  if (event['detail-type'] && event['detail-type'] === 'Scheduled Event') {
    const time = event.time;
    console.log(`This is a scheduled event from ${time}`);
  }
  const _queue = await (0, lambda_1.connectToSQSQueue)();
  console.log(`QueueName: ${await ((0, lambda_1.getSQSQueueName))()}`);
  console.log(`Queue URL: ${await ((0, lambda_1.getSQSQueueUrl))()}`);
};
exports.handler = handler;
//# sourceMappingURL=handler.js.map
