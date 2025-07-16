import type { TemplateTest, RunTestParams } from '../types/TemplateTest';
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
    info('Files in project root at ' + projectDir);
    exec('ls -la', { silent: false });

    if (packageDir) {
      cd(packageDir);
      info('Files in package at ' + packageDir);
      exec('ls -la', { silent: false });
    } else {
      info('Cannot print package files since package directory not supplied');
    }
  }
}
