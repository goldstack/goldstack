import { resolveMarkdown } from './resolveMarkdown';

describe('markdownToMarkdown', () => {
  it('Should render documentation markdown to markdown', async () => {
    const result = await resolveMarkdown(`${__dirname}/markdown/configure.md`);
    expect(result).toContain('[AWS region]');
  });
  it('Should render documentation with embedded documents', async () => {
    const file = `${__dirname}/markdown/template-s3.md`;
    const result = await resolveMarkdown(file);
    expect(result).toContain('[AWS region]');
    expect(result).toContain('s3 = connect()');
  });
});
