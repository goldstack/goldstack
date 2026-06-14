import { debug } from '@goldstack/utils-log';
import type { PackageProjectConfiguration } from '@goldstack/utils-project';
import { mkdir, rm } from '@goldstack/utils-sh';
import path from 'path';
import {
  assert,
  assertTemplateReferenceVersion,
  extractWithTimeout,
  type ProjectBuildParams,
  setPackageName,
  type TemplateReference,
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
  const extractResult = await extractWithTimeout(zipPath, path.resolve(packageFolder));
  if (!extractResult.success) {
    throw extractResult.error || new Error('Extraction failed for unknown reason');
  }

  rm('-f', zipPath);
  debug(`Template archive extracted to ${path.resolve(packageFolder)}`, {
    packageFolder: path.resolve(packageFolder),
  });
  setPackageName(packageFolder, packageConfig.packageName);
};
