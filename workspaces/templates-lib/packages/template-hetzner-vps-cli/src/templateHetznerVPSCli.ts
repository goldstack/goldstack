import type { HetznerVPSDeployment, HetznerVPSPackage } from '@goldstack/template-hetzner-vps';
import { wrapCli } from '@goldstack/utils-cli';
import { info, warn } from '@goldstack/utils-log';
import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { infraCommands } from '@goldstack/utils-terraform';
import { initTerraformEnvironment, terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { terraformHetznerCli } from '@goldstack/utils-terraform-hetzner';
import yargs from 'yargs';
import { build, sshDeploy } from './sshDeploy';

export const buildZip = async (): Promise<void> => {
  const args = process.argv.slice(2); // Skip the first two default args (node and script path)
  const deploymentName = args[0]; // The first argument after `yarn build` will be `prod` if passed

  const packageConfig = new PackageConfig<HetznerVPSPackage, HetznerVPSDeployment>({
    packagePath: './',
  });
  const deployment = packageConfig.getDeployment(deploymentName);
  await build(deployment);
};

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .help()
      .parse();

    const packageConfig = new PackageConfig<HetznerVPSPackage, HetznerVPSDeployment>({
      packagePath: './',
    });
    const _config = packageConfig.getConfig();
    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'deploy') {
      info('Starting deployment to Hetzner VPS.');
      const deploymentName = argv.deployment;
      if (!packageConfig.hasDeployment(deploymentName)) {
        if (argv['ignore-missing-deployments']) {
          warn(
            `Deployment '${deploymentName}' does not exist. Skipping deploy due to --ignore-missing-deployments flag.`,
          );
          return;
        } else {
          throw new Error(`Cannot find configuration for deployment '${deploymentName}'`);
        }
      }
      const deployment = packageConfig.getDeployment(deploymentName);
      await build(deployment);
      await sshDeploy(deployment);
      return;
    }

    if (command === 'infra') {
      const ignoreMissingDeployments = argv['ignore-missing-deployments'];
      const deploymentName = argv.deployment;
      let deployment: HetznerVPSDeployment;

      try {
        deployment = packageConfig.getDeployment(deploymentName);
      } catch (e) {
        if (ignoreMissingDeployments) {
          warn(
            `Deployment '${deploymentName}' does not exist. Skipping operation due to --ignore-missing-deployments flag.`,
          );
          return;
        }
        throw e;
      }

      const infrastructureOp = argv._[1] as string;
      info(`Running infrastructure operation ${infrastructureOp} for ${deployment.name}`);
      // use remote managed state from Terraform
      await terraformAwsCli({
        infraOperation: 'create-state',
        deploymentName,
        ignoreMissingDeployments,
        skipConfirmations: false,
        options: undefined,
      });

      if (infrastructureOp === 'destroy-state') {
        await terraformAwsCli({
          infraOperation: 'destroy-state',
          deploymentName,
          ignoreMissingDeployments,
          skipConfirmations: false,
          options: undefined,
        });
        return;
      }

      const { awsProvider } = await initTerraformEnvironment(deploymentName);
      await terraformHetznerCli(opArgs, awsProvider);

      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
