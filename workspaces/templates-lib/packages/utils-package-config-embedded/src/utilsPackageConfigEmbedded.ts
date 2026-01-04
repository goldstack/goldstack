import type { Deployment } from '@goldstack/infra';
import type { Package } from '@goldstack/utils-package';

interface EmbeddedPackageConfigConstructorParams {
  packageSchema?: any; // biome-ignore lint/suspicious/noExplicitAny: JSON schema type is dynamic
  goldstackJson?: Package;
}

export class EmbeddedPackageConfig<PackageType extends Package, DeploymentType extends Deployment> {
  packageSchema: any; // biome-ignore lint/suspicious/noExplicitAny: JSON schema type is dynamic
  goldstackJson: PackageType;

  constructor(params: EmbeddedPackageConfigConstructorParams) {
    if (!params.packageSchema) {
      throw new Error('Package schema was not provided');
    }
    this.packageSchema = params.packageSchema;

    this.goldstackJson = params.goldstackJson as PackageType;
  }

  getPackageSchema(): any {
    // biome-ignore lint/suspicious/noExplicitAny: JSON schema type is dynamic
    return this.packageSchema;
  }
  getConfig(): PackageType {
    return this.goldstackJson;
  }
  getDeployment(deploymentName: string): DeploymentType {
    const name = deploymentName;

    const deployment = this.goldstackJson.deployments.find(
      (deployment) => deployment.name === name,
    );

    if (!deployment) {
      throw new Error(`Cannot find configuration for deployment '${name}''`);
    }

    return deployment as DeploymentType;
  }

  hasDeployment(deploymentName: string): boolean {
    const deployment = this.goldstackJson.deployments.find(
      (deployment) => deployment.name === deploymentName,
    );
    return !!deployment;
  }
}
