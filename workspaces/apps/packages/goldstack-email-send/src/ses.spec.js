'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const client_ses_1 = require('@aws-sdk/client-ses');
const template_email_send_1 = require('@goldstack/template-email-send');
const ses_1 = require('./ses');
describe('SES template', () => {
  it('Should sent dev email', async () => {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.warn('Testing of email send skipped since no AWS credentials available');
      return;
    }
    const ses = await (0, ses_1.connect)('dev');
    const fromDomain = await (0, ses_1.getFromDomain)('dev');
    const res = await ses.send(
      new client_ses_1.SendEmailCommand({
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
    const sentEmailRequests = (0, template_email_send_1.getSentEmailRequests)(ses);
    expect(sentEmailRequests).toHaveLength(1);
  });
});
//# sourceMappingURL=ses.spec.js.map
