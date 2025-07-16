import type { PrepareTemplate, PrepareTemplateParams } from '@goldstack/prepare-template';

import { cp, mkdir, write, read } from '@goldstack/utils-sh';

import type { Package } from '@goldstack/utils-package';
import { getAwsConfigPath } from '@goldstack/utils-config';
import { readTemplateConfigFromFile } from '@goldstack/utils-template';
import { readConfig, createDefaultConfig } from '@goldstack/infra-aws';
import { assert } from 'console';
import fs from 'fs';
import packageSchema from './../schemas/package.schema.json';
import { join } from 'path';

import sortPackageJson from 'sort-package-json';

export const removeNpmRegistry = (params: { yarnRc: string }): string => {
  const authTokenRegex = /npmAuthToken: [^\s]*\s/gi;
  const withoutAuthToken = params.yarnRc.replace(authTokenRegex, '');
  const registryRegex = /\/\/registry.npmjs.org:[^\s]*\s/gi;
  const withoutRegistry = withoutAuthToken.replace(registryRegex, '');
  const registriesRegex = /npmRegistries:[^\s]*\s/gi;
  const withoutRegistries = withoutRegistry.replace(registriesRegex, '');
  return withoutRegistries;
};

function sortKeys(obj: any): any {
  return sortPackageJson(obj);
}

export class PrepareYarnPnpMonorepo implements PrepareTemplate {
  templateName(): string {
    return 'yarn-pnp-monorepo';
  }
  run(params: PrepareTemplateParams): Promise<void> {
    const copyFilesFromRoot = [
      '.eslintignore',
      '.eslintrc.json',
      '.gitattributes',
      '.gitconfig',
      '.prettierignore',
      '.prettierrc.json',
      '.yarnrc.yml',
      '.nvmrc',
      '.vscode/',
      'yarn.lock',
    ].map((name) => join(params.monorepoRoot, name));
    mkdir('-p', params.destinationDirectory);
    cp('-rf', copyFilesFromRoot, params.destinationDirectory);

    const copyFilesFromRootYarn = ['.yarn/pnpify', '.yarn/releases', '.yarn/sdks'].map((name) =>
      join(params.monorepoRoot, name),
    );
    mkdir('-p', params.destinationDirectory + '.yarn/');
    cp('-rf', copyFilesFromRootYarn, params.destinationDirectory + '.yarn/');

    const copyFilesFromTemplate = [
      '.gitignore',
      '.github',
      '.nodemonx.json',
      'jest.config.js',
      'README.md',
      'jest.config.ui.js',
      'package.json',
      'tsconfig.base.json',
      'tsconfig.ui.json',
      'tsconfig.json',
      'config',
    ].map((name) => join(params.monorepoRoot, 'workspaces/templates/', name));
    cp('-rf', copyFilesFromTemplate, params.destinationDirectory);

    // ensure no AWS user details included in package
    const awsConfigPath = getAwsConfigPath(params.destinationDirectory);
    if (fs.existsSync(awsConfigPath)) {
      const awsConfig = readConfig(awsConfigPath);
      awsConfig.users = [];
      write(JSON.stringify(awsConfig, null, 2), awsConfigPath);
    } else {
      write(JSON.stringify(createDefaultConfig(), null, 2), awsConfigPath);
    }

    // ensure no Goldstack user details included in package
    const goldstackConfigPath = join(params.destinationDirectory, 'config/goldstack/config.json');
    if (fs.existsSync(goldstackConfigPath)) {
      const goldstackConfig = JSON.parse(read(goldstackConfigPath));
      goldstackConfig.owner = undefined;
      write(JSON.stringify(goldstackConfig, null, 2), goldstackConfigPath);
    } else {
      write(JSON.stringify({}, null, 2), goldstackConfigPath);
    }

    // ensure no bucket details in Terraform config
    const terraformConfigPath = join(
      params.destinationDirectory,
      'config/infra/aws/terraform.json',
    );
    if (fs.existsSync(terraformConfigPath)) {
      const terraformConfig = JSON.parse(read(terraformConfigPath));
      terraformConfig.remoteState = [];
      write(JSON.stringify(terraformConfig, null, 2), terraformConfigPath);
    } else {
      write(JSON.stringify({ remoteState: [] }, null, 2), terraformConfigPath);
    }

    // ensure no npmAuthToken in package
    const yarnRc = read(join(params.destinationDirectory, '.yarnrc.yml'));

    write(removeNpmRegistry({ yarnRc }), join(params.destinationDirectory, '.yarnrc.yml'));

    // fix package.json
    const packageJson = JSON.parse(read(join(params.destinationDirectory, 'package.json')));

    packageJson.name = 'root';
    packageJson.author = '';
    packageJson.license = '';

    const rootPackageJson = JSON.parse(read(join(params.monorepoRoot, 'package.json')));
    packageJson.resolutions = rootPackageJson.resolutions;
    packageJson.packageManager = rootPackageJson.packageManager;

    write(
      JSON.stringify(sortKeys(packageJson), null, 2),
      join(params.destinationDirectory, 'package.json'),
    );

    mkdir('-p', join(params.destinationDirectory, 'packages/'));
    cp(
      '-rf',
      join(params.monorepoRoot, 'workspaces/templates/packages/README.md'),
      join(params.destinationDirectory, 'packages/'),
    );

    const packageConfig: Package = {
      $schema: './schemas/package.schema.json',
      templateVersion: '0.0.0',
      template: this.templateName(),
      name: '',
      configuration: {},
      deployments: [],
    };

    write(
      JSON.stringify(sortKeys(packageConfig), null, 2),
      join(params.destinationDirectory, 'goldstack.json'),
    );

    mkdir('-p', join(params.destinationDirectory, 'schemas/'));
    write(
      JSON.stringify(packageSchema, null, 2),
      join(params.destinationDirectory, 'schemas/package.schema.json'),
    );

    const config = readTemplateConfigFromFile(
      join(params.monorepoRoot, 'workspaces/templates/template.json'),
    );
    assert(config.templateName === this.templateName());
    const templateJsonPath = join(params.destinationDirectory, 'template.json');
    const templateJsonContent = JSON.stringify(config, null, 2);
    write(templateJsonContent, templateJsonPath);

    return Promise.resolve();
  }
}
