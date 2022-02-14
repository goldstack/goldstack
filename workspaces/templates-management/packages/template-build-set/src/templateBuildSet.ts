import { DeploySetConfig, DeploySetProjectConfig } from './types/DeploySet';

import { execAsync, mkdir, rmSafe } from '@goldstack/utils-sh';
import {
  writePackageConfigs,
  getPackageConfigs,
} from '@goldstack/project-config';
import { build } from '@goldstack/template-build';
import { GoldstackTemplateConfiguration } from '@goldstack/utils-template';
import { buildProject } from '@goldstack/project-build';
import { AWSAPIKeyUser } from '@goldstack/infra-aws';
import { installProject } from '@goldstack/project-install';
import { write } from '@goldstack/utils-sh';
import { S3TemplateRepository } from '@goldstack/template-repository';
import { getAwsConfigPath } from '@goldstack/utils-config';
import {
  prepareTestDir,
  getTemplateTest,
} from '@goldstack/utils-template-test';
import assert from 'assert';
import path from 'path';
import { config } from 'process';
export * from './types/DeploySet';

export interface BuildSetParams {
  config: DeploySetConfig;
  workDir: string;
  s3repo: S3TemplateRepository;
  skipTests?: boolean;
  user?: AWSAPIKeyUser;
}

interface BuildTemplatesParams {
  workDir: string;
  monorepoRoot: string;
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
      monorepoRoot: params.monorepoRoot,
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
  user?: AWSAPIKeyUser;
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
    globalDirectory: '/tmp/yarnCache',
  });

  // setting local AWS config file
  if (params.user) {
    const awsConfigPath = getAwsConfigPath(params.projectDir);
    console.info('Writing AWS config to', path.resolve(awsConfigPath));
    mkdir('-p', path.dirname(awsConfigPath));
    write(
      JSON.stringify({
        users: [
          {
            name: 'goldstack-dev',
            type: 'apiKey',
            config: params.user,
          },
        ],
      }),
      awsConfigPath
    );
  }
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
        if (testResults.find((tr) => tr.result === false)) {
          console.log(
            `Skipping test ${packageTest} since previous test failed`
          );
          continue;
        }

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

export interface BuildSetResult {
  deployed?: boolean;
  testFailed?: boolean;
  testResultsText?: string;
  testResults?: TestResult[];
}

export const buildSet = async (
  params: BuildSetParams
): Promise<BuildSetResult> => {
  const res: BuildSetResult = {
    deployed: false,
  };

  // set up local repo to run tests before deploying
  const localRepo = await prepareTestDir(params.workDir + 's3/');

  // build templates for local repo

  const templateWorkDir = params.workDir + 'templates/';

  // script runs in dir workspaces/apps/packages/template-management-cli
  // thus monorepo root is four folders up
  const monorepoRoot = path.resolve('./../../../../') + '/';
  console.log(
    'Building templates. Working directory ',
    templateWorkDir,
    ' Monorepo root ',
    monorepoRoot
  );
  mkdir('-p', templateWorkDir);
  await buildTemplates({
    workDir: templateWorkDir,
    templates: params.config.buildTemplates,
    templateRepository: localRepo,
    monorepoRoot,
  });

  if (!params.skipTests) {
    const testResults: TestResult[] = [];
    for (const project of params.config.projects) {
      const projectDir = `${params.workDir}${project.projectConfiguration.projectName}/`;
      console.log('Building project in directory ', projectDir);
      mkdir('-p', projectDir);

      const gitHubToken = process.env.GITHUB_TOKEN;
      if (project.targetRepo && gitHubToken) {
        // await execAsync(
        //   `git remote set-url origin https://${process.env.GITHUB_TOKEN}@github.com/${project.targetRepo}.git`
        // );
        await execAsync(
          `git clone https://${gitHubToken}@github.com/${project.targetRepo}.git ${projectDir}`
        );
      }

      testResults.push(
        ...(await buildAndTestProject({
          project,
          projectDir,
          setParams: params,
          templateRepository: localRepo,
          user: params.user,
        }))
      );

      if (project.targetRepo && gitHubToken) {
        const currentDir = process.cwd();
        await execAsync(`cd ${projectDir}`);
        await execAsync('git add .');
        await execAsync('git commit -m "Update boilerplate"');
        await execAsync('git push origin master --force');
        await execAsync(`cd ${currentDir}`);
      }
    }
    res.testResults = testResults;
    res.testResultsText = renderTestResults(testResults);
    console.log('Test results', res.testResultsText);
    if (testResults.filter((result) => !result.result).length > 0) {
      console.log('There are test failures. No templates will be deployed.');
      res.testFailed = true;
      return res;
    }
    res.testFailed = false;
  } else {
    console.log('Skipping tests');
  }

  // if everything is good, deploy templates
  console.log('Deploying templates');
  await buildTemplates({
    workDir: params.workDir + 'templatesDeploy/',
    templates: params.config.deployTemplates,
    monorepoRoot,
    templateRepository: params.s3repo,
  });

  res.deployed = true;
  return res;
};
