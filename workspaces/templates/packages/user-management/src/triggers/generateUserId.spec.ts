import { generateUserId } from './generateUserId';

describe('generateUserId', () => {
  test('should generate a 36 character UUID', () => {
    const userId = generateUserId();
    expect(userId.length).toBe(36);
  });
});
