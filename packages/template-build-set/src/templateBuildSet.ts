import { DeploySetConfig, DeploySetProjectConfig } from './types/DeploySet';

import { mkdir } from '@goldstack/utils-sh';
import {
  writePackageConfigs,
  getPackageConfigs,
} from '@goldstack/project-config';
import { build } from '@goldstack/template-build';
import { GoldstackTemplateConfiguration } from '@goldstack/utils-template';
import { buildProject } from '@goldstack/project-build';
import { installProject } from '@goldstack/project-install';
import { S3TemplateRepository } from '@goldstack/template-repository';
import {
  prepareTestDir,
  getTemplateTest,
} from '@goldstack/utils-template-test';
import assert from 'assert';

export * from './types/DeploySet';

export interface BuildSetParams {
  config: DeploySetConfig;
  workDir: string;
  s3repo: S3TemplateRepository;
  skipTests?: boolean;
}

interface BuildTemplatesParams {
  workDir: string;
  templates: string[];
  templateRepository: S3TemplateRepository;
}

const buildTemplates = async (
  params: BuildTemplatesParams
): Promise<GoldstackTemplateConfiguration[]> => {
  const configurations: GoldstackTemplateConfiguration[] = [];

  for (const templateName of params.templates) {
    const templateConfig = await build(templateName, {
      templateRepository: params.templateRepository,
      destinationDirectory: params.workDir,
    });
    configurations.push(templateConfig);
  }

  return configurations;
};

interface BuildAndTestProjectParams {
  projectDir: string;
  setParams: BuildSetParams;
  project: DeploySetProjectConfig;
  templateRepository: S3TemplateRepository;
}

interface TestResult {
  testName: string;
  result: boolean;
  error?: string;
}

export const renderTestResults = (results: TestResult[]): string => {
  return results
    .map((result): string => {
      let renderedResult: string;
      if (result.result) {
        renderedResult = '✔️ Success';
      } else {
        renderedResult = `❌ Failed: ${result.error}`;
      }
      return result.testName.padEnd(20, ' ') + renderedResult + '\n';
    })
    .join('');
};

const buildAndTestProject = async (
  params: BuildAndTestProjectParams
): Promise<TestResult[]> => {
  await buildProject({
    destinationDirectory: params.projectDir,
    config: params.project.projectConfiguration,
    s3: params.templateRepository,
  });

  const packageConfigs = getPackageConfigs(params.projectDir);

  for (const setPackageConfig of params.project.packageConfigurations) {
    const packageConfig = packageConfigs.find(
      (packageConfig) =>
        packageConfig.package.name === setPackageConfig.packageName
    );

    assert(
      packageConfig,
      `Cannot find package configuration for ${setPackageConfig.packageName}`
    );

    packageConfig.package.deployments = setPackageConfig.deployments;
    packageConfig.package.configuration = setPackageConfig.configuration;
  }

  writePackageConfigs(params.projectDir, packageConfigs);

  await installProject({
    projectDirectory: params.projectDir,
  });

  // run project level tests first to have everything initialised
  for (const projectTest of params.project.rootTests) {
    const test = getTemplateTest(projectTest);
    await test.runTest({
      packageDir: params.projectDir,
      projectDir: params.projectDir,
    });
  }

  // then run tests for all packages
  const testResults: TestResult[] = [];
  for (const packageConfig of params.project.packageConfigurations) {
    try {
      for (const packageTest of packageConfig.packageTests) {
        console.log(`Running test ${packageTest} ...`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let error: any = undefined;
        let isFail: boolean;
        try {
          const test = getTemplateTest(packageTest);
          await test.runTest({
            packageDir:
              params.projectDir + `packages/${packageConfig.packageName}/`,
            projectDir: params.projectDir,
          });
          isFail = false;
        } catch (e) {
          isFail = true;
          error = e.message || '';
          console.log(e);
          console.log(`❌ Test failed ${packageTest}`);
        }
        if (!isFail) {
          console.log(`✔️ Test success ${packageTest}`);
        }
        testResults.push({
          testName: `${params.project.projectConfiguration.projectName} ${packageConfig.packageName} ${packageTest}`,
          result: !isFail,
          error,
        });
      }
    } finally {
      // always run cleanup tests, such as for destroying infrastructure
      for (const packageCleanUp of packageConfig.packageCleanUp) {
        console.log(`Running cleanup job ${packageCleanUp}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let error: any = undefined;
        let isFail: boolean;
        try {
          const test = getTemplateTest(packageCleanUp);
          await test.runTest({
            packageDir:
              params.projectDir + `packages/${packageConfig.packageName}/`,
            projectDir: params.projectDir,
          });
          isFail = false;
        } catch (e) {
          console.log(`❌ Cleanup job failed ${packageCleanUp}`);
          isFail = true;
          error = e.message || '';
        }
        testResults.push({
          testName: `${params.project.projectConfiguration.projectName} ${packageConfig.packageName} ${packageCleanUp}`,
          result: !isFail,
          error,
        });
      }
    }
  }
  return testResults;
};

export const buildSet = async (params: BuildSetParams): Promise<void> => {
  // set up local repo to run tests before deploying
  const localRepo = await prepareTestDir(params.workDir + 's3/');

  // build templates for local repo

  const templateWorkDir = params.workDir + 'templates/';
  console.log('Building templates in working directory ', templateWorkDir);
  mkdir('-p', templateWorkDir);
  await buildTemplates({
    workDir: templateWorkDir,
    templates: params.config.buildTemplates,
    templateRepository: localRepo,
  });

  if (!params.skipTests) {
    const testResults: TestResult[] = [];
    for (const project of params.config.projects) {
      const projectDir = `${params.workDir}${project.projectConfiguration.projectName}/`;
      console.log('Building project in directory ', projectDir);
      mkdir('-p', projectDir);
      testResults.push(
        ...(await buildAndTestProject({
          project,
          projectDir,
          setParams: params,
          templateRepository: localRepo,
        }))
      );
    }
    console.log(renderTestResults(testResults));
    if (testResults.filter((result) => !result.result).length > 0) {
      console.log('There are test failures. No templates will be deployed.');
      return;
    }
  } else {
    console.log('Skipping tests');
  }

  // if everything is good, deploy templates
  console.log('Deploying templates');
  await buildTemplates({
    workDir: params.workDir + 'templatesDeploy/',
    templates: params.config.deployTemplates,
    templateRepository: params.s3repo,
  });
};
