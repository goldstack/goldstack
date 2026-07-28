'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const client_ses_1 = require('@aws-sdk/client-ses');
const ses_1 = require('./ses');
describe('SES template', () => {
  it('Should connect to mocked SES', async () => {
    const ses = await (0, ses_1.connect)();
    const fromDomain = await (0, ses_1.getFromDomain)();
    expect(fromDomain).toBe('test.local');
    await ses.send(
      new client_ses_1.SendEmailCommand({
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
    const sentEmailRequests = (0, ses_1.getSentEmailRequests)(ses);
    expect(sentEmailRequests).toHaveLength(1);
  });
});
//# sourceMappingURL=ses.spec.js.map
