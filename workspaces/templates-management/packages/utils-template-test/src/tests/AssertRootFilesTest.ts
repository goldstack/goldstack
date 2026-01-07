import { getAwsConfigPath } from '@goldstack/utils-config';
import type { RunTestParams, TemplateTest } from '../types/TemplateTest';
import { assertFilesExist } from '../utilsTemplateTest';

export class AssertRootFilesTest implements TemplateTest {
  getName(): string {
    return 'assert-root-files';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const projectDir = params.projectDir;
    const awsConfigPath = getAwsConfigPath(params.projectDir);
    assertFilesExist([
      `${projectDir}biome.jsonc`,
      `${projectDir}config/infra/aws/.gitignore`,
      `${projectDir}config/goldstack/.gitignore`,
      awsConfigPath,
    ]);
  }
}
