import { SendEmailCommand } from '@aws-sdk/client-ses';
import { connect, getSentEmailRequests } from './templateEmailSend';

describe('SES connect', () => {
  it('Should connect to mocked SES', async () => {
    const ses = await connect({}, {}, 'local');
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
        Source: 'sender@example.com',
      }),
    );

    const sentEmailRequests = getSentEmailRequests(ses);
    expect(sentEmailRequests).toHaveLength(1);
  });
});
