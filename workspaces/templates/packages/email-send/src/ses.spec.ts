import { connect, getFromDomain } from './ses';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { getSentEmailRequests } from '@goldstack/template-email-send';

describe('SES template', () => {
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
        Source: 'sender@' + fromDomain,
      })
    );

    const sentEmailRequests = getSentEmailRequests(ses);
    expect(sentEmailRequests).toHaveLength(1);
  });
});
