/* esbuild-ignore ui */

import {
  type RenderDocumentProps,
  type ReactPropertiesType,
  getLocalHelperJs,
} from '@goldstack/template-ssr';

const renderDocument = async (props: RenderDocumentProps<ReactPropertiesType>): Promise<string> => {
  const tailwindPath = await props.staticFileMapper.resolve({
    name: 'tailwind.css',
  });

  let tailwindConfig: string | undefined;
  let localHelperJs: string | undefined;
  if (process.env.GOLDSTACK_DEPLOYMENT === 'local') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require('./../tailwind.config');

    tailwindConfig = JSON.stringify(config.theme);

    // only show helper in development environment
    localHelperJs = getLocalHelperJs();
  }

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

     ${
       process.env.GOLDSTACK_DEPLOYMENT === 'local'
         ? `<script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        `
         : ''
     }
     ${
       tailwindConfig
         ? `<script>tailwind.config = {theme: ${tailwindConfig}};</script>
        `
         : ''
     }
    ${`<link rel="stylesheet" type="text/css" href="${tailwindPath}"  />`}

  </head>
  <body>
    ${props.injectIntoBody}

    ${localHelperJs ? `<script>${localHelperJs}</script>` : ''}
  </body>
</html>
  `;
  return template;
};

export default renderDocument;
