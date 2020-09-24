import fs from 'fs';
import { readTemplateConfigFromFile } from '@goldstack/utils-template';
import { sh } from '@goldstack/utils-sh';
import { fatal } from '@goldstack/utils-log';

interface CreatePackageParams {
  newPackageName: string;
  templateName: string;
  templateVersion: string;
  installFolder?: string;
}

const copyFromLocal = async (
  params: CreatePackageParams,
  path: string
): Promise<void> => {
  const templateConfig = readTemplateConfigFromFile(path + '/template.json');

  const installFolder = params.installFolder;

  const res = sh.cp(
    '-r',
    path + '/template',
    './' + installFolder + '/' + params.newPackageName
  );
  if (!res) {
    fatal('Cannot copy template to folder');
    throw new Error('Cannot copy template');
  }
};

export const createPackage = async (
  params: CreatePackageParams
): Promise<void> => {
  const localPath = `./templates/${params.templateName}/${params.templateVersion}`;
  if (fs.existsSync(localPath)) {
    await copyFromLocal(params, localPath);
  } else {
    throw new Error('Only local install supported.');
  }
};
