// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { build } from '@goldstack/template-build';
import { rmSafe, mkdir } from '@goldstack/utils-sh';
import { S3TemplateRepository } from '@goldstack/template-repository';
import { connect, getBucketName } from '@goldstack/template-repository-bucket';

export interface Template {
  getTemplateName(): string;
}

export class StaticWebsiteAwsTemplate implements Template {
  getTemplateName(): string {
    return 'static-website-aws';
  }
}

export class AppNextJsTemplate implements Template {
  getTemplateName(): string {
    return 'app-nextjs';
  }
}

export class AppNextJsBootstrapTemplate implements Template {
  getTemplateName(): string {
    return 'app-nextjs-bootstrap';
  }
}

export class DockerImageAwsTemplate implements Template {
  getTemplateName(): string {
    return 'docker-image-aws';
  }
}

export class S3Template implements Template {
  getTemplateName(): string {
    return 's3';
  }
}

export class LambdaGoGinTemplate implements Template {
  getTemplateName(): string {
    return 'lambda-go-gin';
  }
}

export class EmailSendTemplate implements Template {
  getTemplateName(): string {
    return 'email-send';
  }
}

export class LambdaExpressTemplate implements Template {
  getTemplateName(): string {
    return 'lambda-express';
  }
}

export const getDefaultTemplates = (): Template[] => {
  return [
    new StaticWebsiteAwsTemplate(),
    new AppNextJsTemplate(),
    new AppNextJsBootstrapTemplate(),
    new DockerImageAwsTemplate(),
    new S3Template(),
    new LambdaExpressTemplate(),
    new LambdaGoGinTemplate(),
    new EmailSendTemplate(),
  ];
};

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
