// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { build } from '@goldstack/template-build';
import { getDefaultTemplates } from '@goldstack/utils-template-test';
import { rmSafe, mkdir } from '@goldstack/utils-sh';
import { S3TemplateRepository } from '@goldstack/template-repository';
import { connect, getBucketName } from '@goldstack/template-repository-bucket';

const seed = async (): Promise<void> => {
  const templates = getDefaultTemplates();

  const templateS3 = await connect();
  const templateRepo = new S3TemplateRepository({
    bucket: await getBucketName(),
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
    console.log('Building', template.getTemplateName());
    await build(template.getTemplateName(), {
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
