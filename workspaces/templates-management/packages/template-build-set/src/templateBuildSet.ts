import { DeploySetConfig, DeploySetProjectConfig } from './types/DeploySet';

import { cd, execAsync, mkdir, read } from '@goldstack/utils-sh';
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
  prepareLocalS3Repo,
  getTemplateTest,
} from '@goldstack/utils-template-test';
import assert from 'assert';
import path, { join, resolve } from 'path';
export * from './types/DeploySet';

import { resetMocks } from 'mock-aws-s3-v3';

import { info, warn, error } from '@goldstack/utils-log';
import { readdirSync } from 'fs';

export interface BuildSetParams {
  config: DeploySetConfig;
  workDir: string;
  s3repo: S3TemplateRepository;
  skipTests?: boolean;
  deployBeforeTest?: boolean;
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
  info('Building and testing project', {
    destinationDirectory: params.projectDir,
  });

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
    info('Writing AWS config to ' + path.resolve(awsConfigPath));
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
    info('Executing test ' + test.getName());
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
          warn(`Skipping test ${packageTest} since previous test failed`);
          continue;
        }

        info(`Running test ${packageTest} ...`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let errorFound: any = undefined;
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
          errorFound = e.message || '';
          console.error(e);
          error(`❌ Test failed ${packageTest}`);
        }
        if (!isFail) {
          info(`✔️ Test success ${packageTest}`);
        }
        testResults.push({
          testName: `${params.project.projectConfiguration.projectName} ${packageConfig.packageName} ${packageTest}`,
          result: !isFail,
          error: errorFound,
        });
      }
    } finally {
      // always run cleanup tests, such as for destroying infrastructure
      for (const packageCleanUp of packageConfig.packageCleanUp) {
        info(`Running cleanup job ${packageCleanUp}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let errorFound: any = undefined;
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
          console.error(e);
          error(`❌ Cleanup job failed ${packageCleanUp}`);
          isFail = true;
          errorFound = e.message || '';
        }
        testResults.push({
          testName: `${params.project.projectConfiguration.projectName} ${packageConfig.packageName} ${packageCleanUp}`,
          result: !isFail,
          error: errorFound,
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
  const localRepo = await prepareLocalS3Repo(join(params.workDir, 's3/'));

  // build templates for local repo
  const templateWorkDir = resolve(join(params.workDir, 'templates/'));

  // script runs in dir workspaces/apps/packages/template-management-cli
  // thus monorepo root is four folders up
  const monorepoRoot = path.resolve('./../../../../') + '/';
  info('Building templates. Working directory ', {
    templateWorkDir,
    monorepoRoot,
  });
  mkdir('-p', templateWorkDir);
  await buildTemplates({
    workDir: templateWorkDir,
    templates: params.config.buildTemplates,
    templateRepository: localRepo,
    monorepoRoot,
  });

  if (params.deployBeforeTest && false) {
    // TODO this will not work due to mocks!
    info('Deploying templates before tests', {
      workDir: params.workDir + 'templatesDeploy/',
    });
    throw new Error(
      'Deploying before test not available, since S3 local mocks would be overwritten'
    );
    await buildTemplates({
      workDir: params.workDir + 'templatesDeploy/',
      templates: params.config.deployTemplates,
      monorepoRoot,
      templateRepository: params.s3repo,
    });

    res.deployed = true;
  }

  if (!params.skipTests) {
    const testResults: TestResult[] = await buildProjects({
      buildSetParams: params,
      localRepo,
      res,
      monorepoRoot,
    });
    info('Test results', { results: res.testResultsText });
    if (testResults.filter((result) => !result.result).length > 0) {
      warn('There are test failures. No templates will be deployed.');
      res.testFailed = true;
      return res;
    }
    res.testFailed = false;
  } else {
    warn('Skipping tests for ' + params.config.buildSetName);
  }

  // IMPORTANT since otherwise nothing will be deployed
  resetMocks();

  // if everything is good, deploy templates

  // TODO see above logic will not work due to lacking mock reset
  if (!params.deployBeforeTest || true) {
    info('Deploying templates', {
      workDir: join(params.workDir, 'templatesDeploy/'),
    });
    await buildTemplates({
      workDir: join(params.workDir, 'templatesDeploy/'),
      templates: params.config.deployTemplates,
      monorepoRoot,
      templateRepository: params.s3repo,
    });

    res.deployed = true;
  }
  return res;
};

export async function buildProjects(params: {
  buildSetParams: BuildSetParams;
  localRepo: S3TemplateRepository;
  res: BuildSetResult;
  monorepoRoot: string;
}): Promise<TestResult[]> {
  const testResults: TestResult[] = [];
  for (const project of params.buildSetParams.config.projects) {
    const projectDir = join(
      params.buildSetParams.workDir,
      project.projectConfiguration.projectName + '/'
    );
    info('Building project in directory', { projectDir });
    mkdir('-p', projectDir);
    const projectDirFiles = readdirSync(projectDir);
    assert(
      projectDirFiles.length === 0,
      `Working directory ${projectDir} is not empty. Files found ${projectDirFiles}`
    );

    const gitHubToken = process.env.GITHUB_TOKEN;
    if (project.targetRepo && gitHubToken) {
      await execAsync(
        `git clone https://${gitHubToken}@github.com/${project.targetRepo}.git ${projectDir}`
      );
    }

    testResults.push(
      ...(await buildAndTestProject({
        project,
        projectDir,
        setParams: params.buildSetParams,
        templateRepository: params.localRepo,
        user: params.buildSetParams.user,
      }))
    );

    if (project.targetRepo && gitHubToken) {
      const currentDir = process.cwd();
      cd(`${projectDir}`);
      if (project.repoReadme) {
        write(read(join(params.monorepoRoot, project.repoReadme)), 'README.md');
      }
      await execAsync(
        'git config --global user.email "1448524+mxro@users.noreply.github.com"'
      );
      await execAsync(
        'git config --global user.name "Goldstack Project Builder"'
      );
      await execAsync('git add .');
      await execAsync(
        'git diff-index --quiet HEAD || git commit -m "Automated update of generated boilerplate by goldstack.party"'
      );
      await execAsync('git push origin master --force');
      cd(`${currentDir}`);
    }
  }
  params.res.testResults = testResults;
  params.res.testResultsText = renderTestResults(testResults);
  return testResults;
}
