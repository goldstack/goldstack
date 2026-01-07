import { cp } from '@goldstack/utils-sh';
import { readTemplateConfigFromFile } from '@goldstack/utils-template';
import fs from 'fs';

interface CreatePackageParams {
  newPackageName: string;
  templateName: string;
  templateVersion: string;
  installFolder?: string;
}

const copyFromLocal = async (params: CreatePackageParams, path: string): Promise<void> => {
  const _templateConfig = readTemplateConfigFromFile(`${path}/template.json`);

  const installFolder = params.installFolder;

  cp('-r', `${path}/template`, `./${installFolder}/${params.newPackageName}`);
};

export const createPackage = async (params: CreatePackageParams): Promise<void> => {
  const localPath = `./templates/${params.templateName}/${params.templateVersion}`;
  if (fs.existsSync(localPath)) {
    await copyFromLocal(params, localPath);
  } else {
    throw new Error('Only local install supported.');
  }
};
