import { debug } from '@goldstack/utils-log';
import type { PackageProjectConfiguration } from '@goldstack/utils-project';
import { mkdir, rm } from '@goldstack/utils-sh';
import extract from 'extract-zip';
import { readdirSync } from 'fs';
import path from 'path';
import {
  type ProjectBuildParams,
  type TemplateReference,
  assertTemplateReferenceVersion,
  assert,
  setPackageName,
} from './projectBuild';

export const buildTemplate = async (
  params: ProjectBuildParams,
  packageConfig: PackageProjectConfiguration,
): Promise<void> => {
  debug(`Building package ${packageConfig.packageName} in ${params.projectDirectory}`);
  const template: TemplateReference = {
    name: packageConfig.templateReference.templateName,
    version: packageConfig.templateReference.templateVersion,
  };

  const templateReference = await assertTemplateReferenceVersion(params.s3, template);

  assert(templateReference.version);

  const packageFolder = path.join(
    params.projectDirectory,
    'packages',
    `${packageConfig.packageName}/`,
  );

  mkdir('-p', packageFolder);
  const zipPath = await params.s3.downloadTemplateArchive(
    templateReference.name,
    templateReference.version,
    packageFolder,
  );

  assert(zipPath);
  await extract(zipPath, { dir: path.resolve(packageFolder) });

  rm('-f', zipPath);
  debug('Template archive extracted to ' + path.resolve(packageFolder), {
    packageFolder: path.resolve(packageFolder),
  });
  setPackageName(packageFolder, packageConfig.packageName);
};
