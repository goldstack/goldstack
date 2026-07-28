import type { RunTestParams, TemplateTest } from '../types/TemplateTest';
export declare const assertWebsiteAvailable: (url: string) => Promise<void>;
export declare class AssertWebsiteTest implements TemplateTest {
  getName(): string;
  runTest(params: RunTestParams): Promise<void>;
}
//# sourceMappingURL=AssertWebsiteTest.d.ts.map
