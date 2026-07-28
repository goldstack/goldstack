import { S3TemplateRepository } from '@goldstack/template-repository';
import type { TemplateTest } from './types/TemplateTest';
export declare const prepareLocalS3Repo: (
  goldstackTestsDir: string,
) => Promise<S3TemplateRepository>;
export declare const getTemplateTests: () => TemplateTest[];
export declare const getTemplateTest: (templateTestName: string) => TemplateTest;
export declare const buildTemplate: (params: {
  repo?: S3TemplateRepository;
  goldstackTestsDir: string;
  templateName: string;
}) => Promise<void>;
export declare const assertFilesExist: (files: string[]) => void;
export declare const assertFilesDoNotExist: (files: string[]) => void;
//# sourceMappingURL=utilsTemplateTest.d.ts.map
