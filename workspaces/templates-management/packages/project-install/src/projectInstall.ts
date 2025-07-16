import { configureForTemplateBuild, yarn } from '@goldstack/utils-yarn';

export interface InstallProjectParams {
  projectDirectory: string;
  globalDirectory?: string;
}

export const installProject = async (params: InstallProjectParams): Promise<void> => {
  if (params.globalDirectory) {
    configureForTemplateBuild(params.projectDirectory, params.globalDirectory);
  }
  yarn(params.projectDirectory, 'install');
};
