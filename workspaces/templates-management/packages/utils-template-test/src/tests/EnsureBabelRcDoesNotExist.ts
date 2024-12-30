import { existsSync } from 'fs';
import { join } from 'path';
import { RunTestParams, TemplateTest } from '../types/TemplateTest';

export class EnsureBabelRcDoesNotExist implements TemplateTest {
  getName(): string {
    return 'ensure-babelrc-does-not-exist';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageDir = params.packageDir;

    const babelRcThere = existsSync(join('.babelrc'));
    if (babelRcThere) {
      throw new Error(
        '.babelrc should not exist but found in directory: ' + packageDir
      );
    }
  }
}
