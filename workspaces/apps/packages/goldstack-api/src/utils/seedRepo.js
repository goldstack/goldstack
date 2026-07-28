'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
require('source-map-support').install();
const module_template_utils_1 = require('@goldstack/module-template-utils');
const template_build_1 = require('@goldstack/template-build');
const template_repository_1 = require('@goldstack/template-repository');
const template_repository_bucket_1 = require('@goldstack/template-repository-bucket');
const utils_sh_1 = require('@goldstack/utils-sh');
const seed = async () => {
  const templates = (0, module_template_utils_1.getModuleTemplatesNames)();
  const templateS3 = await (0, template_repository_bucket_1.connect)();
  const templateRepo = new template_repository_1.S3TemplateRepository({
    bucket: await (0, template_repository_bucket_1.getBucketName)(),
    workDir: './goldstackLocal/work/repo/',
    bucketUrl: 's3',
    s3: templateS3,
  });
  await (0, utils_sh_1.rmSafe)('./goldstackLocal/work/templates/');
  (0, utils_sh_1.mkdir)('-p', './goldstackLocal/work/templates');
  console.log('Building yarn-pnp-monorepo');
  await (0, template_build_1.build)('yarn-pnp-monorepo', {
    monorepoRoot: './../../../../',
    destinationDirectory: './goldstackLocal/work/templates/',
    templateRepository: templateRepo,
  });
  console.log('Template successfully built');
  for (const template of templates) {
    console.log('Building', template);
    await (0, template_build_1.build)(template, {
      monorepoRoot: './../../../../',
      destinationDirectory: './goldstackLocal/work/templates/',
      templateRepository: templateRepo,
    });
    console.log('Template successfully built');
  }
};
seed().catch((e) => {
  console.log(e);
  process.exit(0);
});
//# sourceMappingURL=seedRepo.js.map
