import {
  prepareTestDir,
  buildTemplate,
  assertFilesExist,
  assertFilesDoNotExist,
} from '@goldstack/utils-template-test';
import { S3TemplateRepository } from '@goldstack/template-repository';

import { buildProject } from './projectBuild';
import { rmSafe, mkdir, read } from '@goldstack/utils-sh';
import { ProjectConfiguration } from '@goldstack/utils-project';

import { getAwsConfigPath } from '@goldstack/utils-config';
import { readConfig } from '@goldstack/infra-aws';

import assert from 'assert';

jest.setTimeout(60000);

describe('Template Building', () => {
  const goldstackTestsDir = './goldstackLocal/tests/build/';
  let repo: S3TemplateRepository | undefined = undefined;

  beforeAll(async () => {
    repo = await prepareTestDir(goldstackTestsDir);
  });

  it('Should return undefined when template does not exist.', async () => {
    const config = await repo?.getLatestTemplateVersion('dummy');
    expect(config).toBeUndefined();
  });

  it('Should build root template', async () => {
    await buildTemplate({
      templateName: 'yarn-pnp-monorepo',
      repo,
      goldstackTestsDir,
    });
  });

  it('Should be able to build static website', async () => {
    await buildTemplate({
      templateName: 'static-website-aws',
      repo,
      goldstackTestsDir,
    });
  });

  it('Should be able to build docker-image-aws', async () => {
    await buildTemplate({
      templateName: 'docker-image-aws',
      repo,
      goldstackTestsDir,
    });
  });

  it('Should be able to build s3', async () => {
    await buildTemplate({
      templateName: 's3',
      repo,
      goldstackTestsDir,
    });
  });

  it('Should be able to build lambda go gin template', async () => {
    await buildTemplate({
      templateName: 'lambda-go-gin',
      repo,
      goldstackTestsDir,
    });
  });

  it('Should be able to build lambda email-send template', async () => {
    await buildTemplate({
      templateName: 'email-send',
      repo,
      goldstackTestsDir,
    });
  });

  it('Should be able to build a project for static-website-aws', async () => {
    const config: ProjectConfiguration = {
      projectName: 'project1',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      packages: [
        {
          packageName: 'static-website-1',
          templateReference: {
            templateName: 'static-website-aws',
          },
        },
      ],
    };

    assert(repo);
    const projectDir = goldstackTestsDir + `projects/${config.projectName}/`;
    await rmSafe(projectDir);
    mkdir('-p', projectDir);

    await buildProject({
      destinationDirectory: projectDir,
      config,
      s3: repo,
    });

    const awsConfigPath = getAwsConfigPath(projectDir);
    assertFilesExist([
      projectDir + '.eslintrc.json',
      projectDir + 'package.json',
      projectDir + '.yarnrc.yml',
      projectDir + 'goldstack.json',
      projectDir + 'config/infra/aws/.gitignore',
      awsConfigPath,
    ]);
    assertFilesDoNotExist([projectDir + 'template.json']);

    // ensure no user credentials included in package
    const awsConfig = readConfig(awsConfigPath);
    expect(awsConfig.users).toHaveLength(0);

    // ensure no npm token included in pakcage
    const yarnRc = read(projectDir + '.yarnrc.yml');
    expect(yarnRc.indexOf('npmAuthToken') === -1).toBeTruthy();

    for (const packageConfig of config.packages) {
      const packageDir =
        projectDir + 'packages/' + packageConfig.packageName + '/';
      assertFilesExist([
        packageDir + 'package.json',
        packageDir + 'goldstack.json',
      ]);
      assertFilesDoNotExist([packageDir + 'template.json']);
    }

    const staticWebsite1PackageDir =
      projectDir + 'packages/' + config.packages[0].packageName + '/';
    assertFilesExist([
      staticWebsite1PackageDir + 'infra/aws/.gitignore',
      staticWebsite1PackageDir + 'infra/aws/main.tf',
      staticWebsite1PackageDir + '.gitignore',
    ]);
    assertFilesDoNotExist([]);
  });

  it('Should be able to build a project for docker-image-aws and s3', async () => {
    const config: ProjectConfiguration = {
      projectName: 'project-docker-image-aws',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      packages: [
        {
          packageName: 'docker-image-aws-1',
          templateReference: {
            templateName: 'docker-image-aws',
          },
        },
        {
          packageName: 's3-1',
          templateReference: {
            templateName: 's3',
          },
        },
      ],
    };

    assert(repo);
    const projectDir = goldstackTestsDir + `projects/${config.projectName}/`;
    await rmSafe(projectDir);
    mkdir('-p', projectDir);

    await buildProject({
      destinationDirectory: projectDir,
      config,
      s3: repo,
    });

    // check docker image package
    const dockerImage1PackageDir =
      projectDir + 'packages/' + config.packages[0].packageName + '/';
    assertFilesExist([
      dockerImage1PackageDir + 'infra/aws/.gitignore',
      dockerImage1PackageDir + 'infra/aws/main.tf',
      dockerImage1PackageDir + '.gitignore',
    ]);

    // ensure config values are overwritten
    const dockerImage1GoldstackConfig = JSON.parse(
      read(dockerImage1PackageDir + 'goldstack.json')
    );
    expect(dockerImage1GoldstackConfig.configuration.imageTag).toEqual('');

    const dockerImage1DeploymentState = JSON.parse(
      read(dockerImage1PackageDir + 'src/state/deployments.json')
    );
    expect(dockerImage1DeploymentState).toEqual([]);

    // check s3 package
    const s31PackageDir =
      projectDir + 'packages/' + config.packages[1].packageName + '/';
    assertFilesExist([
      s31PackageDir + 'infra/aws/.gitignore',
      s31PackageDir + 'infra/aws/main.tf',
      s31PackageDir + '.gitignore',
    ]);

    // ensure config values are overwritten
    const s31GoldstackConfig = JSON.parse(
      read(s31PackageDir + 'goldstack.json')
    );
    const configEntries = Object.entries(s31GoldstackConfig.configuration);
    // console.log(JSON.stringify(configEntries));
    expect(configEntries.length).toEqual(0);

    const s31DeploymentState = JSON.parse(
      read(s31PackageDir + 'src/state/deployments.json')
    );
    expect(s31DeploymentState).toEqual([]);
  });

  it('Should be able to build a project for lambda-go-gin and email-send-template', async () => {
    const config: ProjectConfiguration = {
      projectName: 'project-go-gin-email-send',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      packages: [
        {
          packageName: 'lambda-go-gin-1',
          templateReference: {
            templateName: 'lambda-go-gin',
          },
        },
        {
          packageName: 'email-send-1',
          templateReference: {
            templateName: 'email-send',
          },
        },
      ],
    };

    assert(repo);
    const projectDir = goldstackTestsDir + `projects/${config.projectName}/`;
    await rmSafe(projectDir);
    mkdir('-p', projectDir);

    await buildProject({
      destinationDirectory: projectDir,
      config,
      s3: repo,
    });

    // check go gin
    const goGinPackageDir =
      projectDir + 'packages/' + config.packages[0].packageName + '/';
    assertFilesExist([
      goGinPackageDir + 'infra/aws/.gitignore',
      goGinPackageDir + 'infra/aws/main.tf',
      goGinPackageDir + '.gitignore',
      goGinPackageDir + 'main.go',
      goGinPackageDir + 'lambda.go',
      goGinPackageDir + 'local.go',
      goGinPackageDir + 'go.mod',
      goGinPackageDir + 'go.sum',
    ]);

    // ensure config values are overwritten
    const goGinGoldstackConfig = JSON.parse(
      read(goGinPackageDir + 'goldstack.json')
    );
    expect(Object.entries(goGinGoldstackConfig.configuration).length).toEqual(
      0
    );

    const goGinDeploymentState = JSON.parse(
      read(goGinPackageDir + 'src/state/deployments.json')
    );
    expect(goGinDeploymentState).toEqual([]);

    // check email-send package
    const emailSendPackageDir =
      projectDir + 'packages/' + config.packages[0].packageName + '/';
    assertFilesExist([
      emailSendPackageDir + 'infra/aws/.gitignore',
      emailSendPackageDir + 'infra/aws/main.tf',
      emailSendPackageDir + '.gitignore',
    ]);

    // ensure config values are overwritten
    const emailSendGoldstackConfig = JSON.parse(
      read(emailSendPackageDir + 'goldstack.json')
    );
    expect(
      Object.entries(emailSendGoldstackConfig.configuration).length
    ).toEqual(0);

    const emailSendDeploymentState = JSON.parse(
      read(emailSendPackageDir + 'src/state/deployments.json')
    );
    expect(emailSendDeploymentState).toEqual([]);
  });
});
