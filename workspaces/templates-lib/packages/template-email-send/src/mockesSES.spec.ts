import { createSESClient } from './mockedSES';
describe('MockedSES', () => {
  it('Should create instance', () => {
    const mockedSES = createSESClient();
    expect(mockedSES.send).toBeDefined();
  });
});
