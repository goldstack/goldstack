import { S3TemplateRepository } from '@goldstack/template-repository';
import AWSMock from 'mock-aws-s3';
import { rmSafe, mkdir } from '@goldstack/utils-sh';
import { promisify } from 'util';
import { build } from '@goldstack/template-build';
import { AssertionError } from 'assert';
import fs from 'fs';
import { TemplateTest } from './types/TemplateTest';
import { AssertPackageFilesTest } from './tests/AssertPackageFilesTest';
import { RootBuildTemplateTest } from './tests/RootBuildTemplateTest';
import { RootFilesTemplateTest } from './tests/RootFilesTemplateTest';
import { InfraUpTest } from './tests/InfraUpTest';
import { InfraPlanTest } from './tests/InfraPlanTest';
import { InfraDestroyTest } from './tests/InfraDestroyTest';
import { DeployTest } from './tests/DeployTest';
import { StaticWebsiteAwsTest } from './tests/StaticWebsiteAwsTest';
import { RestApiTest } from './tests/RestApiTest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError({ message: msg });
  }
}

const sleep = promisify(setTimeout);

export const prepareTestDir = async (
  goldstackTestsDir = './goldstackLocal/test/'
): Promise<S3TemplateRepository> => {
  await rmSafe(goldstackTestsDir);

  // Addressing issue in windows that there is a file error when creating right after deleting
  await sleep(100);

  mkdir('-p', goldstackTestsDir);
  mkdir('-p', goldstackTestsDir + 's3/repo');
  mkdir('-p', goldstackTestsDir + 'templates/');

  AWSMock.config.basePath = goldstackTestsDir + 's3/repo';

  const s3: AWSMock.S3 = new AWSMock.S3({
    params: {},
  });
  const repo = new S3TemplateRepository({
    s3: s3 as any,
    bucket: 'repo',
    bucketUrl: 'https://local.goldstack.party/repo/',
  });
  return repo;
};

export const getTemplateTests = (): TemplateTest[] => {
  return [
    new AssertPackageFilesTest(),
    new RootBuildTemplateTest(),
    new RootFilesTemplateTest(),
    new InfraUpTest(),
    new InfraPlanTest(),
    new InfraDestroyTest(),
    new DeployTest(),
    new StaticWebsiteAwsTest(),
    new RestApiTest(),
  ];
};

export const getTemplateTest = (templateTestName: string): TemplateTest => {
  const tests = getTemplateTests();

  const test = tests.find(
    (templateTest) => templateTest.getName() === templateTestName
  );

  if (!test) {
    throw new Error(`Cannot find test definition for ${templateTestName}`);
  }

  return test;
};

export const buildTemplate = async (params: {
  repo?: S3TemplateRepository;
  goldstackTestsDir: string;
  templateName: string;
}): Promise<void> => {
  if (!params.repo) throw new Error('Invalid test state.');

  const newVersion = await build(params.templateName, {
    monorepoRoot: './../../../../',
    destinationDirectory: params.goldstackTestsDir + 'templates/',
    templateRepository: params.repo,
  });

  const config = await params.repo.getLatestTemplateVersion(
    params.templateName
  );

  if (!config) {
    throw new Error('Cannot read template configuration.');
  }

  assert(config.templateName === params.templateName);
  assert(config.templateDocumentation.length > 10);

  mkdir('-p', './goldstackLocal/work/templates');

  const path = await params.repo.downloadTemplateArchive(
    config.templateName,
    newVersion.templateVersion,
    './goldstackLocal/work/templates/'
  );

  if (!path) {
    throw new Error('Archive could not be downloaded');
  }

  assert(fs.existsSync(path));
  const archiveSize = fs.statSync(path).size > 1000;
  assert(
    archiveSize,
    `Resulting archive for template build too small. Archive ${path} has size ${archiveSize}`
  );

  await rmSafe('./goldstackLocal/work/templates');
};

export const assertFilesExist = (files: string[]): void => {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      throw new AssertionError({
        message: `Expected file ${file} does not exist.`,
      });
    }
  }
};

export const assertFilesDoNotExist = (files: string[]): void => {
  for (const file of files) {
    if (fs.existsSync(file)) {
      throw new AssertionError({
        message: `Expected file ${file} to not exist.`,
      });
    }
  }
};
