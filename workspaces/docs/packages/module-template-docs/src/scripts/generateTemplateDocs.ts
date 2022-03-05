// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { write, rmSafe } from '@goldstack/utils-sh';
import { transpile, resolveMarkdown } from '@goldstack/utils-docs-cli';

import { getModuleTemplatesNames } from '@goldstack/module-template-utils';

import path, { resolve } from 'path';
import fs from 'fs';

// relative to the root of this package
const paths = {
  docs: './../../docs/',
  templates: './../../../templates/packages/',
  root: './../../../../',
  buildSets: './../../../templates/packages/template-metadata/src/deploySets/',
  templateDocPath: 'docs/',
  readmeTemplatePath: 'README.template.md',
  readmePath: 'README.md',
  contributingTemplatePath: 'CONTRIBUTING.template.md',
  contributingPath: 'CONTRIBUTING.md',
};

const moduleTemplates = getModuleTemplatesNames().map((e) => {
  return {
    dirName: `${e}/`,
    docPath: `modules/${e}/`,
  };
});

const generateMarkdownDocs = async (
  sourceFileName: string,
  targetFileName: string
) => {
  const result = await resolveMarkdown(sourceFileName);
  write(result, targetFileName);
  console.log('Writing Markdown docs', path.resolve(targetFileName));
};

const run = async () => {
  // Step 0:
  //   Remove templates that do not have documentation
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
    const sourceFileName =
      paths.templates + moduleTemplate.dirName + paths.readmeTemplatePath;
    const targetFileName =
      paths.templates + moduleTemplate.dirName + paths.readmePath;
    generateMarkdownDocs(sourceFileName, targetFileName);
  }

  // Step 3:
  //    Generate boilerplate docs
  console.log(resolve(paths.buildSets));
  generateMarkdownDocs(
    paths.buildSets + 'nextjsBootstrap.template.README.md',
    paths.buildSets + 'nextjsBootstrap.README.md'
  );

  // Step 4:
  //   Generate Goldstack root readme
  const sourceFileName = path.resolve(
    `${paths.root}${paths.readmeTemplatePath}`
  );
  const targetFileName = `${paths.root}${paths.readmePath}`;
  generateMarkdownDocs(sourceFileName, targetFileName);

  // Step 5:
  //   Generate Goldstack root contributing guidelines
  const sourceFileNameContributing = path.resolve(
    `${paths.root}${paths.contributingTemplatePath}`
  );
  const targetFileNameContributing = `${paths.root}${paths.contributingPath}`;
  generateMarkdownDocs(sourceFileNameContributing, targetFileNameContributing);
};

run()
  .then(() => console.log('all done'))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
