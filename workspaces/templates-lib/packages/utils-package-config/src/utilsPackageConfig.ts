import type { Deployment } from '@goldstack/infra';
import type { Package } from '@goldstack/utils-package';
import fs from 'fs';

import { validateConfig } from '@goldstack/utils-config';
import { readPackageConfig } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';

interface PackageConfigConstructorParams {
  packageSchema?: any;
  goldstackJson?: Package;
  packagePath?: string;
}

export class PackageConfig<PackageType extends Package, DeploymentType extends Deployment> {
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
}
