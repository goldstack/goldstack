/* esbuild-ignore ui */

import type {
  RenderDocumentProps,
  ReactPropertiesType,
} from '@goldstack/template-ssr';

const renderDocument = async (
  props: RenderDocumentProps<ReactPropertiesType>
): Promise<string> => {
  const template = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${props.injectIntoHead}
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
  </head>
  <body>
    ${props.injectIntoBody}
  </body>
</html>
  `;
  return template;
};

export default renderDocument;
