import { cd, mkdir, pwd, write } from '@goldstack/utils-sh';
import fs from 'fs';
import path from 'path';

import {
  convertFromPythonVariable,
  convertToPythonVariable,
  envVarToTerraformName,
  findMonorepoRoot,
  getVariablesFromHCL,
  loadEnvFiles,
  terraformNameToEnvVar,
} from './terraformBuild';

describe('Terraform Utils', () => {
  it('Should convert variable names to Python variable Names', () => {
    expect(convertToPythonVariable('myVarName')).toEqual('my_var_name');
    expect(convertToPythonVariable('awsRegion')).toEqual('aws_region');
    expect(convertToPythonVariable('hostedZoneDomain')).toEqual('hosted_zone_domain');
    expect(convertToPythonVariable('websiteDomain')).toEqual('website_domain');
    expect(convertToPythonVariable('websiteDomainRedirect')).toEqual('website_domain_redirect');
    expect(convertToPythonVariable('defaultCacheDuration')).toEqual('default_cache_duration');
  });

  it('Should convert variables name from Pything variable names', () => {
    expect(convertFromPythonVariable('my_var_name')).toEqual('myVarName');
    expect(convertFromPythonVariable('aws_region')).toEqual('awsRegion');
  });

  it('Should convert between env var and terraform names', () => {
    expect(envVarToTerraformName('AWS_REGION')).toEqual('aws_region');
    expect(envVarToTerraformName('MY_VARIABLE')).toEqual('my_variable');
    expect(terraformNameToEnvVar('aws_region')).toEqual('AWS_REGION');
    expect(terraformNameToEnvVar('my_variable')).toEqual('MY_VARIABLE');
  });

  it('Should read variables from variables.tf', () => {
    const testDir = './goldstackLocal/test-variables/';
    mkdir('-p', testDir);
    const oldDir = pwd();
    cd(testDir);
    write(
      `
variable "aws_region" {
  description = "Region where the S3 bucket is deployed."
  type = string
}

variable "bucket_name" {
  description = "Name of the S3 bucket."
  type = string
}`,
      './variables.tf',
    );
    const vars = getVariablesFromHCL({
      awsRegion: 'us-east-1',
      bucketName: 'test-bucket',
    });
    expect(vars).toHaveLength(2);
    expect(vars[0][0]).toEqual('aws_region');
    expect(vars[0][1]).toEqual('us-east-1');
    cd(oldDir);
  });

  it('Should read variables from environment variables with $', () => {
    const testDir = './goldstackLocal/test-env-vars/';
    mkdir('-p', testDir);
    const oldDir = pwd();
    cd(testDir);
    write(
      `
variable "my_var" {
  type = string
}`,
      './variables.tf',
    );
    process.env.MY_VAR = 'value$with$dollar';
    const vars = getVariablesFromHCL({
      myVar: '',
    });
    expect(vars).toHaveLength(1);
    expect(vars[0][0]).toEqual('my_var');
    expect(vars[0][1]).toEqual('value$with$dollar');
    delete process.env.MY_VAR;
    cd(oldDir);
  });

  it('Should handle variables with $ in properties', () => {
    const testDir = './goldstackLocal/test-props-vars/';
    mkdir('-p', testDir);
    const oldDir = pwd();
    cd(testDir);
    write(
      `
variable "my_var" {
  type = string
}`,
      './variables.tf',
    );
    const vars = getVariablesFromHCL({
      myVar: 'value$with$dollar',
    });
    expect(vars).toHaveLength(1);
    expect(vars[0][0]).toEqual('my_var');
    expect(vars[0][1]).toEqual('value$with$dollar');
    cd(oldDir);
  });
});

describe('findMonorepoRoot', () => {
  it('Should find root with workspaces in package.json', () => {
    const testDir = './goldstackLocal/test-monorepo-root/';
    const nestedDir = `${testDir}nested/deep/`;
    mkdir('-p', nestedDir);

    write(
      JSON.stringify({
        name: 'root',
        workspaces: ['packages/*'],
      }),
      `${testDir}package.json`,
    );

    const absoluteTestDir = path.resolve(testDir);
    const result = findMonorepoRoot(nestedDir);
    expect(result).toEqual(absoluteTestDir);
  });

  it('Should find root with packageManager in package.json', () => {
    const testDir = './goldstackLocal/test-monorepo-root2/';
    const nestedDir = `${testDir}nested/`;
    mkdir('-p', nestedDir);

    write(
      JSON.stringify({
        name: 'root',
        packageManager: 'yarn@4.0.0',
      }),
      `${testDir}package.json`,
    );

    const absoluteTestDir = path.resolve(testDir);
    const result = findMonorepoRoot(nestedDir);
    expect(result).toEqual(absoluteTestDir);
  });

  it('Should return undefined when no root found', () => {
    const result = findMonorepoRoot('/tmp/nonexistent/path');
    expect(result).toBeUndefined();
  });
});

describe('loadEnvFiles', () => {
  it('Should load .env files in correct priority order', () => {
    const testDir = './goldstackLocal/test-env-files/';
    mkdir('-p', testDir);

    write('AWS_REGION=us-west-1\n', `${testDir}.env`);
    write('AWS_REGION=us-west-2\nBUCKET_NAME=root-deploy-bucket\n', `${testDir}.env.prod`);

    const result = loadEnvFiles({
      deploymentName: 'prod',
      packagePath: testDir,
    });

    expect(result['AWS_REGION']).toEqual('us-west-2');
    expect(result['BUCKET_NAME']).toEqual('root-deploy-bucket');
  });

  it('Should return empty object when no root found', () => {
    const result = loadEnvFiles({
      deploymentName: 'prod',
      packagePath: '/nonexistent/path',
    });

    expect(result).toEqual({});
  });
});

describe('getVariablesFromHCL with .env files', () => {
  it('Should use .env file when property is empty and no env var', () => {
    const testDir = './goldstackLocal/test-env-from-file/';
    mkdir('-p', testDir);
    const oldDir = pwd();
    cd(testDir);

    write(
      `
variable "aws_region" {
  type = string
}`,
      './variables.tf',
    );

    write(
      JSON.stringify({
        name: 'test-root',
        workspaces: ['packages/*'],
      }),
      '../package.json',
    );

    write('AWS_REGION=eu-west-1\n', '../.env');

    const vars = getVariablesFromHCL(
      {
        awsRegion: '',
      },
      'test',
      testDir,
    );

    expect(vars).toHaveLength(1);
    expect(vars[0][0]).toEqual('aws_region');
    expect(vars[0][1]).toEqual('eu-west-1');

    cd(oldDir);
  });

  it('Should prefer environment variable over .env file', () => {
    const testDir = './goldstackLocal/test-env-precedence/';
    mkdir('-p', testDir);
    const oldDir = pwd();
    cd(testDir);

    write(
      `
variable "aws_region" {
  type = string
}`,
      './variables.tf',
    );

    write(
      JSON.stringify({
        name: 'test-root',
        workspaces: ['packages/*'],
      }),
      '../package.json',
    );

    write('AWS_REGION=from-env-file\n', '../.env');

    process.env.AWS_REGION = 'from-process-env';

    const vars = getVariablesFromHCL(
      {
        awsRegion: '',
      },
      'test',
      testDir,
    );

    expect(vars).toHaveLength(1);
    expect(vars[0][0]).toEqual('aws_region');
    expect(vars[0][1]).toEqual('from-process-env');

    delete process.env.AWS_REGION;
    cd(oldDir);
  });

  it('Should prefer goldstack.json value over env var and .env file', () => {
    const testDir = './goldstackLocal/test-goldstack-precedence/';
    mkdir('-p', testDir);
    const oldDir = pwd();
    cd(testDir);

    write(
      `
variable "aws_region" {
  type = string
}`,
      './variables.tf',
    );

    write(
      JSON.stringify({
        name: 'test-root',
        workspaces: ['packages/*'],
      }),
      '../package.json',
    );

    write('AWS_REGION=from-env-file\n', '../.env');
    process.env.AWS_REGION = 'from-process-env';

    const vars = getVariablesFromHCL(
      {
        awsRegion: 'from-goldstack',
      },
      'test',
      testDir,
    );

    expect(vars).toHaveLength(1);
    expect(vars[0][0]).toEqual('aws_region');
    expect(vars[0][1]).toEqual('from-goldstack');

    delete process.env.AWS_REGION;
    cd(oldDir);
  });

  it('Should resolve variable from env var when not in goldstack.json', () => {
    const testDir = './goldstackLocal/test-env-var-not-in-config/';
    mkdir('-p', testDir);
    const oldDir = pwd();
    cd(testDir);

    write(
      `
variable "aws_region" {
  type = string
}

variable "bucket_name" {
  type = string
}`,
      './variables.tf',
    );

    write(
      JSON.stringify({
        name: 'test-root',
        workspaces: ['packages/*'],
      }),
      '../package.json',
    );

    process.env.AWS_REGION = 'ap-southeast-1';
    process.env.BUCKET_NAME = 'my-test-bucket';

    const vars = getVariablesFromHCL(
      {
        awsRegion: 'us-east-1',
      },
      'test',
      testDir,
    );

    expect(vars).toHaveLength(2);
    expect(vars.find((v) => v[0] === 'aws_region')?.[1]).toEqual('us-east-1');
    expect(vars.find((v) => v[0] === 'bucket_name')?.[1]).toEqual('my-test-bucket');

    delete process.env.AWS_REGION;
    delete process.env.BUCKET_NAME;
    cd(oldDir);
  });

  it('Should resolve variable from .env file when not in goldstack.json', () => {
    const testDir = './goldstackLocal/test-env-file-not-in-config/';
    mkdir('-p', testDir);
    const oldDir = pwd();
    cd(testDir);

    write(
      `
variable "aws_region" {
  type = string
}`,
      './variables.tf',
    );

    write(
      JSON.stringify({
        name: 'test-root',
        workspaces: ['packages/*'],
      }),
      '../package.json',
    );

    write('AWS_REGION=from-dotenv\n', '../.env');

    const vars = getVariablesFromHCL({}, 'test', testDir);

    expect(vars).toHaveLength(1);
    expect(vars[0][0]).toEqual('aws_region');
    expect(vars[0][1]).toEqual('from-dotenv');

    cd(oldDir);
  });

  it('Should warn when variable not found anywhere', () => {
    const testDir = './goldstackLocal/test-var-not-found/';
    mkdir('-p', testDir);
    const oldDir = pwd();
    cd(testDir);

    write(
      `
variable "undefined_var" {
  type = string
}`,
      './variables.tf',
    );

    write(
      JSON.stringify({
        name: 'test-root',
        workspaces: ['packages/*'],
      }),
      '../package.json',
    );

    const vars = getVariablesFromHCL({}, 'test', testDir);

    expect(vars).toHaveLength(0);

    cd(oldDir);
  });
});
