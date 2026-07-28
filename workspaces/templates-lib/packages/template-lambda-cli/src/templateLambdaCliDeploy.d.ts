import { type DeploymentState } from '@goldstack/infra';
import type { LambdaDeployment } from './types/LambdaPackage';
interface DeployLambdaParams {
  deployment: LambdaDeployment;
  deploymentState: DeploymentState;
}
export declare const deployLambda: (params: DeployLambdaParams) => Promise<void>;
export declare const deployCli: (deployment: LambdaDeployment) => Promise<void>;
export {};
//# sourceMappingURL=templateLambdaCliDeploy.d.ts.map
