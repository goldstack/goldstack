import { configureForTemplateBuild, yarn } from '@goldstack/utils-yarn';
import { waitForPublishedPackages } from './waitForPublishedPackages';

export interface InstallProjectParams {
  projectDirectory: string;
  globalDirectory?: string;
}

export const installProject = async (params: InstallProjectParams): Promise<void> => {
  await waitForPublishedPackages({ projectDirectory: params.projectDirectory });
  if (params.globalDirectory) {
    configureForTemplateBuild(params.projectDirectory, params.globalDirectory);
  }
  yarn(params.projectDirectory, 'install');
};

export { waitForPublishedPackages } from './waitForPublishedPackages';
