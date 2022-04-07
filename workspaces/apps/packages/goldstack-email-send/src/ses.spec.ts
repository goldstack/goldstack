import { connect, getMockedSES, getFromDomain } from './ses';

describe('SES template', () => {
  it('Should sent dev email', async () => {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.warn(
        'Testing of email send skipped since no AWS credentials available'
      );
      return;
    }
    const ses = await connect('dev');
    const fromDomain = await getFromDomain('dev');

    const res = await ses
      .sendEmail({
        Destination: { ToAddresses: ['mxrogm@gmail.com'] },
        Message: {
          Subject: { Charset: 'UTF-8', Data: 'Test email' },
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: 'This is the message body in text format.',
            },
          },
        },
        Source: '"Goldstack" <no-reply@' + fromDomain + '>',
      })
      .promise();
    expect(res.MessageId).toBeDefined();
  });
  it('Should connect to mocked SES', async () => {
    const ses = await connect();
    const fromDomain = await getFromDomain();
    expect(fromDomain).toBe('test.local');
    await ses
      .sendEmail({
        Destination: { ToAddresses: ['test@test.com'] },
        Message: {
          Subject: { Charset: 'UTF-8', Data: 'Test email' },
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: 'This is the message body in text format.',
            },
          },
        },
        Source: 'sender@' + fromDomain,
      })
      .promise();

    const mockedSES = getMockedSES();
    const sentEmailRequests = mockedSES.getSentEmailRequests();
    expect(sentEmailRequests).toHaveLength(1);
  });
});
