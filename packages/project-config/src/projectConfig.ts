import { getPackageConfigPaths, validateConfig } from '@goldstack/utils-config';
import { readPackageConfig, Package } from '@goldstack/utils-package';

import path from 'path';
import { write, read } from '@goldstack/utils-sh';

export interface PackageConfig {
  pathInWorkspace: string;
  packageSchema: object;
  packageConfigSchema: object;
  deploymentSchema: object;
  deploymentConfigSchema: object;
  package: Package;
}

export const getPackageConfigs = (workspacePath: string): PackageConfig[] => {
  const configPaths = getPackageConfigPaths(workspacePath);
  const paths = configPaths.map((configPath) =>
    configPath.substr(0, configPath.lastIndexOf('/') + 1)
  );
  return paths.map((pathEl) => {
    const packageConfig: Package = JSON.parse(read(pathEl + 'goldstack.json')); //readPackageConfig(pathEl);

    if (!packageConfig) {
      throw new Error('Invalid config file at: ' + pathEl);
    }

    const packageSchema = JSON.parse(
      read(`${pathEl}schemas/package.schema.json`)
    );
    const packageConfigSchema = JSON.parse(
      read(`${pathEl}schemas/package-configuration.schema.json`)
    );
    const deploymentSchema = JSON.parse(
      read(`${pathEl}schemas/deployment.schema.json`)
    );
    const deploymentConfigSchema = JSON.parse(
      read(`${pathEl}schemas/deployment-configuration.schema.json`)
    );
    // packageConfig = validateConfig(packageConfig, packageSchema, {
    //   errorMessage: `Cannot validate configuration for ${pathEl}.`,
    // }) as Package;

    return {
      pathInWorkspace: path.relative(workspacePath, pathEl),
      packageSchema: packageSchema,
      packageConfigSchema: packageConfigSchema,
      deploymentSchema: deploymentSchema,
      deploymentConfigSchema: deploymentConfigSchema,
      package: packageConfig,
    };
  });
};

export const writePackageConfigs = (
  workspacePath: string,
  configs: PackageConfig[]
): void => {
  for (const config of configs) {
    // validateConfig(config.package, config.packageSchema);

    // console.log(config.pathInWorkspace);
    // console.log(JSON.stringify(config.package, null, 2));
    write(
      JSON.stringify(config.package, null, 2),
      workspacePath + config.pathInWorkspace + '/goldstack.json'
    );
  }
};
