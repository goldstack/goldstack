import { exec } from '@goldstack/utils-sh';
import { yarn } from '@goldstack/utils-yarn';

export interface InstallProjectParams {
  projectDirectory: string;
}

export const installProject = async (
  params: InstallProjectParams
): Promise<void> => {
  exec('rm -rf ~/.yarn');
  yarn(params.projectDirectory, 'install');
};
