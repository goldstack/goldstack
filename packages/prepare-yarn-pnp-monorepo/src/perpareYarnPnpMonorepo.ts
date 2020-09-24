import {
  PrepareTemplate,
  PrepareTemplateParams,
} from '@goldstack/prepare-template';

import { cp, mkdir, write, read, pwd } from '@goldstack/utils-sh';

import { Package } from '@goldstack/utils-package';
import { getAwsConfigPath } from '@goldstack/utils-config';
import { readTemplateConfigFromFile } from '@goldstack/utils-template';
import { readConfig, createDefaultConfig } from '@goldstack/infra-aws';
import { assert } from 'console';
import fs from 'fs';
import packageSchema from './../schemas/package.schema.json';

export class PrepareYarnPnpMonorepo implements PrepareTemplate {
  templateName(): string {
    return 'yarn-pnp-monorepo';
  }
  run(params: PrepareTemplateParams): Promise<void> {
    const copyFilesFromRoot = [
      '.eslintignore',
      '.eslintrc.json',
      '.gitconfig',
      '.prettierignore',
      '.prettierrc.json',
      '.yarnrc.yml',
      '.nvmrc',
      '.vscode/',
    ].map((name) => params.monorepoRoot + name);
    mkdir('-p', params.destinationDirectory);
    cp('-rf', copyFilesFromRoot, params.destinationDirectory);

    const copyFilesFromRootYarn = [
      '.yarn/plugins',
      '.yarn/pnpify',
      '.yarn/releases',
      '.yarn/sdks',
    ].map((name) => params.monorepoRoot + name);
    mkdir('-p', params.destinationDirectory + '.yarn/');
    cp('-rf', copyFilesFromRootYarn, params.destinationDirectory + '.yarn/');

    const copyFilesFromTemplate = [
      '.gitignore',
      '.nodemonx.json',
      'jest.config.js',
      'jest.config.ui.js',
      'package.json',
      'tsconfig.base.json',
      'tsconfig.ui.json',
      'config',
    ].map((name) => params.monorepoRoot + 'workspaces/templates/' + name);
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
    const goldstackConfigPath =
      params.destinationDirectory + 'config/goldstack/config.json';
    if (fs.existsSync(goldstackConfigPath)) {
      const goldstackConfig = JSON.parse(read(goldstackConfigPath));
      goldstackConfig.owner = undefined;
      write(JSON.stringify(goldstackConfig, null, 2), goldstackConfigPath);
    } else {
      write(JSON.stringify({}, null, 2), goldstackConfigPath);
    }

    // ensure no npmAuthToken in package
    const yarnRc = read(params.destinationDirectory + '.yarnrc.yml');
    const regex = /npmAuthToken: [^\s]*\s/gi;
    write(
      yarnRc.replace(regex, ''),
      params.destinationDirectory + '.yarnrc.yml'
    );

    // reset package.json
    const packageJson = JSON.parse(
      read(params.destinationDirectory + 'package.json')
    );
    packageJson.name = '';
    packageJson.author = '';
    packageJson.license = '';
    write(
      JSON.stringify(packageJson, null, 2),
      params.destinationDirectory + 'package.json'
    );

    mkdir('-p', params.destinationDirectory + 'packages/');
    cp(
      '-rf',
      params.monorepoRoot + 'workspaces/templates/packages/README.md',
      params.destinationDirectory + 'packages/'
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
      JSON.stringify(packageConfig, null, 2),
      params.destinationDirectory + 'goldstack.json'
    );

    mkdir('-p', params.destinationDirectory + 'schemas/');
    write(
      JSON.stringify(packageSchema, null, 2),
      params.destinationDirectory + 'schemas/package.schema.json'
    );

    const config = readTemplateConfigFromFile(
      params.monorepoRoot + 'workspaces/templates/' + 'template.json'
    );
    assert(config.templateName === this.templateName());
    const templateJsonPath = params.destinationDirectory + 'template.json';
    const templateJsonContent = JSON.stringify(config, null, 2);
    write(templateJsonContent, templateJsonPath);

    return Promise.resolve();
  }
}
