import { findComments, mustIgnore } from './esbuildIgnoreWithCommentsPlugin';

describe('Comment Ignore plugin', () => {
  it('Should identify instances of comments in text', async () => {
    const res1 = findComments(`
    There is some content in this file and then there is
    /* esbuild-ignore ui */
    /* esbuild-ignore server */
    And afterwards we got a bit of stuff as well`);
    expect(res1).toEqual(['ui', 'server']);
    const res2 = findComments(`
    There is some content in this file and then there is
    /* esbuild-ignore */
    /* esbuild-ignore */
    And afterwards we got a bit of stuff as well`);
    expect(res2).toHaveLength(2);
  });
  it('Should determine which files to ignore', async () => {
    expect(mustIgnore(['ui', 'server'], ['server'])).toBeTruthy();
    expect(mustIgnore(['ui', 'server'], ['dummy'])).toBeFalsy();
    expect(mustIgnore(['ui', 'server'], [])).toBeTruthy();
    expect(mustIgnore(['', ''], ['server'])).toBeTruthy();
  });
});
