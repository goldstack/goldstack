import type { Deployment } from '@goldstack/infra';
import { validateConfig } from '@goldstack/utils-config';
import type { Package } from '@goldstack/utils-package';
import { readPackageConfig } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';
import fs from 'fs';

interface PackageConfigConstructorParams {
  // biome-ignore lint/suspicious/noExplicitAny: JSON schema type is dynamic
  packageSchema?: any;
  goldstackJson?: Package;
  packagePath?: string;
}

export class PackageConfig<PackageType extends Package, DeploymentType extends Deployment> {
  // biome-ignore lint/suspicious/noExplicitAny: JSON schema type is dynamic
  packageSchema: any;
  goldstackJson: PackageType;

  constructor(params: PackageConfigConstructorParams) {
    if (!params.packageSchema && !fs.existsSync('schemas/package.schema.json')) {
      throw new Error('Package schema cannot be found in schemas/package.schema.json');
    }
    this.packageSchema =
      params.packageSchema || JSON.parse(read(params.packagePath + 'schemas/package.schema.json'));

    this.goldstackJson = validateConfig(
      params.goldstackJson || readPackageConfig(params.packagePath),
      this.getPackageSchema(),
      {
        errorMessage: 'Cannot load configuration for package.',
      },
    ) as PackageType;
  }

  // biome-ignore lint/suspicious/noExplicitAny: JSON schema type is dynamic
  getPackageSchema(): any {
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
