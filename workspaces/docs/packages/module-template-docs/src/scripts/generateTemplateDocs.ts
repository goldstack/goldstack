// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { write, rmSafe } from '@goldstack/utils-sh';
import { transpile, resolveMarkdown } from '@goldstack/utils-docs-cli';

import { getModuleTemplatesNames } from '@goldstack/module-template-utils';

import path from 'path';
import fs from 'fs';

// relative to the root of this package
const paths = {
  docs: './../../docs/',
  templates: './../../../templates/packages/',
  root: './../../../../',
  templateDocPath: 'docs/',
  readmeTemplatePath: 'README.template.md',
  readmePath: 'README.md',
};

const moduleTemplates = getModuleTemplatesNames().map((e) => {
  return {
    dirName: `${e}/`,
    docPath: `modules/${e}/`,
  };
});
// [
//   {
//     dirName: 'email-send/',
//     docPath: 'modules/email-send/',
//   },
//   {
//     dirName: 'lambda-express/',
//     docPath: 'modules/lambda-express/',
//   },
//   {
//     dirName: 'app-nextjs/',
//     docPath: 'modules/app-nextjs/',
//   },
//   {
//     dirName: 'app-nextjs-bootstrap/',
//     docPath: 'modules/app-nextjs-bootstrap/',
//   },
//   {
//     dirName: 's3/',
//     docPath: 'modules/s3/',
//   },
//   {
//     dirName: 'static-website-aws/',
//     docPath: 'modules/static-website-aws/',
//   },
//   {
//     dirName: 'lambda-go-gin/',
//     docPath: 'modules/lambda-go-gin/',
//   },
// ];

const run = async () => {
  // Step 0:
  //   Remove templates that do not have documenation
  const fixedModuleTemplates = moduleTemplates.filter((t) => {
    const sourcePath = paths.docs + t.docPath;
    return fs.existsSync(sourcePath);
  });

  // Step 1:
  //   Transpile docs from Markdown to HTML
  for (let i = 0; i < fixedModuleTemplates.length; i++) {
    const moduleTemplate = fixedModuleTemplates[i];
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
  for (let i = 0; i < fixedModuleTemplates.length; i++) {
    const moduleTemplate = fixedModuleTemplates[i];
    const result = await resolveMarkdown(
      paths.templates + moduleTemplate.dirName + paths.readmeTemplatePath
    );
    const targetFileName =
      paths.templates + moduleTemplate.dirName + paths.readmePath;
    write(result, targetFileName);
    console.log('Writing Markdown doc file', path.resolve(targetFileName));
  }

  // Step 3:
  //   Generate goldstack root readme
  const sourceFileName = path.resolve(
    `${paths.root}${paths.readmeTemplatePath}`
  );
  const result = await resolveMarkdown(sourceFileName);
  const targetFileName = `${paths.root}${paths.readmePath}`;
  write(result, targetFileName);
  console.log('Writing root Markdown Readme', path.resolve(targetFileName));
};

run()
  .then(() => console.log('all done'))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
