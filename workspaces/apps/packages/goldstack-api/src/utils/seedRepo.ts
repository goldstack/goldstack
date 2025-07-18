require('source-map-support').install();

import { getModuleTemplatesNames } from '@goldstack/module-template-utils';
import { build } from '@goldstack/template-build';
import { S3TemplateRepository } from '@goldstack/template-repository';
import { connect, getBucketName } from '@goldstack/template-repository-bucket';
import { mkdir, rmSafe } from '@goldstack/utils-sh';

const seed = async (): Promise<void> => {
  const templates = getModuleTemplatesNames();

  const templateS3 = await connect();
  const templateRepo = new S3TemplateRepository({
    bucket: await getBucketName(),
    workDir: './goldstackLocal/work/repo/',
    bucketUrl: 's3',
    s3: templateS3,
  });

  await rmSafe('./goldstackLocal/work/templates/');
  mkdir('-p', './goldstackLocal/work/templates');

  console.log('Building yarn-pnp-monorepo');
  await build('yarn-pnp-monorepo', {
    monorepoRoot: './../../../../',
    destinationDirectory: './goldstackLocal/work/templates/',
    templateRepository: templateRepo,
  });
  console.log('Template successfully built');

  for (const template of templates) {
    console.log('Building', template);
    await build(template, {
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
