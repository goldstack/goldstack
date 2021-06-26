// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { write, rmSafe, pwd } from '@goldstack/utils-sh';
import {
  getDocsDir,
  transpile,
  resolveMarkdown,
} from '@goldstack/utils-docs-cli';

import path from 'path';

// relative to the root of this package
const paths = {
  docs: './../../docs/',
  templates: './../../../templates/packages/',
  templateDocPath: 'docs/',
  readmeTemplatePath: 'README.template.md',
  readmePath: 'README.md',
};

const moduleTemplates = [
  {
    dirName: 'email-send/',
    docPath: 'modules/email-send/',
  },
  {
    dirName: 'lambda-express/',
    docPath: 'modules/lambda-express/',
  },
  {
    dirName: 'app-nextjs/',
    docPath: 'modules/app-nextjs/',
  },
  {
    dirName: 'app-nextjs-bootstrap/',
    docPath: 'modules/app-nextjs-bootstrap/',
  },
  {
    dirName: 's3/',
    docPath: 'modules/s3/',
  },
  {
    dirName: 'static-website-aws/',
    docPath: 'modules/static-website-aws/',
  },
  {
    dirName: 'lambda-go-gin/',
    docPath: 'modules/lambda-go-gin/',
  },
];

const run = async () => {
  // Step 1:
  //   Transpile docs from Markdown to HTML
  for (let i = 0; i < moduleTemplates.length; i++) {
    const moduleTemplate = moduleTemplates[i];
    const docsDir = paths.docs;
    const templateDocFiles = ['index.md', 'template-configure.md'];

    for (const docFile of templateDocFiles) {
      const sourcePath = docsDir + moduleTemplate.docPath + docFile;
      const result = await transpile(sourcePath);
      const targetFileName =
        paths.templates +
        moduleTemplate.dirName +
        paths.templateDocPath +
        path.parse(sourcePath).name +
        '.html';
      await rmSafe(targetFileName);
      write(result, targetFileName);
      console.log('Writing HTML doc file', path.resolve(targetFileName));
    }
  }

  // Step 2:
  //   Generate template Markdown docs
  for (let i = 0; i < moduleTemplates.length; i++) {
    const moduleTemplate = moduleTemplates[i];
    const result = await resolveMarkdown(
      paths.templates + moduleTemplate.dirName + paths.readmeTemplatePath
    );
    const targetFileName =
      paths.templates + moduleTemplate.dirName + paths.readmePath;
    write(result, targetFileName);
    console.log('Writing Markdown doc file', path.resolve(targetFileName));
  }
};

run()
  .then(() => console.log('all done'))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
