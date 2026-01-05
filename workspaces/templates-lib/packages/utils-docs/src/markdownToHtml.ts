// based on https://github.com/vercel/next-site/blob/e2cb07a057bf75bded2571a1b639b0017572f4b8/lib/docs/markdown-to-html.js

// @ts-ignore
import prism from '@mapbox/rehype-prism';
// https://github.com/syntax-tree/hast-util-sanitize/blob/master/lib/github.json
import githubSchema from 'hast-util-sanitize/lib/github.json';
// @ts-ignore
import raw from 'rehype-raw';
// @ts-ignore
import html from 'rehype-stringify';
import markdown from 'remark-parse';
// @ts-ignore
import remarkToRehype from 'remark-rehype';
import unified from 'unified';
import docs from './rehypeDocs';
import rehypeMarkdown from './rehypeMarkdownToHtml';

// Allow className for all elements
githubSchema.attributes['*'].push('className');

const handlers = {
  // Add a className to inlineCode so we can differentiate between it and code fragments
  inlineCode(_h: any, node: any) {
    return {
      ...node,
      type: 'element',
      tagName: 'code',
      properties: { className: 'inline' },
      children: [
        {
          type: 'text',
          value: node.value,
        },
      ],
    };
  },
};

export async function markdownToHtml(filePath: string, tag: any, md: string): Promise<string> {
  try {
    // Init the processor with our custom plugin
    let processor: any; // biome-ignore lint/suspicious/noExplicitAny: Unified processor type complex
    processor = unified()
      .use(markdown as any) // biome-ignore lint/suspicious/noExplicitAny: remark-parse type mismatch
      .use(rehypeMarkdown, { filePath, tag, processor: () => processor })
      .use(remarkToRehype, { handlers, allowDangerousHTML: true })
      // Add custom HTML found in the markdown file to the AST
      .use(raw)
      // Sanitize the HTML
      // .use(sanitize, githubSchema)
      // Add syntax highlighting to the sanitized HTML
      .use(prism)
      .use(html)
      .freeze()()
      .use(docs, { filePath, tag, processor });
    const file = await processor.process(md);

    // Replace non-breaking spaces (char code 160) with normal spaces to avoid style issues
    return (file.contents as string).replace(/\xA0/g, ' ');
  } catch (error) {
    console.error(`Markdown to HTML error: ${error}`);
    throw error;
  }
}
