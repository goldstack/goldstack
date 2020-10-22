import fs from 'fs';
import { dirname } from 'path';
import visit from 'unist-util-visit';

import path from 'path';

import { read } from '@goldstack/utils-sh';

import unified from 'unified';
import markdown from 'remark-parse';

function fileToMarkdownTree(filePath: string): any {
  const data = read(filePath);
  const tree = unified()
    .use(markdown as any)
    .parse(data);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return rehypeDocs({ filePath })(tree);
}

export default function rehypeDocs({ filePath }): any {
  function visitInlineCode(node: any): void {
    const value = node.value;
    if (value.startsWith('markdown:')) {
      const file = value.substr(9);

      const combinedPath = path.normalize(dirname(filePath) + '/' + file);

      if (!fs.existsSync(combinedPath)) {
        throw Error(
          `Invalid fragment specified; no such file "${combinedPath}"`
        );
      }

      const tree = fileToMarkdownTree(combinedPath);

      try {
        node.children = tree.children;
        node.value = '';
        node.type = 'paragraph';
      } catch (e) {
        throw Error(`${e.message} \nFile: ${file}`);
      }
    }
  }
  function visitLink(node: any): void {
    if (node.children.length > 0 && node.children[0].value === '!embed') {
      const file = node.url;

      const path = dirname(filePath) + '/' + file;

      if (!fs.existsSync(path)) {
        throw Error(`Invalid fragment specified; no such file "${path}"`);
      }

      const tree = fileToMarkdownTree(path);

      try {
        node.children = tree.children;
        node.value = '';
        node.type = 'paragraph';
      } catch (e) {
        throw Error(`${e.message} \nFile: ${file}`);
      }
    }
    if (
      node.children.length > 0 &&
      node.children[0].value &&
      node.children[0].value.indexOf('%') === 0
    ) {
      node.value = `[Video: ${node.children[0].value.substring(1)}](${
        node.url
      })`;
      node.type = 'text';
    }
  }

  return function transformer(tree: any): void {
    visit(tree, 'inlineCode', visitInlineCode);
    visit(tree, (node: any) => node.type === 'link', visitLink);
    return tree;
  };
}
