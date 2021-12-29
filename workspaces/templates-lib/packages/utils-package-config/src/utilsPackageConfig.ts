import { Deployment } from '@goldstack/infra';
import { Package, readPackageConfig } from '@goldstack/utils-package';
import fs from 'fs';
import { validateConfig } from '@goldstack/utils-config';
import { read } from '@goldstack/utils-sh';

interface PackageConfigConstructorParams {
  packageSchema?: any;
  goldstackJson?: Package;
  packagePath?: string;
}

export class PackageConfig<
  PackageType extends Package,
  DeploymentType extends Deployment
> {
  packageSchema: any;
  goldstackJson: Package;

  constructor(params: PackageConfigConstructorParams) {
    if (
      !params.packageSchema &&
      !fs.existsSync('schemas/package.schema.json')
    ) {
      throw new Error(
        'Package schema cannot be found in schemas/package.schema.json'
      );
    }
    this.packageSchema =
      params.packageSchema ||
      JSON.parse(read(params.packagePath + 'schemas/package.schema.json'));
    this.goldstackJson =
      params.goldstackJson || readPackageConfig(params.packagePath);
  }

  getPackageSchema(): any {
    return this.packageSchema;
  }
  getConfigFromPackageConfig(packageConfig: Package): PackageType {
    validateConfig(packageConfig, this.getPackageSchema(), {
      errorMessage: 'Cannot load configuration for S3 package.',
    });

    return packageConfig as PackageType;
  }
  getConfig(): PackageType {
    const packageConfig = readPackageConfig();
    return this.getConfigFromPackageConfig(packageConfig);
  }
  getDeployment(
    packageConfig: Package,
    deploymentName: string
  ): DeploymentType {
    const name = deploymentName;

    const deployment = packageConfig.deployments.find(
      (deployment) => deployment.name === name
    );

    if (!deployment) {
      throw new Error(`Cannot find configuration for deployment '${name}''`);
    }

    return deployment as DeploymentType;
  }
}
