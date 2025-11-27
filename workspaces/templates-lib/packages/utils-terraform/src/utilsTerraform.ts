export type {
  TerraformDeployment,
  TerraformVariable,
  TerraformVariables,
} from './types/utilsTerraformConfig';

import type { CloudProvider } from './cloudProvider';

export type { CloudProvider } from './cloudProvider';

import { TerraformBuild } from './terraformBuild';

export { getVariablesFromProperties } from './terraformBuild';
export { tf } from './terraformCli';

import type { Argv } from 'yargs';

export const infraCommands = (): any => {
  const deploymentPositional = (yargs: Argv<any>): Argv<any> => {
    return yargs.positional('deployment', {
      type: 'string',
      describe: 'Name of the deployment this command should be applied to',
      demandOption: true,
    });
  };

  const ignoreMissingDeploymentsOption = (yargs: Argv<any>): Argv<any> => {
    return yargs.option('ignore-missing-deployments', {
      description: 'If the deployment does not exist, show a warning instead of failing.',
      default: false,
      demandOption: false,
      type: 'boolean',
    });
  };

  return (yargs: Argv<any>): Argv<any> => {
    return yargs
      .command(
        'up <deployment>',
        'Stands up infrastructure for the specified deployment',
        (yargs) => deploymentPositional(ignoreMissingDeploymentsOption(yargs)),
      )
      .command(
        'init <deployment>',
        'Initialises Terraform working directory for deployment',
        (yargs) => deploymentPositional(ignoreMissingDeploymentsOption(yargs)),
      )
      .command('plan <deployment>', 'Creates a Terraform execution plan for deployment', (yargs) =>
        deploymentPositional(ignoreMissingDeploymentsOption(yargs)),
      )
      .command(
        'apply <deployment>',
        'Applies the last Terraform execution plan calculated using `infra plan`',
        (yargs) => deploymentPositional(ignoreMissingDeploymentsOption(yargs)),
      )
      .command(
        'destroy <deployment>',
        'DANGER: Destroys all deployed infrastructure for the deployment',
        (yargs) => {
          return deploymentPositional(ignoreMissingDeploymentsOption(yargs)).option('yes', {
            alias: 'y',
            description:
              'DANGER: If provided, confirmation for deleting infrastructure resources will be skipped.',
            default: false,
            demandOption: false,
            type: 'boolean',
          });
        },
      )
      .command(
        'is-up <deployment>',
        'Checks whether infrastructure for a deployment is currently provisioned.',
        (yargs) => deploymentPositional(ignoreMissingDeploymentsOption(yargs)),
      )
      .command(
        'destroy-state <deployment>',
        'DANGER: Destroys the remote state stored for this deployment.',
        (yargs) => {
          return deploymentPositional(ignoreMissingDeploymentsOption(yargs)).option('yes', {
            alias: 'y',
            description:
              'DANGER: If provided, confirmation for deleting remote state will be skipped.',
            default: false,
            demandOption: false,
            type: 'boolean',
          });
        },
      )
      .command(
        'create-state <deployment>',
        'Creates a remote state for this deployment if it does not already exist.',
        (yargs) => deploymentPositional(ignoreMissingDeploymentsOption(yargs)),
      )
      .command(
        'upgrade <deployment> <targetVersion>',
        'Upgrades Terraform version to a new target version (experimental)',
        (yargs) => {
          return deploymentPositional(ignoreMissingDeploymentsOption(yargs)).positional(
            'targetVersion',
            {
              type: 'string',
              description: 'Provides the target Terraform version that should be migrated to.',
              demandOption: true,
            },
          );
        },
      )
      .command(
        'terraform <deployment> [command..]',
        'Runs an arbitrary Terraform CLI command',
        (yargs) => {
          return deploymentPositional(ignoreMissingDeploymentsOption(yargs))
            .option('inject-variables', {
              description: 'Injects variables into the Terraform CLI command.',
              default: false,
              type: 'boolean',
              demandOption: false,
            })
            .option('inject-backend-config', {
              description: 'Injects backend config into the Terraform CLI command.',
              default: false,
              type: 'boolean',
              demandOption: false,
            });
        },
      );
  };
};

export interface TerraformOptions {
  parallelism?: number;
  provider?: CloudProvider;
}

export type TerraformCliParams = {
  options: TerraformOptions;
  infraOperation: string;
  deploymentName: string;
  targetVersion?: string;
  confirm?: boolean;
  command?: string[];
  injectVariables?: boolean;
  injectBackendConfig?: boolean;
};

export const terraformCli = (params: TerraformCliParams): void => {
  if (!params.options.provider) {
    throw new Error('Cloud provider not defined');
  }
  const operation = params.infraOperation;

  const build = new TerraformBuild(params.options.provider);

  if (operation === 'up') {
    build.init({ deploymentName: params.deploymentName });
    build.plan({ deploymentName: params.deploymentName });
    build.apply({ deploymentName: params.deploymentName, options: params.options });
    return;
  }

  if (operation === 'init') {
    build.init({ deploymentName: params.deploymentName });
    return;
  }
  if (operation === 'plan') {
    build.plan({ deploymentName: params.deploymentName });
    return;
  }
  if (operation === 'apply') {
    build.apply({ deploymentName: params.deploymentName, options: params.options });
    return;
  }

  if (operation === 'destroy') {
    build.destroy({ deploymentName: params.deploymentName, confirm: params.confirm });
    return;
  }

  if (operation === 'is-up') {
    build.isUp({ deploymentName: params.deploymentName });
    return;
  }

  if (operation === 'upgrade') {
    build.upgrade({ deploymentName: params.deploymentName, targetVersion: params.targetVersion! });
    return;
  }
  if (operation === 'terraform') {
    build.terraform({
      deploymentName: params.deploymentName,
      command: params.command!,
      injectVariables: params.injectVariables,
      injectBackendConfig: params.injectBackendConfig,
    });
    return;
  }
  if (operation === 'destroy-state') {
    throw new Error('The destroy-state operation should be performed by the provider');
  }

  throw new Error('Unknown infrastructure operation: ' + operation);
};
