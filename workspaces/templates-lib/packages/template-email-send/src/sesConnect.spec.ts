import { connect, getMockedSES } from './sesConnect';
describe('SES connect', () => {
  it('Should connect to mocked SES', async () => {
    const ses = await connect({}, {}, 'local');
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
        Source: 'sender@example.com',
      })
      .promise();

    const mockedSES = getMockedSES();
    const sentEmailRequests = mockedSES.getSentEmailRequests();
    expect(sentEmailRequests).toHaveLength(1);
  });
});
