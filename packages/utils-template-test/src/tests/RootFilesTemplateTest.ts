import { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { assertFilesExist } from './../utilsTemplateTest';
import { getAwsConfigPath } from '@goldstack/utils-config';

export class RootFilesTemplateTest implements TemplateTest {
  getName(): string {
    return 'assert-root-files';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const projectDir = params.projectDir;
    const awsConfigPath = getAwsConfigPath(params.projectDir);
    assertFilesExist([
      projectDir + '.eslintrc.json',
      projectDir + 'config/infra/aws/.gitignore',
      projectDir + 'config/goldstack/.gitignore',
      awsConfigPath,
    ]);
  }
}
