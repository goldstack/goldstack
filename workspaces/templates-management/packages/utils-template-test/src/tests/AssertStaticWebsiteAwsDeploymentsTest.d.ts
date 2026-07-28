import type { RunTestParams, TemplateTest } from '../types/TemplateTest';
export declare const assertWebsiteAvailable: (url: string) => Promise<void>;
export declare const assertWebsiteRedirect: (
  url: string,
  expectedForwardUrl: string,
) => Promise<void>;
export declare class AssertStaticWebsiteAwsDeploymentsTest implements TemplateTest {
  getName(): string;
  runTest(params: RunTestParams): Promise<void>;
}
//# sourceMappingURL=AssertStaticWebsiteAwsDeploymentsTest.d.ts.map
