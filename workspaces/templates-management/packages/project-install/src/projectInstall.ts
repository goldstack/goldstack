import { yarn } from '@goldstack/utils-yarn';

export interface InstallProjectParams {
  projectDirectory: string;
}

export const installProject = async (
  params: InstallProjectParams
): Promise<void> => {
  yarn(params.projectDirectory, 'install --update-checksums');
};
