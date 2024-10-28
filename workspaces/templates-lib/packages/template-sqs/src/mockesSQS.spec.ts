import { createSQSClient } from './mockedSQS';
describe('MockedSQS', () => {
  it('Should create instance', () => {
    const mockedSQS = createSQSClient();
    expect(mockedSQS.send).toBeDefined();
  });
});
