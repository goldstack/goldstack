import type { TemplateTest, RunTestParams } from '../types/TemplateTest';
import { assertFilesExist, assertFilesDoNotExist } from '../utilsTemplateTest';

export class AssertPackageFilesTest implements TemplateTest {
  getName(): string {
    return 'assert-package-files';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageDir = params.packageDir;
    assertFilesExist([
      packageDir + 'package.json',
      packageDir + 'goldstack.json',
      packageDir + 'schemas/package.schema.json',
    ]);
    assertFilesDoNotExist([packageDir + 'template.json']);
  }
}
