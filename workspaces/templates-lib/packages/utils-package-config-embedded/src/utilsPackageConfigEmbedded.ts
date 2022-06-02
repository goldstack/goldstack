import type { Deployment } from '@goldstack/infra';
import type { Package } from '@goldstack/utils-package';
import fs from 'fs';

interface EmbeddedPackageConfigConstructorParams {
  packageSchema?: any;
  goldstackJson?: Package;
}

export class EmbeddedPackageConfig<
  PackageType extends Package,
  DeploymentType extends Deployment
> {
  packageSchema: any;
  goldstackJson: PackageType;

  constructor(params: EmbeddedPackageConfigConstructorParams) {
    if (
      !params.packageSchema &&
      !fs.existsSync('schemas/package.schema.json')
    ) {
      throw new Error(
        'Package schema cannot be found in schemas/package.schema.json'
      );
    }
    this.packageSchema = params.packageSchema;

    this.goldstackJson = params.goldstackJson as PackageType;
  }

  getPackageSchema(): any {
    return this.packageSchema;
  }
  getConfig(): PackageType {
    return this.goldstackJson;
  }
  getDeployment(deploymentName: string): DeploymentType {
    const name = deploymentName;

    const deployment = this.goldstackJson.deployments.find(
      (deployment) => deployment.name === name
    );

    if (!deployment) {
      throw new Error(`Cannot find configuration for deployment '${name}''`);
    }

    return deployment as DeploymentType;
  }
}
