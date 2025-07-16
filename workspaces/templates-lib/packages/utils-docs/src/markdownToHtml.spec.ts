import { markdownToHtml } from './markdownToHtml';
import { read } from '@goldstack/utils-sh';

describe('markdownToHtml', () => {
  it('Should render documentation markdown to html', async () => {
    const result = await markdownToHtml(
      __dirname + '/markdown/configure.md',
      {},
      read(__dirname + '/markdown/configure.md'),
    );
    expect(result).toContain('<p>');
    expect(result).toContain('<a');
  });
  it('Should render documentation with embedded documents', async () => {
    const file = __dirname + '/markdown/template-s3.md';
    const result = await markdownToHtml(file, {}, read(file));
    expect(result).toContain('<p>');
    expect(result).toContain('<a');
  });
});
