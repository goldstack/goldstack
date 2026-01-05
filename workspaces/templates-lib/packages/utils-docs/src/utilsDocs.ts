import { read } from '@goldstack/utils-sh';
import matter from 'gray-matter';
import path from 'path';
import { markdownToHtml } from './markdownToHtml';

export { markdownToHtml } from './markdownToHtml';

export { resolveMarkdown } from './resolveMarkdown';

export interface RenderPageResult {
  html: string;
  data: unknown;
}

export const renderPage = async (filePath: string): Promise<RenderPageResult> => {
  const fileContent = read(filePath);
  const { data, content } = matter(fileContent);

  const result = await markdownToHtml(path.resolve(filePath), data, content);
  return {
    html: result,
    data,
  };
};
