import fs from 'fs';
import path, { dirname } from 'path';
import visit from 'unist-util-visit';

// biome-ignore lint/suspicious/noExplicitAny: Complex unified node type
export default function rehypeDocs({
  filePath,
  tag: _tag,
  processor,
}: {
  filePath: any;
  tag: any;
  processor: any;
}): any {
  // biome-ignore lint/suspicious/noExplicitAny: Unified node type
  function visitInlineCode(node: any): void {
    const value = node.value;
    if (value.startsWith('markdown:')) {
      const file = value.substr(9);

      const combinedPath = path.normalize(dirname(filePath) + '/' + file);

      if (!fs.existsSync(combinedPath)) {
        throw Error(`Invalid fragment specified; no such file "${combinedPath}"`);
      }

      const code = fs.readFileSync(combinedPath, 'utf8');

      const markdown = processor();

      try {
        node.value = `<div class="markdown-fragment">${markdown.processSync(code)}</div>`;
        node.type = 'html';
      } catch (e) {
        throw Error(`${e.message} \nFile: ${file}`);
      }
    }
  }
  // biome-ignore lint/suspicious/noExplicitAny: Unified node type
  function visitLink(node: any): void {
    if (node.children.length > 0 && node.children[0].value === '!embed') {
      const file = node.url;

      const combinedPath = path.normalize(dirname(filePath) + '/' + file);

      if (!fs.existsSync(combinedPath)) {
        throw Error(`Invalid fragment specified; no such file "${combinedPath}"`);
      }

      const code = fs.readFileSync(combinedPath, 'utf8');

      const markdown = processor();

      try {
        node.value = `<div class="markdown-fragment">${markdown.processSync(code)}</div>`;
        node.type = 'html';
      } catch (e) {
        throw Error(`${e.message} \nFile: ${file}`);
      }
    }
    if (node.children.length > 0 && node.children[0].value.indexOf('%') === 0) {
      node.value = `
      <div class="card card-bordered bg-soft-info">
        <div class="card-body">
        <h5 class="card-title">${node.children[0].value.substring(1)}</h5>
          <div class="card-text">
            <div class="embed-responsive embed-responsive-16by9">
              <iframe class="embed-responsive-item" src="${node.url}" allowfullscreen></iframe>
            </div>
          </div>
        </div>
      </div>`;
      // node.value = `<iframe
      //   width="560"
      //   height="315"
      //   src="${node.url}"
      //   frameborder="0"
      //   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      //   allowfullscreen>
      // </iframe>`;
      node.type = 'html';
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: Complex unified node type
  return function transformer(tree: any): any {
    visit(tree, 'inlineCode', visitInlineCode);
    // biome-ignore lint/suspicious/noExplicitAny: Unified node type
    visit(tree, (node: any) => node.type === 'link', visitLink);
    return tree;
  };
}
