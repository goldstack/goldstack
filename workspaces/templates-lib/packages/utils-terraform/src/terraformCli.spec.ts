import { mkdir } from '@goldstack/utils-sh';
import path from 'path';
import MockCloudProvider from './MockCloudProvider';
import { getTerraformEnvVars, tf } from './terraformCli';

describe('Terraform CLI', () => {
  it('Should accept folder with spaces (v0.12)', async () => {
    const testDir = './goldstackLocal/cli-folder-w-space/0.12/My Dir';
    mkdir('-p', testDir);
    tf('init', {
      dir: path.resolve(testDir),
      version: '0.12',
      provider: new MockCloudProvider(),
    });
  });
  it('Should accept folder with spaces (v0.13', async () => {
    const testDir = './goldstackLocal/cli-folder-w-space/0.13/My Dir';
    mkdir('-p', testDir);
    tf('init', {
      dir: path.resolve(testDir),
      version: '0.13',
      provider: new MockCloudProvider(),
    });
  });
});

describe('getTerraformEnvVars', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('Should extract TF_VAR_ prefixed variables', () => {
    process.env.TF_VAR_region = 'us-west-1';
    process.env.TF_VAR_ami = 'ami-12345';

    const result = getTerraformEnvVars();

    expect(result.TF_VAR_region).toEqual('us-west-1');
    expect(result.TF_VAR_ami).toEqual('ami-12345');
  });

  it('Should extract TF_CLI_ARGS_ prefixed variables', () => {
    process.env.TF_CLI_ARGS = '-input=false';
    process.env.TF_CLI_ARGS_plan = '-refresh=false';

    const result = getTerraformEnvVars();

    expect(result.TF_CLI_ARGS).toEqual('-input=false');
    expect(result.TF_CLI_ARGS_plan).toEqual('-refresh=false');
  });

  it('Should extract TF_ prefixed variables', () => {
    process.env.TF_LOG = 'trace';
    process.env.TF_LOG_PATH = './terraform.log';
    process.env.TF_PLUGIN_CACHE_DIR = '/root/.tfcache';
    process.env.TF_WORKSPACE = 'production';

    const result = getTerraformEnvVars();

    expect(result.TF_LOG).toEqual('trace');
    expect(result.TF_LOG_PATH).toEqual('./terraform.log');
    expect(result.TF_PLUGIN_CACHE_DIR).toEqual('/root/.tfcache');
    expect(result.TF_WORKSPACE).toEqual('production');
  });

  it('Should extract HCP Terraform environment variables', () => {
    process.env.TF_CLOUD_ORGANIZATION = 'my-org';
    process.env.TF_TOKEN = 'my-token';

    const result = getTerraformEnvVars();

    expect(result.TF_CLOUD_ORGANIZATION).toEqual('my-org');
    expect(result.TF_TOKEN).toEqual('my-token');
  });

  it('Should extract TERRAFORM_CONFIG', () => {
    process.env.TERRAFORM_CONFIG = '/custom/terraformrc';

    const result = getTerraformEnvVars();

    expect(result.TERRAFORM_CONFIG).toEqual('/custom/terraformrc');
  });

  it('Should not extract non-TF environment variables', () => {
    process.env.AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
    process.env.MY_VAR = 'should-be-ignored';
    process.env.NODE_ENV = 'test';

    const result = getTerraformEnvVars();

    expect(result.AWS_ACCESS_KEY_ID).toBeUndefined();
    expect(result.MY_VAR).toBeUndefined();
    expect(result.NODE_ENV).toBeUndefined();
  });

  it('Should include empty string values', () => {
    process.env.TF_PLUGIN_CACHE_MAY_BREAK_DEPENDENCY_LOCK_FILE = '';

    const result = getTerraformEnvVars();

    expect(result.TF_PLUGIN_CACHE_MAY_BREAK_DEPENDENCY_LOCK_FILE).toEqual('');
  });
});
