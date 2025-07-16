import { SendMessageCommand, type SendMessageRequest } from '@aws-sdk/client-sqs';
import {
  getSentMessageRequests,
  connect,
  getMockedDLQSQS,
  getSQSQueueUrl,
  getSQSDLQQueueUrl,
  getMockedSQS,
} from './templateSqs';

describe('SQS connect', () => {
  it('Should connect to mocked SQS', async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const sqs = getMockedSQS({ name: 'template-sqs' }, () => {});
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: await getSQSQueueUrl({ name: 'template-sqs' }, {}, {}, 'local'),
        MessageBody: 'This is a test message',
      }),
    );

    const sentMessageRequests = getSentMessageRequests(sqs);
    expect(sentMessageRequests).toHaveLength(1);
    expect(sentMessageRequests[0].MessageBody).toBe('This is a test message');
  });
  it('Should connect to mocked DLQ SQS', async () => {
    const sqs = getMockedDLQSQS({ name: 'template-sqs' });
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: await getSQSDLQQueueUrl({ name: 'template-sqs' }, {}, {}, 'local'),
        MessageBody: 'This is a second test message',
      }),
    );

    const sentMessageRequests = getSentMessageRequests(sqs);
    expect(sentMessageRequests).toHaveLength(1);
    expect(sentMessageRequests[0].MessageBody).toBe('This is a second test message');
  });
  it('Should connect to multiple mocked SQS', async () => {
    const callbackHandledRequests1: SendMessageRequest[] = [];

    const callbackHandledRequests2: SendMessageRequest[] = [];
    const sqs1 = getMockedSQS({ name: 'template-sqs-1' }, (request) => {
      callbackHandledRequests1.push(request);
    });
    const sqs2 = getMockedSQS({ name: 'template-sqs-2' }, (request) => {
      callbackHandledRequests2.push(request);
    });
    await sqs1.send(
      new SendMessageCommand({
        QueueUrl: await getSQSQueueUrl({ name: 'template-sqs-1' }, {}, {}, 'local'),
        MessageBody: 'This is a test message for queue 1',
      }),
    );

    sqs2.send(
      new SendMessageCommand({
        QueueUrl: await getSQSQueueUrl({ name: 'template-sqs-2' }, {}, {}, 'local'),
        MessageBody: 'This is a test message for queue 2',
      }),
    );

    expect(callbackHandledRequests1).toHaveLength(1);
    expect(callbackHandledRequests2).toHaveLength(1);
    const sentMessageRequests = getSentMessageRequests(sqs1);
    expect(sentMessageRequests).toHaveLength(1);
    expect(sentMessageRequests[0].MessageBody).toBe('This is a test message for queue 1');
  });
});
