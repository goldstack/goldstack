import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import {
  Endpoint,
  UserManagementDeployment,
  UserManagementPackage,
} from './templateUserManagement';
import {
  getDeploymentName,
  getDeploymentsOutput,
} from './userManagementConfig';

export async function getEndpoint(args: {
  goldstackConfig: any;
  endpoint: Endpoint;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<string> {
  const deploymentName = getDeploymentName(args.deploymentName);

  if (deploymentName === 'local') {
    return 'https://localhost';
  }

  const packageConfig = new EmbeddedPackageConfig<
    UserManagementPackage,
    UserManagementDeployment
  >({
    goldstackJson: args.goldstackConfig,
    packageSchema: args.packageSchema,
  });

  const deploymentOutput = getDeploymentsOutput(
    args.deploymentsOutput,
    deploymentName
  );

  console.log(deploymentOutput);
  const baseUrl = `https://${deploymentOutput.terraform.endpoint.value}`;

  const deployment = packageConfig.getDeployment(deploymentName);

  switch (args.endpoint) {
    case 'authorize':
      return `${baseUrl}/oauth2/authorize?response_type=code&client_id=${deploymentOutput.terraform.user_pool_client_id.value}&redirect_uri=${deployment.configuration.callbackUrl}&state=STATE&`;
  }
}
