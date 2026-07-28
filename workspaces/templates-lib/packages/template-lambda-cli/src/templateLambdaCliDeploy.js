'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.deployCli = exports.deployLambda = void 0;
const infra_1 = require('@goldstack/infra');
const infra_aws_1 = require('@goldstack/infra-aws');
const utils_aws_lambda_1 = require('@goldstack/utils-aws-lambda');
const deployLambda = async (params) => {
  const targetArchive = 'lambda.zip';
  const lambdaDistDir = './distLambda';
  const functionName = (0, infra_1.readTerraformStateVariable)(
    params.deploymentState,
    'lambda_function_name',
  );
  await (0, utils_aws_lambda_1.deployFunction)({
    targetArchiveName: targetArchive,
    lambdaPackageDir: lambdaDistDir,
    awsCredentials: await (0, infra_aws_1.getAWSUser)(params.deployment.awsUser),
    region: params.deployment.awsRegion,
    functionName,
  });
};
exports.deployLambda = deployLambda;
const deployCli = async (deployment) => {
  const deploymentState = (0, infra_1.readDeploymentState)('./', deployment.name);
  await (0, exports.deployLambda)({
    deployment,
    deploymentState,
  });
};
exports.deployCli = deployCli;
//# sourceMappingURL=templateLambdaCliDeploy.js.map
