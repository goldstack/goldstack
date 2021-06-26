import { message } from './index';

describe('Library', () => {
  it('Should have the correct message', () => {
    expect(message).toContain('hi');
  });
});
