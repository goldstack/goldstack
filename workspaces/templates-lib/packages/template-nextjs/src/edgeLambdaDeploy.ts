import { NextjsDeployment } from './types/NextJsPackage';
import { getAWSUser } from '@goldstack/infra-aws';
import { readTerraformStateVariable, DeploymentState } from '@goldstack/infra';
import { zip, cp, write, rmSafe, read } from '@goldstack/utils-sh';
import { awsCli } from '@goldstack/utils-aws-cli';
import util from 'util';
import globFunc from 'glob';

const glob = util.promisify(globFunc);

interface DeployLambdaParams {
  deployment: NextjsDeployment;
  deploymentState: DeploymentState;
}

export const deployEdgeLambda = async (
  params: DeployLambdaParams
): Promise<void> => {
  const targetArchive = 'lambda.zip';
  const lambdaDistDir = './dist/utils/routing/';

  // Getting the latest manifest containing Next js dynamic routes
  const routesManifest = JSON.parse(read('./.next/routes-manifest.json'));
  await rmSafe('./src/utils/routing/routes-manifest.json');

  // adding in statically rendered pages
  const dynamicRoutes = routesManifest.dynamicRoutes;
  const htmlPagePaths: string[] = await glob('webDist/**/*.html');
  const htmlPagePathsWithoutRootDir = htmlPagePaths.map((match) => {
    const els = match.split('/');
    els.shift();
    const withoutRootDir = els.join('/');
    return withoutRootDir;
  });
  const htmlPagePathsWithoutExtension = htmlPagePathsWithoutRootDir.map(
    (match) => {
      const comps = match.split('.');
      comps.pop();
      const withoutExtension = comps.join('.');
      return withoutExtension;
    }
  );

  const staticRoutes = htmlPagePathsWithoutExtension.map((match) => ({
    page: '/' + match,
    regex: `^\\/${match.replace(/\//g, '\\/')}$`,
  }));

  routesManifest.dynamicRoutes = [...staticRoutes, ...dynamicRoutes];
  // Making sure there are no linting errors with copied file
  write(
    JSON.stringify(routesManifest, null, 2),
    './src/utils/routing/routes-manifest.json'
  );
  await rmSafe('./dist/utils/routing/routes-manifest.json');
  cp(
    '-f',
    './src/utils/routing/routes-manifest.json',
    './dist/utils/routing/routes-manifest.json'
  );

  await rmSafe(targetArchive);
  await zip({ directory: lambdaDistDir, target: targetArchive });

  const deployResult = awsCli({
    credentials: await getAWSUser(params.deployment.awsUser),
    region: 'us-east-1',
    command: `lambda update-function-code --function-name ${readTerraformStateVariable(
      params.deploymentState,
      'edge_function_name'
    )} --zip-file fileb://${targetArchive} --publish`,
  });
  await rmSafe(targetArchive);

  const { FunctionArn } = JSON.parse(deployResult);

  const qualifiedArn = `${FunctionArn}`;

  const cfDistributionResult = awsCli({
    credentials: await getAWSUser(params.deployment.awsUser),
    region: 'us-east-1',
    command: `cloudfront get-distribution-config --id ${readTerraformStateVariable(
      params.deploymentState,
      'website_cdn_root_id'
    )}`,
    options: { silent: true },
  });

  const cfDistribution = JSON.parse(cfDistributionResult);

  const eTag = cfDistribution.ETag;
  const lambdaFunctionAssociations =
    cfDistribution.DistributionConfig.DefaultCacheBehavior
      .LambdaFunctionAssociations.Items;
  lambdaFunctionAssociations[0].LambdaFunctionARN = qualifiedArn;

  await rmSafe('./dist/cf.json');
  write(
    JSON.stringify(cfDistribution.DistributionConfig, null, 2),
    './dist/cf.json'
  );
  awsCli({
    credentials: await getAWSUser(params.deployment.awsUser),
    region: 'us-east-1',
    command: `cloudfront update-distribution --id ${readTerraformStateVariable(
      params.deploymentState,
      'website_cdn_root_id'
    )} --distribution-config file://dist/cf.json --if-match ${eTag}`,
    options: { silent: true },
  });
  await rmSafe('./dist/cf.json');
};
