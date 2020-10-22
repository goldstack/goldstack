import unified from 'unified';
import markdown from 'remark-parse';
import docs from './rehypeDocs';
import rehypeMarkdown from './rehypeMarkdownToMarkdown';
// import stringify from 'rehype-stringify';
import stringify from 'mdast-util-to-markdown';

import { read } from '@goldstack/utils-sh';

export async function resolveMarkdown(filePath): Promise<string> {
  try {
    let tree: any = undefined;
    tree = unified()
      .use(markdown as any)
      .use(rehypeMarkdown, { filePath })
      .parse(read(filePath));
    // const file = await processor.process(md);
    const file = stringify(tree);
    // Replace non-breaking spaces (char code 160) with normal spaces to avoid style issues
    return (file as any).replace(/\xA0/g, ' ');
  } catch (error) {
    console.error(`Markdown to Markdown error: ${error}`);
    throw error;
  }
}
