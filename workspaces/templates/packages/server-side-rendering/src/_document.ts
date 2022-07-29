import type { RenderDocumentProps } from '@goldstack/template-ssr';

export const renderDocument = ({
  bundledJsPath,
  styles,
  renderedHtml,
}: RenderDocumentProps): string => {
  const template = `
<!DOCTYPE html>
<html>
  <head>
    ${styles ? `<style>${styles}</style>` : ''}
  </head>
  <body>
    <div id="root">${renderedHtml}</div>
    <script src="${bundledJsPath}"></script>
  </body>
</html>
  `;
  return template;
};
