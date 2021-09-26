import unified from 'unified';
import markdown from 'remark-parse';
import rehypeMarkdown from './rehypeMarkdownToMarkdown';
// import stringify from 'rehype-stringify';
import stringify from 'mdast-util-to-markdown';

import table from 'mdast-util-gfm-table';

import matter from 'gray-matter';
import { read } from '@goldstack/utils-sh';

export async function resolveMarkdown(filePath: string): Promise<string> {
  try {
    let tree: any = undefined;
    tree = unified()
      .use(markdown as any)
      // .use(rehypeMarkdown, { filePath })
      .parse(matter(read(filePath)).content);
    tree = rehypeMarkdown({ filePath })(tree);
    // const file = await processor.process(md);
    // console.log(JSON.stringify(tree, null, 2));
    const file = stringify(tree, {
      extensions: [table.toMarkdown()],
    });

    // Replace non-breaking spaces (char code 160) with normal spaces to avoid style issues
    return (file as any).replace(/\xA0/g, ' ');
  } catch (error) {
    console.error(`Markdown to Markdown error: ${error}`);
    throw error;
  }
}
