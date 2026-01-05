// @ts-ignore
import GithubSlugger from 'github-slugger';
// @ts-ignore
import toStringMdCast from 'mdast-util-to-string';
import visit from 'unist-util-visit';
import permalinkIcon from './permalinkIconAst';

const ABSOLUTE_URL = /^(https?:\/\/|\/\/)/i;
// The headers will be updated to include a link to their hash
const HEADINGS = ['h2', 'h3', 'h4', 'h5', 'h6'];

export default function rehypeDocs({
  filePath: _filePath,
  tag: _tag,
  processor: _processor,
}: {
  filePath: any;
  tag: any;
  processor: any;
}) {
  const slugger = new GithubSlugger();
  const anchorSlugger = new GithubSlugger();

  function visitAnchor(node: any): void {
    const props = node.properties;
    const href = props?.href;

    if (!href) return;

    if (props.href === href) {
      const isAbsoluteUrl = ABSOLUTE_URL.test(href);
      // const isHash = href[0] === '#';
      // const isRepoUrl = !isHash;

      if (isAbsoluteUrl) {
        props.className = 'absolute';
        props.target = '_blank';
        props.rel = 'noopener noreferrer';

        return;
      }
    }

    const [relativePath, hash] = props.href.split('#');

    // Reset the slugger because single pages can have multiple urls to the same hash
    anchorSlugger.reset();
    // The URL is relative at this point
    props.className = 'relative';
    // Update the hash used by anchors to match the one set for headers
    props.href = hash ? `${relativePath}#${anchorSlugger.slug(hash)}` : relativePath;
  }

  function visitHeading(node: any): void {
    const text = toStringMdCast(node);

    if (!text) return;

    const id = slugger.slug(text);

    node.properties.className = 'heading';
    node.children = [
      {
        type: 'element',
        tagName: 'span',
        properties: { id },
      },
      {
        type: 'element',
        tagName: 'a',
        properties: {
          href: `#${id}`,
        },
        children: node.children,
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { className: 'permalink' },
        children: [permalinkIcon],
      },
    ];
  }

  return function transformer(tree: any): void {
    visit(tree, (node: any) => node.tagName === 'a', visitAnchor);
    visit(tree, (node: any) => HEADINGS.includes(node.tagName), visitHeading);
  };
}
