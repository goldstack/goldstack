import { S3TemplateRepository } from '@goldstack/template-repository';
import { connect, getBucketName } from '@goldstack/template-repository-bucket';
import { readPackageConfig } from '@goldstack/utils-package';
import { globSync } from '@goldstack/utils-sh';

import path from 'path';

const getGoldstackJsonPaths = (workspacePath: string): string[] => {
  const res = globSync(workspacePath.replace(/\\/g, '/') + 'packages/*/goldstack.json');
  return res;
};

export interface DocLink {
  packageName: string;
  link: string;
}

export const getDocLinks = async (workspacePath: string): Promise<DocLink[]> => {
  const goldstackJsonPaths = getGoldstackJsonPaths(workspacePath);

  const templateRepo = new S3TemplateRepository({
    s3: await connect(),
    bucket: await getBucketName(),
    bucketUrl: '',
    workDir: './goldstackLocal/work/repo/',
  });

  return await Promise.all(
    goldstackJsonPaths.map(async (goldstackJsonPath): Promise<DocLink> => {
      const goldstackConfig = readPackageConfig(path.dirname(goldstackJsonPath) + '/');

      const templateJson = await templateRepo.getLatestTemplateVersion(goldstackConfig.template);

      if (!templateJson) {
        console.warn(
          'Cannot obtain documentation link. Template cannot be loaded',
          goldstackConfig.template,
        );
        return {
          packageName: goldstackConfig.name,
          link: '',
        };
      }

      if (!templateJson.templateDocumentation) {
        console.log(
          'No documentation link is defined for template:',
          templateJson.templateDocumentation,
        );
      }

      return {
        packageName: goldstackConfig.name,
        link: templateJson.templateDocumentation,
      };
    }),
  );
};
