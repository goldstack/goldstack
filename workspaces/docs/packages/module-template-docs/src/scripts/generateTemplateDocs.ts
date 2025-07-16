// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { write, rmSafe } from '@goldstack/utils-sh';
import { transpile, resolveMarkdown } from '@goldstack/utils-docs-cli';

import { getModuleTemplatesNames } from '@goldstack/module-template-utils';

import path from 'path';
import fs from 'fs';
import assert from 'assert';

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
    docPath: `templates/${e}/`,
  };
});

const generateMarkdownDocs = async (sourceFileName: string, targetFileName: string) => {
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

  console.log(
    `Processing templates:\n    ${fixedModuleTemplates.map((t) => t.dirName).join('\n    ')}`,
  );
  assert(fixedModuleTemplates.length > 0, 'No templates found');
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
    }
  }

  // Step 2:
  //   Generate template Markdown docs
  for (let i = 0; i < fixedModuleTemplates.length; i++) {
    const moduleTemplate = fixedModuleTemplates[i];
    const sourceFileName = paths.templates + moduleTemplate.dirName + paths.readmeTemplatePath;
    const targetFileName = paths.templates + moduleTemplate.dirName + paths.readmePath;
    await generateMarkdownDocs(sourceFileName, targetFileName);
  }

  // Step 3:
  //    Generate boilerplate docs
  await generateMarkdownDocs(
    paths.buildSets + 'nextjsBootstrap.template.README.md',
    paths.buildSets + 'nextjsBootstrap.README.md',
  );
  await generateMarkdownDocs(
    paths.buildSets + 'emailSend.template.README.md',
    paths.buildSets + 'emailSend.README.md',
  );
  await generateMarkdownDocs(
    paths.buildSets + 'hetznerVPS.template.README.md',
    paths.buildSets + 'hetznerVPS.README.md',
  );
  await generateMarkdownDocs(
    paths.buildSets + 'lambdaPythonJob.template.README.md',
    paths.buildSets + 'lambdaPythonJob.README.md',
  );
  await generateMarkdownDocs(
    paths.buildSets + 's3.template.README.md',
    paths.buildSets + 's3.README.md',
  );
  await generateMarkdownDocs(
    paths.buildSets + 'dynamodb.template.README.md',
    paths.buildSets + 'dynamodb.README.md',
  );
  await generateMarkdownDocs(
    paths.buildSets + 'staticWebsite.template.README.md',
    paths.buildSets + 'staticWebsite.README.md',
  );
  await generateMarkdownDocs(
    paths.buildSets + 'serverSideRendering.template.README.md',
    paths.buildSets + 'serverSideRendering.README.md',
  );
  await generateMarkdownDocs(
    paths.buildSets + 'userManagement.template.README.md',
    paths.buildSets + 'userManagement.README.md',
  );

  // Step 4:
  //   Generate Goldstack root readme
  const sourceFileName = path.resolve(`${paths.root}${paths.readmeTemplatePath}`);
  const targetFileName = `${paths.root}${paths.readmePath}`;
  await generateMarkdownDocs(sourceFileName, targetFileName);

  // Step 5:
  //   Generate Goldstack root contributing guidelines
  const sourceFileNameContributing = path.resolve(`${paths.root}${paths.contributingTemplatePath}`);
  const targetFileNameContributing = `${paths.root}${paths.contributingPath}`;
  await generateMarkdownDocs(sourceFileNameContributing, targetFileNameContributing);

  // Step 6:
  //    Generate Readme included in project project.
  await generateMarkdownDocs(
    `${paths.docs}templates/yarn-pnp-monorepo/index.md`,
    `${paths.root}/workspaces/templates/README.md`,
  );
};

run()
  .then(() => console.log('Documentation generated'))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
