import { defaultSdkMaxSizeBytes, selectDeploymentMethod } from '@goldstack/utils-aws-lambda';

describe('selectDeploymentMethod', () => {
  it('Should use the AWS SDK for small archives in auto mode', () => {
    expect(
      selectDeploymentMethod({
        archiveSizeBytes: defaultSdkMaxSizeBytes - 1,
      }),
    ).toEqual('sdk');
  });

  it('Should use the AWS CLI for large archives in auto mode', () => {
    expect(
      selectDeploymentMethod({
        archiveSizeBytes: defaultSdkMaxSizeBytes + 1,
      }),
    ).toEqual('cli');
  });

  it('Should use the AWS SDK at the size limit in auto mode', () => {
    expect(
      selectDeploymentMethod({
        archiveSizeBytes: defaultSdkMaxSizeBytes,
      }),
    ).toEqual('sdk');
  });

  it('Should respect a custom maximum SDK size', () => {
    expect(
      selectDeploymentMethod({
        archiveSizeBytes: 1024,
        sdkMaxSizeBytes: 512,
      }),
    ).toEqual('cli');
  });

  it('Should always use the AWS CLI when forced to cli mode', () => {
    expect(
      selectDeploymentMethod({
        archiveSizeBytes: 1,
        deploymentMode: 'cli',
      }),
    ).toEqual('cli');
  });

  it('Should use the AWS SDK when forced to sdk mode and within the size limit', () => {
    expect(
      selectDeploymentMethod({
        archiveSizeBytes: 1,
        deploymentMode: 'sdk',
      }),
    ).toEqual('sdk');
  });

  it('Should throw when forced to sdk mode and the archive is too large', () => {
    expect(() =>
      selectDeploymentMethod({
        archiveSizeBytes: defaultSdkMaxSizeBytes + 1,
        deploymentMode: 'sdk',
      }),
    ).toThrow(/exceeds the maximum size for SDK uploads/);
  });
});
