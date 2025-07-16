import { exec, rmSafe, globSync, read, unzip } from '@goldstack/utils-sh';
import { debug, info, warn } from '@goldstack/utils-log';
import * as path from 'path';
import * as fs from 'fs';

// Function to get the current virtual environment
function getActiveVenv(): string | null {
  const activeVenv = process.env.VIRTUAL_ENV || null;

  debug(`Active virtual environment: ${activeVenv}`);
  return activeVenv;
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
    warn('No virtual environment is active. `requirements.txt` will not be updated.');
  } else {
    info(`Virtual environment ${activeVenv} is active and maps to lambda_env.`);

    // Step 3: Export a fresh requirements.txt from the currently active virtual environment
    info('Exporting a fresh requirements.txt...');
    exec(`python -m pip freeze > ${requirementsFile}`);
  }

  exec('docker build -t python-lambda-build --file=Dockerfile --platform=linux/amd64 .');
  exec('docker create --name python-lambda-container python-lambda-build');

  if (fs.existsSync('source.zip')) {
    await rmSafe('source.zip');
  }
  exec('docker cp python-lambda-container:/source.zip ./source.zip');
  exec('docker rm python-lambda-container');

  await unzip({
    file: 'source.zip',
    targetDirectory: distDir,
  });

  // Clean out excluded packages
  const deployConfig = JSON.parse(read(path.join(lambdaDir, 'deploy.json')));
  for (const excludedPackage of deployConfig.excludePackages) {
    const pattern = distDir.replace(/\\/g, '/') + '/site-packages/' + excludedPackage;
    debug(`Searching for excluded package using pattern: ${pattern}`);
    const toDelete = globSync(pattern);
    if (toDelete.length > 0) {
      debug(`Deleting excluded package ${excludedPackage} in ${toDelete.join(', ')}`);
      await rmSafe(...toDelete);
    }
  }
}

packageLambda()
  .then(() => {
    info('Packaging complete.');
  })
  .catch((error) => {
    console.error('Error during packaging:', error);
  });
