export function getDeploymentName(deploymentName?: string) {
  if (!deploymentName) {
    if (typeof window === 'undefined') {
      deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
    } else {
      deploymentName = (window as any).GOLDSTACK_DEPLOYMENT;
      // fallback for Jest tests
      if (!deploymentName && typeof process !== 'undefined') {
        deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
      }
    }
  }

  if (!deploymentName) {
    throw new Error('Environment variable GOLDSTACK_DEPLOYMENT not defined.');
  }

  return deploymentName;
}

export function getDeploymentsOutput(
  deploymentsOutput: any,
  deploymentName: string
) {
  const deploymentOutput = deploymentsOutput.find(
    (deployment) => (deployment.name = deploymentName)
  );
  if (!deploymentOutput) {
    throw new Error(
      `No outputs from Terraform Apply available for deployment '${deploymentName}'. Did you run 'yarn infra up' for this deployment?`
    );
  }
  return deploymentOutput;
}
