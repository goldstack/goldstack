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
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
  </head>
  <body>
    <div id="root">${renderedHtml}</div>
    <script src="${bundledJsPath}"></script>
  </body>
</html>
  `;
  return template;
};
