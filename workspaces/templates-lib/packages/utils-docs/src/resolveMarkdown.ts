import { read } from '@goldstack/utils-sh';
import matter from 'gray-matter';
import table from 'mdast-util-gfm-table';
// import stringify from 'rehype-stringify';
import stringify from 'mdast-util-to-markdown';
import markdown from 'remark-parse';
import unified from 'unified';
import rehypeMarkdown from './rehypeMarkdownToMarkdown';

export async function resolveMarkdown(filePath: string): Promise<string> {
  try {
    let tree: any; // biome-ignore lint/suspicious/noExplicitAny: Unified node type complex
    tree = unified()
      .use(markdown as any) // biome-ignore lint/suspicious/noExplicitAny: remark-parse type mismatch
      // .use(rehypeMarkdown, { filePath })
      .parse(matter(read(filePath)).content);
    tree = rehypeMarkdown({ filePath })(tree);
    // const file = await processor.process(md);
    // console.log(JSON.stringify(tree, null, 2));
    const file = stringify(tree, {
      extensions: [table.toMarkdown()],
    });

    // Replace non-breaking spaces (char code 160) with normal spaces to avoid style issues
    return (file as string).replace(/\xA0/g, ' ');
  } catch (error) {
    console.error(`Markdown to Markdown error: ${error}`);
    throw error;
  }
}
