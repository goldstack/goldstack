import { build } from '@goldstack/template-build';
import { S3TemplateRepository } from '@goldstack/template-repository';
import { mkdir, rmSafe } from '@goldstack/utils-sh';
import { AssertionError } from 'assert';
import fs from 'fs';
import { createS3Client } from 'mock-aws-s3-v3';
import { join, resolve } from 'path';
import { promisify } from 'util';
import { AssertApplicationTest } from './tests/AssertApplicationTest';
import { AssertPackageFilesTest } from './tests/AssertPackageFilesTest';
import { AssertRestApiTest } from './tests/AssertRestApiTest';
import { AssertRootFilesTest } from './tests/AssertRootFilesTest';
import { AssertStaticWebsiteAwsDeploymentsTest } from './tests/AssertStaticWebsiteAwsDeploymentsTest';
import { AssertWebsiteTest } from './tests/AssertWebsiteTest';
import { DeployTest } from './tests/DeployTest';
import { DestroyStateTest } from './tests/DestroyStateTest';
import { EnsureBabelRcDoesNotExist } from './tests/EnsureBabelRcDoesNotExist';
import { IgnoreMissingDeploymentsTest } from './tests/IgnoreMissingDeploymentsTest';
import { InfraDestroyTest } from './tests/InfraDestroyTest';
import { InfraPlanTest } from './tests/InfraPlanTest';
import { InfraUpTest } from './tests/InfraUpTest';
import { PackageBuildLambdaTest } from './tests/PackageBuildLambdaTest';
import { PackageBuildTest } from './tests/PackageBuildTest';
import { PackageTestTest } from './tests/PackageTestTest';
import { PrintDirectoryContentTest } from './tests/PrintDirectoryContentTest';
import { RootBuildTest } from './tests/RootBuildTest';
import type { TemplateTest } from './types/TemplateTest';

function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError({ message: msg });
  }
}

const sleep = promisify(setTimeout);

export const prepareLocalS3Repo = async (
  goldstackTestsDir: string,
): Promise<S3TemplateRepository> => {
  await rmSafe(goldstackTestsDir);

  // Addressing issue in windows that there is a file error when creating right after deleting
  await sleep(100);

  mkdir('-p', goldstackTestsDir);
  mkdir('-p', join(goldstackTestsDir, 's3/repo'));
  mkdir('-p', join(goldstackTestsDir, 'templates/'));

  const s3 = createS3Client({
    localDirectory: join(goldstackTestsDir, 's3/repo'),
    bucket: 'local-dummy-template-repo',
  });
  const repo = new S3TemplateRepository({
    s3: s3,
    bucket: 'local-dummy-template-repo',
    workDir: join(goldstackTestsDir, 'templateBuildRepo'),
    bucketUrl: 'https://local.goldstack.party/repo/',
  });
  return repo;
};

export const getTemplateTests = (): TemplateTest[] => {
  return [
    new AssertPackageFilesTest(),
    new RootBuildTest(),
    new PackageBuildTest(),
    new PackageTestTest(),
    new PackageBuildLambdaTest(),
    new PrintDirectoryContentTest(),
    new AssertRootFilesTest(),
    new InfraUpTest(),
    new InfraPlanTest(),
    new DestroyStateTest(),
    new InfraDestroyTest(),
    new DeployTest(),
    new AssertStaticWebsiteAwsDeploymentsTest(),
    new AssertRestApiTest(),
    new AssertApplicationTest(),
    new AssertWebsiteTest(),
    new EnsureBabelRcDoesNotExist(),
    new IgnoreMissingDeploymentsTest(),
  ];
};

export const getTemplateTest = (templateTestName: string): TemplateTest => {
  const tests = getTemplateTests();

  const test = tests.find((templateTest) => templateTest.getName() === templateTestName);

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
    monorepoRoot: resolve('./../../../../'),
    destinationDirectory: resolve(join(params.goldstackTestsDir, 'templates/')),
    templateRepository: params.repo,
  });

  const config = await params.repo.getLatestTemplateVersion(params.templateName);

  if (!config) {
    throw new Error('Cannot read template configuration for ' + params.templateName);
  }

  assert(config.templateName === params.templateName);
  assert(config.templateDocumentation.length > 10);

  mkdir('-p', './goldstackLocal/work/templates');

  const path = await params.repo.downloadTemplateArchive(
    config.templateName,
    newVersion.templateVersion,
    './goldstackLocal/work/templates/',
  );

  if (!path) {
    throw new Error('Archive could not be downloaded');
  }

  assert(fs.existsSync(path));
  const archiveSize = fs.statSync(path).size > 1000;
  assert(
    archiveSize,
    `Resulting archive for template build too small. Archive ${path} has size ${archiveSize}`,
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
