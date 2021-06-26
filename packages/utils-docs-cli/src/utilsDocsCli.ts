import { renderPage, resolveMarkdown as resolve } from '@goldstack/utils-docs';

export const getDocsDir = (): string => {
  return './../../../../workspaces/docs/docs/';
};

export const transpile = async (path: string): Promise<string> => {
  const result = await renderPage(path);
  return result.html;
};

export const resolveMarkdown = async (path: string): Promise<string> => {
  const result = await resolve(path);
  return result;
};
