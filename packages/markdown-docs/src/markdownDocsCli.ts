import { renderPage } from '@goldstack/utils-docs';

export const getDocsDir = (): string => {
  return './../../../goldstack/docs/';
};

export const transpile = async (path: string): Promise<string> => {
  const result = await renderPage(path);
  return result.html;
};
