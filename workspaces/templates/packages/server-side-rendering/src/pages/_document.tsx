export interface RenderDocumentProps {
  bundledJsPath: string;
  renderedHtml: string;
}

export const renderDocument = ({
  bundledJsPath,
  renderedHtml,
}: RenderDocumentProps): string => {
  const template = `
<!DOCTYPE html>
<html>
  <head>
    <script src="${bundledJsPath}"></script>
  </head>
  <body>
    <div id="root">${renderedHtml}</div>
  </body>
</html>
  `;
  return template;
};
