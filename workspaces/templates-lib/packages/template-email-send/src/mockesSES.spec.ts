import { MockedSES } from './mockedSES';
describe('MockedSES', () => {
  it('Should create instance', () => {
    const mockedSES = new MockedSES();
    expect(mockedSES.sendEmail).toBeDefined();
  });
});
