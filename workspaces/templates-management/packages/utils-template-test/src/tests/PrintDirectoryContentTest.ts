import { TemplateTest, RunTestParams } from '../types/TemplateTest';
import { cd, exec } from '@goldstack/utils-sh';
import { info } from '@goldstack/utils-log';

export class PrintDirectoryContentTest implements TemplateTest {
  getName(): string {
    return 'print-directory-content';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageDir = params.packageDir;

    const projectDir = params.projectDir;

    cd(projectDir);
    info('File in ' + projectDir);
    exec('ls -la', { silent: false });

    cd(packageDir);
    info('File in ' + packageDir);
    exec('ls -la', { silent: false });
  }
}
