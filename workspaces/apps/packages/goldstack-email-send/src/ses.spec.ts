import { SendEmailCommand } from '@aws-sdk/client-ses';
import { getSentEmailRequests } from '@goldstack/template-email-send';
import { connect, getFromDomain } from './ses';

describe('SES template', () => {
  it('Should sent dev email', async () => {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.warn('Testing of email send skipped since no AWS credentials available');
      return;
    }
    const ses = await connect('dev');
    const fromDomain = await getFromDomain('dev');

    const res = await ses.send(
      new SendEmailCommand({
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
        Source: `"Goldstack" <no-reply@${fromDomain}>`,
      }),
    );
    expect(res.MessageId).toBeDefined();
  });
  it('Should connect to mocked SES', async () => {
    const ses = await connect();
    const fromDomain = await getFromDomain();
    expect(fromDomain).toBe('test.local');
    await ses.send(
      new SendEmailCommand({
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
        Source: `sender@${fromDomain}`,
      }),
    );

    const sentEmailRequests = getSentEmailRequests(ses);
    expect(sentEmailRequests).toHaveLength(1);
  });
});
