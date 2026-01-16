import type { DeploymentState } from '@goldstack/infra';
import { getAWSUser } from '@goldstack/infra-aws';
import { awsCli } from '@goldstack/utils-aws-cli';
import { cp, mkdir, read, rmSafe, write } from '@goldstack/utils-sh';
import { glob } from 'glob';
import { packageCloudFrontFunction } from './cloudFrontFunctionPackage';
import type { NextjsDeployment } from './types/NextJsPackage';

interface DeployFunctionParams {
  deployment: NextjsDeployment;
  deploymentState: DeploymentState;
}

export const deployCloudFrontFunction = async (params: DeployFunctionParams): Promise<void> => {
  const functionSourceDir = './src/utils/routing/';
  const functionCompiledDir = './dist/src/utils/routing/';
  const functionPackageDir = './dist/cloudFrontFunction/';

  // Getting the latest manifest containing Next.js dynamic routes
  const routesManifest = JSON.parse(read('./.next/routes-manifest.json'));

  // Adding in statically rendered pages
  const dynamicRoutes = routesManifest.dynamicRoutes;
  const htmlPagePaths: string[] = await glob('webDist/**/*.html');
  const htmlPagePathsWithoutRootDir = htmlPagePaths.map((match) => {
    const els = match.split('/');
    els.shift();
    const withoutRootDir = els.join('/');
    return withoutRootDir;
  });
  const htmlPagePathsWithoutExtension = htmlPagePathsWithoutRootDir.map((match) => {
    const comps = match.split('.');
    comps.pop();
    const withoutExtension = comps.join('.');
    return withoutExtension;
  });

  const staticRoutes = htmlPagePathsWithoutExtension.map((match) => ({
    page: `/${match}`,
    regex: `^/${match.replace(/\//g, '\\/')}$`,
  }));

  routesManifest.dynamicRoutes = [...staticRoutes, ...dynamicRoutes];
  routesManifest.staticRoutes = staticRoutes;

  // Making sure there are no linting errors with copied file
  await rmSafe(`${functionSourceDir}routes-manifest.json`);
  write(JSON.stringify(routesManifest, null, 2), `${functionSourceDir}routes-manifest.json`);
  await rmSafe(`${functionCompiledDir}routes-manifest.json`);
  cp('-f', `${functionSourceDir}routes-manifest.json`, `${functionCompiledDir}routes-manifest.json`);

  // Package source for CloudFront Functions runtime
  await rmSafe(functionPackageDir);
  mkdir('-p', functionPackageDir);

  const functionCode = await packageCloudFrontFunction({
    sourceFile: `${functionCompiledDir}lambda.js`,
    destFile: `${functionPackageDir}function.js`,
  });

  // Deploy the function code via CloudFront API
  // Since Terraform ignores changes to the function code, we can update it here
  const functionName = `${params.deployment.name.replace(/[^a-zA-Z0-9-_]/g, '-')}-routing`;
  const credentials = await getAWSUser(params.deployment.awsUser);

  // Base64 encode the function code as required by AWS CLI
  const encodedFunctionCode = Buffer.from(functionCode, 'utf8').toString('base64');

  try {
    // Try to update the existing function
    await awsCli({
      credentials,
      region: 'us-east-1',
      command: `cloudfront update-function --name ${functionName} --function-config Comment="Next.js routing function",Runtime="cloudfront-js-2.0" --function-code "${encodedFunctionCode}" --if-match "*"`,
      options: { silent: true },
    });
  } catch (error) {
    // If function doesn't exist, create it
    await awsCli({
      credentials,
      region: 'us-east-1',
      command: `cloudfront create-function --name ${functionName} --function-config Comment="Next.js routing function",Runtime="cloudfront-js-2.0" --function-code "${encodedFunctionCode}"`,
      options: { silent: true },
    });
  }
};
