import { mkdir, write, pwd, cd } from '@goldstack/utils-sh';

import {
  convertToPythonVariable,
  getVariablesFromHCL,
  convertFromPythonVariable,
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
});
