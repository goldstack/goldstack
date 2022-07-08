import type { RenderDocumentProps } from '@goldstack/template-ssr';

export const renderDocument = ({
  bundledJsPath,
  renderedHtml,
}: RenderDocumentProps): string => {
  const template = `
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <div id="root">${renderedHtml}</div>
    <script src="${bundledJsPath}"></script>
  </body>
</html>
  `;
  return template;
};
