import matter from 'gray-matter';

import { read } from '@goldstack/utils-sh';
import { markdownToHtml } from './markdownToHtml';
import path from 'path';

export { markdownToHtml } from './markdownToHtml';

export interface RenderPageResult {
  html: string;
  data: any;
}

export const renderPage = async (
  filePath: string
): Promise<RenderPageResult> => {
  const fileContent = read(filePath);
  const { data, content } = matter(fileContent);

  const result = await markdownToHtml(path.resolve(filePath), data, content);
  return {
    html: result,
    data,
  };
};
