export interface RenderDocumentProps {
  bundledJsPath: string;
}

export const renderDocument = ({
  bundledJsPath,
}: RenderDocumentProps): string => {
  return ''`
<!DOCTYPE html>
<html>
  <head>
    <script src="${bundledJsPath}"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
  ```;
};
