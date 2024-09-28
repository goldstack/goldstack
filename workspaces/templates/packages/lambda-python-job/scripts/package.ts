import {
  zip,
  exec,
  cp,
  rmSafe,
  globSync,
  read,
  rm,
  unzip,
} from '@goldstack/utils-sh';
import { debug, info, warn } from '@goldstack/utils-log';
import * as path from 'path';
import * as fs from 'fs';

// Function to get the current virtual environment
function getActiveVenv(): string | null {
  const activeVenv = process.env.VIRTUAL_ENV || null;

  debug(`Active virtual environment: ${activeVenv}`);
  return activeVenv;
}

async function getSitePackagesDir(): Promise<string> {
  const pipShowResult = exec('python -m pip show pip');

  const locationMatch = pipShowResult.match(/Location:\s+(.*)/);
  if (locationMatch) {
    const sitePackagesDir = locationMatch[1].trim();
    return sitePackagesDir;
  }

  throw new Error(
    'Unable to determine the location of site-packages directory.'
  );
}

async function packageLambda() {
  const currentDir = process.cwd();
  if (path.basename(currentDir) !== 'lambda') {
    throw new Error('Script expects to be run from lambda/ directory');
  }

  const projectDir = path.dirname(currentDir);
  const lambdaDir = path.join(projectDir, 'lambda');
  const venvDir = path.join(lambdaDir, 'lambda_env');
  const distDir = path.join(projectDir, 'distLambda'); // Destination folder
  const targetZip = path.join(projectDir, 'lambda.zip');
  const lambdaFunctionFile = path.join(lambdaDir, 'lambda.py');
  const requirementsFile = path.join(lambdaDir, 'requirements.txt');

  // Step 1: Create distLambda directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    info('Creating distLambda directory...');
    fs.mkdirSync(distDir);
  }

  const prevDistFiles = globSync(distDir.replace(/\\/g, '/') + '/*');
  await rmSafe(...prevDistFiles);

  const activeVenv = getActiveVenv();
  if (!activeVenv || path.resolve(activeVenv) !== path.resolve(venvDir)) {
    warn(
      'No virtual environment is active. `requirements.txt` will not be updated.'
    );
  } else {
    info(`Virtual environment ${activeVenv} is active and maps to lambda_env.`);

    // Step 3: Export a fresh requirements.txt from the currently active virtual environment
    info('Exporting a fresh requirements.txt...');
    exec(`python -m pip freeze > ${requirementsFile}`);
  }

  exec(
    'docker build -t python-lambda-build --file=Dockerfile --platform=linux/amd64 .'
  );
  exec(
    'docker run --name=python-lambda-build --platform=linux/amd64 -d python-lambda-build'
  );

  // Wait for the container to start and complete its task
  // exec('sleep 5'); // Adjust the sleep duration as needed

  exec('docker cp python-lambda-build:/source.zip .');
  exec('docker stop python-lambda-build');
  exec('docker rm python-lambda-build');

  await unzip({
    file: 'source.zip',
    targetDirectory: distDir,
  });

  // Clean out excluded packages
  const deployConfig = JSON.parse(read(path.join(lambdaDir, 'deploy.json')));
  for (const excludedPackage of deployConfig.excludePackages) {
    const pattern =
      distDir.replace(/\\/g, '/') + '/site-packages/' + excludedPackage;
    debug(`Searching for excluded package using pattern: ${pattern}`);
    const toDelete = globSync(pattern);
    if (toDelete.length > 0) {
      debug(
        `Deleting excluded package ${excludedPackage} in ${toDelete.join(', ')}`
      );
      await rmSafe(...toDelete);
    }
  }
}

async function packageLambdaOld() {
  const currentDir = process.cwd();
  if (path.basename(currentDir) !== 'lambda') {
    throw new Error('Script expects to be run from lambda/ directory');
  }

  const projectDir = path.dirname(currentDir);
  const lambdaDir = path.join(projectDir, 'lambda');
  const venvDir = path.join(lambdaDir, 'lambda_env');
  const distDir = path.join(projectDir, 'distLambda'); // Destination folder
  const targetZip = path.join(projectDir, 'lambda.zip');
  const lambdaFunctionFile = path.join(lambdaDir, 'lambda.py');
  const requirementsFile = path.join(lambdaDir, 'requirements.txt');

  // Step 1: Create distLambda directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    info('Creating distLambda directory...');
    fs.mkdirSync(distDir);
  }

  const prevDistFiles = globSync(distDir.replace(/\\/g, '/') + '/*');
  await rmSafe(...prevDistFiles);

  // Step 2: Check if the virtual environment is already activated and mapped to lambda_env
  const activeVenv = getActiveVenv();
  if (!activeVenv || path.resolve(activeVenv) !== path.resolve(venvDir)) {
    throw new Error(
      `No virtual environment is activated or it doesn't map to ${venvDir}. Please activate the correct virtual environment.`
    );
  }

  info(`Virtual environment ${activeVenv} is active and maps to lambda_env.`);

  // Step 3: Export a fresh requirements.txt from the currently active virtual environment
  info('Exporting a fresh requirements.txt...');
  exec(`python -m pip freeze > ${requirementsFile}`);

  // Step 4: Determine site-packages directory in a platform-independent way
  const sitePackagesDir = await getSitePackagesDir();

  if (!fs.existsSync(sitePackagesDir)) {
    throw new Error(`Site-packages directory not found in: ${sitePackagesDir}`);
  }

  // Step 5: Copy dependencies and lambda function to distLambda directory
  info('Copying dependencies and lambda function to distLambda...');
  cp('-rf', path.join(sitePackagesDir), distDir);
  cp('-f', lambdaFunctionFile, path.join(distDir, 'lambda.py'));

  // Clean out excluded packages
  const deployConfig = JSON.parse(read(path.join(lambdaDir, 'deploy.json')));
  for (const excludedPackage of deployConfig.excludePackages) {
    const pattern =
      distDir.replace(/\\/g, '/') + '/site-packages/' + excludedPackage;
    debug(`Searching for excluded package using pattern: ${pattern}`);
    const toDelete = globSync(pattern);
    if (toDelete.length > 0) {
      debug(
        `Deleting excluded package ${excludedPackage} in ${toDelete.join(', ')}`
      );
      await rmSafe(...toDelete);
    }
  }

  // Step 6: Zip the distLambda directory

  // Not necessary, done by library

  // info('Zipping distLambda contents...');
  // await zip({ directory: distDir, target: targetZip });

  info(`Lambda package created successfully at: ${targetZip}`);
}

packageLambda()
  .then(() => {
    info('Packaging complete.');
  })
  .catch((error) => {
    console.error('Error during packaging:', error);
  });
