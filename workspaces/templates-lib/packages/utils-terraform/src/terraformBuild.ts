import { debug, fatal, info, warn } from '@goldstack/utils-log';
import { tf } from './terraformCli';
import type {
  TerraformDeployment,
  TerraformVariables,
  TerraformVersion,
} from './types/utilsTerraformConfig';
import type { CloudProvider } from './cloudProvider';
import { cd, read, pwd } from '@goldstack/utils-sh';
import type { Variables } from './terraformCli';
import { readPackageConfig, writePackageConfig } from '@goldstack/utils-package';
import child_process, { type SpawnSyncOptionsWithStringEncoding } from 'child_process';
import assert from 'assert';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { writeDeploymentState, readDeploymentState } from '@goldstack/infra';

import JSONStableStringy from 'json-stable-stringify';
import path from 'path';
import type { TerraformOptions } from './utilsTerraform';

export const convertToPythonVariable = (variableName: string): string => {
  let res = '';

  for (const char of variableName) {
    if (char.toLowerCase() === char) {
      res += char;
    } else {
      res += '_' + char.toLowerCase();
    }
  }

  return res;
};

export const convertFromPythonVariable = (variableName: string): string => {
  let res = '';
  for (let i = 0; i < variableName.length; i++) {
    const char = variableName.charAt(i);
    if (i > 0 && variableName.charAt(i - 1) === '_') {
      res += variableName.charAt(i).toUpperCase();
    } else if (variableName.charAt(i) !== '_') {
      res += char;
    }
  }
  return res;
};

export const getVariablesFromProperties = (
  properties: object,
  terraformVariables?: TerraformVariables,
): Variables => {
  const vars: Variables = [];
  if (!terraformVariables) {
    return vars;
  }
  for (const key in properties) {
    if (terraformVariables.find((varName) => varName === key)) {
      const variableName = convertToPythonVariable(key);
      const variableValue = properties[key];
      if (variableValue !== '') {
        vars.push([variableName, variableValue]);
      } else {
        vars.push([variableName, process.env[variableName.toLocaleUpperCase()] || '']);
      }
    }
  }

  return vars;
};

export const parseVariables = (hcl: string): string[] => {
  const reg = /variable[^"]*"([^"]*)"[^{]*{/gm;
  let result: RegExpExecArray | null;
  const variableNames: string[] = [];
  while ((result = reg.exec(hcl)) !== null) {
    variableNames.push(result[1]);
  }
  return variableNames;
};

export const getVariablesFromHCL = (properties: object): Variables => {
  if (!fs.existsSync('./variables.tf')) {
    warn(
      `No variables.tf file exists in ${pwd()}. Goldstack only supports declaring variables in a variables.tf file.`,
    );
    return [];
  }
  const variablesHCL = read('./variables.tf');
  const hclVariableNames = parseVariables(variablesHCL);
  const jsVariableNames = hclVariableNames.map((hclVarName) =>
    convertFromPythonVariable(hclVarName),
  );

  jsVariableNames.forEach((key) => {
    if (!Object.hasOwn(properties, key)) {
      warn(
        `Cannot find property "${key}" in Goldstack configuration. Therefore terraform variable ${convertToPythonVariable(
          key,
        )} will not be read from goldstack.json.`,
      );
    }
  });

  const vars: Variables = [];
  for (const key in properties) {
    if (key.indexOf('_') !== -1) {
      warn(
        'Property in Goldstack configuration contains "_". This is not recommended. Property: ' +
          key +
          ' Please use valid JavaScript variable names. For instance, use "myVar" instead of "my_var". ' +
          ' Goldstack will automatically convert these to Terraform variables ("myVar" -> "my_var") when required.',
      );
    }
    if (jsVariableNames.find((varName) => varName === key)) {
      const pythonVariableName = convertToPythonVariable(key);
      const variableValue = properties[key];
      if (variableValue !== '') {
        if (typeof variableValue === 'string') {
          vars.push([pythonVariableName, variableValue]);
        } else if (typeof variableValue === 'number') {
          vars.push([pythonVariableName, `${variableValue}`]);
        } else if (typeof variableValue === 'object') {
          vars.push([pythonVariableName, `${JSONStableStringy(variableValue)}`]);
        } else {
          throw new Error(
            `Not supported type for variable ${pythonVariableName}: ${typeof variableValue}`,
          );
        }
      } else {
        const environmentVariableName = pythonVariableName.toLocaleUpperCase();
        debug(
          `Checking environment variable to set terraform variable: ${environmentVariableName}`,
        );
        if (process.env[environmentVariableName] || process.env[environmentVariableName] === '') {
          info('Setting terraform variable from environment variable ' + environmentVariableName);
          vars.push([pythonVariableName, process.env[environmentVariableName] || '']);
        } else {
          warn('Terraform variable will not be defined ' + pythonVariableName);
        }
      }
    }
  }
  return vars;
};

const getDeployment = (args: string[]): TerraformDeployment => {
  if (args.length < 1) {
    throw new Error('Please specify the name of the deployment.');
  }
  const name = args[0];

  const packageConfig = readPackageConfig();

  const deployment = packageConfig.deployments.find((deployment) => deployment.name === name);

  if (!deployment) {
    fatal(`Cannot find configuration for deployment '${name}''`);
    throw new Error('Cannot parse configuration.');
  }

  return deployment;
};

export class TerraformBuild {
  provider: CloudProvider;

  private getTfStateVariables = (deployment: TerraformDeployment): [string, string][] => {
    const packageConfig = readPackageConfig();
    const deployments = packageConfig.deployments.filter((d) => d.name === deployment.name);
    if (deployments.length !== 1) {
      throw new Error(`Cannot find deployment ${deployment.name}`);
    }
    const deploymentConfig = deployments[0];

    // initialise id for key if required
    if (!(deploymentConfig as TerraformDeployment).tfStateKey) {
      const stateHash = crypto.randomBytes(10).toString('hex');
      const stateKey = `${packageConfig.name}-${deployment.name}-${stateHash}.tfstate`;
      info(`Initialising Terraform State key for ${deployment.name} to ${stateKey}`);
      (deploymentConfig as TerraformDeployment).tfStateKey = stateKey;
      writePackageConfig(packageConfig);
    }

    return this.provider.getTfStateVariables(deploymentConfig);
  };

  private getTfVersion = (args: string[]): TerraformVersion => {
    if (args.length > 0) {
      const deployment = getDeployment(args);
      if (deployment.tfVersion) {
        return deployment.tfVersion;
      }
    }
    if (fs.existsSync('./infra/tfConfig.json')) {
      try {
        const tsConfig = JSON.parse(read('./infra/tfConfig.json'));
        return tsConfig.tfVersion;
      } catch (e) {
        throw new Error(
          'Invalid Terraform configuration in ' + path.resolve('./infra/tfConfig.json'),
        );
      }
    }

    throw new Error(
      'Cannot determine Terraform version from ' +
        args +
        ' in ' +
        pwd() +
        '. Terraform config with version expected in `infra/tfConfig.json` or as part of the deployment.',
    );
    // before Terraform versions were introduced, only version 0.12 was supported
    //return '0.12';
  };

  init = (args: string[]): void => {
    const deployment = getDeployment(args);
    const version = this.getTfVersion(args);
    const backendConfig = this.getTfStateVariables(deployment);
    cd('./infra/aws');
    try {
      const provider = this.provider;

      let workspace: undefined | string;

      // supplying workspace does not work for first initialisation
      // https://discuss.hashicorp.com/t/terraform-init-ignores-input-false-option/16065
      // doesn't seem to be an issue in Terraform 1.1
      if (fs.existsSync('./.terraform') && version !== '0.12') {
        workspace = deployment.name;
      }

      const variables = [...getVariablesFromHCL({ ...deployment, ...deployment.configuration })];

      tf('init', {
        provider,
        version,
        backendConfig,
        variables,
        workspace: workspace,
        options: ['-force-copy', '-reconfigure', '-upgrade'],
      });
      const workspaces = tf('workspace list', {
        provider,
        version,
        silent: true,
      });

      const deploymentName = args[0];
      let workspaceExists = workspaces.split('\n').find((line) => {
        return line.indexOf(deploymentName) >= 0;
      });
      if (!workspaceExists) {
        workspaceExists = workspaces.split('\n').find((line) => {
          return line.indexOf(deploymentName) >= 0;
        });
        if (!workspaceExists) {
          tf(`workspace new ${deploymentName}`, {
            provider,
            version,
          });
        }
        tf(`workspace select ${deploymentName}`, {
          provider,
          version,
          silent: true,
        });
      } else {
        tf(`workspace select ${deploymentName}`, {
          provider,
          version,
          silent: true,
        });
      }
    } finally {
      cd('../..');
    }
  };

  private ensureInCorrectWorkspace = (params: {
    deploymentName: string;
    provider: CloudProvider;
    version: TerraformVersion;
    backendConfig: [string, string][];
  }): void => {
    const currentWorkspace = tf('workspace show', {
      provider: params.provider,
      version: params.version,
      silent: true,
    }).trim();
    if (currentWorkspace !== params.deploymentName) {
      tf(`workspace select ${params.deploymentName}`, {
        provider: params.provider,
        version: params.version,
        silent: true,
      });
      // init with reconfigure required here in case we are switching to a different
      // s3 bucket in a different environment for a different deployment
      tf('init', {
        provider: params.provider,
        backendConfig: params.backendConfig,
        version: params.version,
        workspace: params.deploymentName,
        options: ['-reconfigure'],
      });
    }
  };

  plan = (args: string[]): void => {
    const deployment = getDeployment(args);
    const version = this.getTfVersion(args);
    const backendConfig = this.getTfStateVariables(deployment);
    cd('./infra/aws');
    try {
      const provider = this.provider;

      this.ensureInCorrectWorkspace({
        deploymentName: args[0],
        provider,
        version,
        backendConfig,
      });

      const variables = [...getVariablesFromHCL({ ...deployment, ...deployment.configuration })];

      tf('plan', {
        provider,
        variables,
        version,
        options: ['-input=false', '-out tfplan'],
      });
    } finally {
      cd('../..');
    }
  };

  apply = (args: string[], options?: TerraformOptions): void => {
    const deployment = getDeployment(args);
    const version = this.getTfVersion(args);
    const backendConfig = this.getTfStateVariables(deployment);
    cd('./infra/aws');
    try {
      const provider = this.provider;
      const deploymentName = args[0];
      this.ensureInCorrectWorkspace({
        deploymentName: args[0],
        provider,
        version,
        backendConfig,
      });
      let cliOptions = ['-input=false', 'tfplan'];
      if (options?.parallelism) {
        cliOptions = [`-parallelism=${options.parallelism}`, ...cliOptions];
      }
      tf('apply', {
        provider,
        options: cliOptions,
        version,
      });

      const res = tf('output', {
        provider,
        options: ['-json'],
        version,
      }).trim();

      const deploymentState = readDeploymentState('./../../', deploymentName, {
        createIfNotExist: true,
      });
      deploymentState.terraform = JSON.parse(res);
      writeDeploymentState('./../../', deploymentState);
    } finally {
      cd('../..');
    }
  };

  private prompt = (message: string) => {
    process.stdout.write(message);

    let cmd: string;
    let args: string[];
    if (os.platform() === 'win32') {
      cmd = 'cmd';
      args = ['/V:ON', '/C', 'set /p response= && echo !response!'];
    } else {
      cmd = 'bash';
      args = ['-c', 'read response; echo "$response"'];
    }

    const opts: SpawnSyncOptionsWithStringEncoding = {
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: false,
      encoding: 'utf-8',
    };

    return child_process.spawnSync(cmd, args, opts).stdout.toString().trim();
  };

  destroy = (args: string[]): void => {
    const deployment = getDeployment(args);
    const version = this.getTfVersion(args);
    const backendConfig = this.getTfStateVariables(deployment);
    cd('./infra/aws');
    try {
      const ciConfirmed = args.find((str) => str === '-y');
      if (!ciConfirmed) {
        const value = this.prompt(
          'Are you sure to destroy your deployed resources? If yes, please type `y` and enter.\n' +
            'Otherwise, press enter.\nYour Input: ',
        );
        if (value !== 'y') {
          fatal('Prompt not confirmed with `y`');
        }
      }
      const provider = this.provider;
      const variables = [...getVariablesFromHCL({ ...deployment, ...deployment.configuration })];

      tf(`workspace select ${args[0]}`, { provider, version, silent: true });
      tf('init', {
        provider,
        backendConfig,
        options: ['-reconfigure'],
        version,
      });
      tf('plan', {
        provider,
        variables,
        version,
        workspace: args[0],
        options: ['-input=false', '-out tfplan'],
      });
      tf('destroy', {
        provider,
        variables,
        version,
        options: ['-input=false', '-auto-approve'],
      });
      const deploymentState = readDeploymentState('./../../', args[0], {
        createIfNotExist: true,
      });
      deploymentState.terraform = undefined;
      writeDeploymentState('./../../', deploymentState);
    } finally {
      cd('../..');
    }
  };

  private performUpgrade = (deploymentName: string, targetVersion: TerraformVersion) => {
    const provider = this.provider;
    const version = this.getTfVersion([deploymentName]);
    cd('./infra/aws');
    const currentWorkspace = tf('workspace show', {
      provider: provider,
      version: version,
      silent: true,
    }).trim();
    if (currentWorkspace !== deploymentName) {
      const workspaces = tf('workspace list', {
        provider,
        version,
        silent: true,
      });

      const workspaceExists = workspaces.split('\n').find((line) => {
        return line.indexOf(deploymentName) >= 0;
      });
      if (workspaceExists) {
        tf(`workspace select ${deploymentName}`, {
          provider,
          version,
          silent: true,
        });
      } else {
        // Sometimes it seems that Terraform forgets/destroys a workspace when upgrading the version of
        // another deployment.
        throw new Error(
          `Please initialise the deployment to be upgraded first with 'yarn infra init ${deploymentName}'. Please note that the 'init' command may fail with the error 'Error: Invalid legacy provider address' (if you have upgraded another deployment before this). In that case, run the 'upgrade' command regardless after the 'init' command has completed.`,
        );
      }
    }
    if (targetVersion === '0.13') {
      const upgradeRes = tf(`${targetVersion}upgrade`, {
        version: targetVersion,
        provider,
        options: ['-yes'],
      });
      if (upgradeRes.indexOf('Upgrade complete!') === -1) {
        throw new Error('Upgrade of Terraform version not successful.');
      }
    }
    cd('../..');
    const packageConfig = readPackageConfig();
    const deploymentInConfig = packageConfig.deployments.find((e) => e.name === deploymentName);
    assert(deploymentInConfig);
    deploymentInConfig.tfVersion = targetVersion;
    writePackageConfig(packageConfig);
    this.init([deploymentName]);
    console.log(
      `Version upgraded to ${targetVersion}. Please run deployment to upgrade remote state before further upgrades.`,
    );
  };

  upgrade = (args: string[]): void => {
    const deployment = getDeployment(args);
    const version = this.getTfVersion([deployment.name]) || '0.12';
    const newVersion = args[1];
    if (version === newVersion) {
      console.log('Already on version', newVersion);
      return;
    }
    if (version === '0.12' && newVersion === '0.13') {
      this.performUpgrade(args[0], '0.13');
      return;
    }

    if (version === '0.13' && newVersion === '0.14') {
      this.performUpgrade(args[0], '0.14');
      return;
    }
    if (version === '0.14' && newVersion === '0.15') {
      this.performUpgrade(args[0], '0.15');
      return;
    }
    if (version === '0.15' && newVersion === '1.0') {
      this.performUpgrade(args[0], '1.0');
      return;
    }
    if (version === '1.0' && newVersion === '1.1') {
      this.performUpgrade(args[0], '1.1');
      return;
    }
    if (version.indexOf('1.') === 0 && newVersion.indexOf('1.') === 0) {
      this.performUpgrade(args[0], newVersion as TerraformVersion);
      return;
    }
    throw new Error(`Version upgrade not supported: from [${version}] to [${newVersion}].`);
  };

  isUp = (args: string[]): void => {
    const deploymentsInfo = JSON.parse(read('src/state/deployments.json'));
    const deployment = getDeployment(args);
    const deploymentState = deploymentsInfo.find((e: any) => e.name === deployment.name);
    if (!deploymentState || !deploymentState.terraform) {
      info('is-up: false');
    } else {
      info('is-up: true');
    }
  };

  terraform(opArgs: string[]): void {
    const provider = this.provider;
    const deployment = getDeployment(opArgs);
    const version = this.getTfVersion(opArgs);

    let backendConfig: [string, string][] | undefined;

    if (opArgs.find((arg) => arg === '--inject-backend-config')) {
      backendConfig = this.getTfStateVariables(deployment);
    }

    let variables: [string, string][] | undefined;

    cd('./infra/aws');
    try {
      if (opArgs.find((arg) => arg === '--inject-variables')) {
        variables = [
          ...getVariablesFromHCL({
            ...deployment,
            ...deployment.configuration,
          }),
        ];
      }
      tf(`workspace select ${opArgs[0]}`, { provider, version, silent: true });
      const remainingArgs = opArgs
        .slice(1)
        .filter((arg) => arg !== '--inject-backend-config' && arg !== '--inject-variables');
      tf(remainingArgs.join(' '), {
        provider,
        backendConfig,
        version,
        variables,
      });
    } finally {
      cd('../..');
    }
  }

  constructor(provider: CloudProvider) {
    assert(provider);
    this.provider = provider;
  }
}
