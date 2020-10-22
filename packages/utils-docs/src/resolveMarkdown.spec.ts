import { resolveMarkdown } from './resolveMarkdown';
import { read } from '@goldstack/utils-sh';

describe('markdownToMarkdown', () => {
  it('Should render documentation markdown to markdown', async () => {
    const result = await resolveMarkdown(__dirname + '/markdown/configure.md');
    console.log(result);
  });
  it.only('Should render documentation with embedded documents', async () => {
    const file = __dirname + '/markdown/template-s3.md';
    const result = await resolveMarkdown(file);
    // expect(result).
    console.log(result);
  });
});
