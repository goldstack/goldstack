import type { RunTestParams, TemplateTest } from '../types/TemplateTest';
export declare const assertEndpointAvaialble: (url: string) => Promise<void>;
export declare class AssertRestApiTest implements TemplateTest {
  getName(): string;
  runTest(params: RunTestParams): Promise<void>;
}
//# sourceMappingURL=AssertRestApiTest.d.ts.map
