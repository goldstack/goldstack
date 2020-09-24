export interface RunTestParams {
  projectDir: string;
  packageDir: string;
}

export interface TemplateTest {
  getName: () => string;
  runTest: (params: RunTestParams) => Promise<void>;
}
