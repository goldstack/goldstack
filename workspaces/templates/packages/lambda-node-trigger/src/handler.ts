import type { Handler, SQSEvent } from 'aws-lambda';
import { connectToSQSQueue, getSQSQueueName, getSQSQueueUrl } from './lambda';

export const handler: Handler = async (event, context) => {
  // SQS message handling
  if (event.Records) {
    const sqsEvent = event as SQSEvent;
    const message = sqsEvent.Records[0].body;
    console.log('SQS message received:');

    // Process the message here if needed
    console.log(message);
    return;
  }

  // Handle Scheduled Event
  if (event['detail-type'] && event['detail-type'] === 'Scheduled Event') {
    const time = event['time'];
    console.log(`This is a scheduled event from ${time}`);
  }

  const queue = await connectToSQSQueue();
  console.log('QueueName: ' + (await getSQSQueueName()));
  console.log('Queue URL: ' + (await getSQSQueueUrl()));
};
