import { zip, exec } from '@goldstack/utils-sh';
import { info } from '@goldstack/utils-log';
import * as path from 'path';
import * as fs from 'fs';

async function getSitePackagesDir(venvDir: string): Promise<string> {
  // Use 'pip show pip' to find the location of the installed libraries
  const pipShowResult = exec(`source ${venvDir}/bin/activate && pip show pip`);

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
  const currentDir = process.cwd(); // Use the directory where the script is run from
  const lambdaDir = path.join(currentDir, 'lambda');
  const venvDir = path.join(lambdaDir, 'lambda_env');
  const targetZip = path.join(currentDir, 'lambda.zip');
  const lambdaFunctionFile = path.join(lambdaDir, 'lambda.py');

  // Step 1: Create virtual environment
  if (!fs.existsSync(venvDir)) {
    info('Creating virtual environment...');
    exec(`python -m venv ${venvDir}`);
  } else {
    info('Virtual environment already exists.');
  }

  // Step 2: Activate virtual environment and install dependencies
  info('Installing dependencies in the virtual environment...');
  exec(
    `source ${venvDir}/bin/activate && pip install -r ${lambdaDir}/requirements.txt`
  );

  // Step 3: Determine site-packages directory in a platform-independent way
  const sitePackagesDir = await getSitePackagesDir(venvDir);

  if (!fs.existsSync(sitePackagesDir)) {
    throw new Error(`Site-packages directory not found in: ${sitePackagesDir}`);
  }

  // Step 4: Navigate to the site-packages directory and zip the dependencies
  info('Packaging dependencies into the zip file...');
  exec(`cd ${sitePackagesDir} && zip -r ${targetZip} .`);

  // Step 5: Add the lambda_function.py to the zip package
  if (fs.existsSync(lambdaFunctionFile)) {
    info(`Adding ${lambdaFunctionFile} to the zip package...`);
    exec(`zip -j ${targetZip} ${lambdaFunctionFile}`);
  } else {
    throw new Error(`Lambda function file not found: ${lambdaFunctionFile}`);
  }

  info(`Lambda package created successfully at: ${targetZip}`);
}

packageLambda()
  .then(() => {
    info('Packaging complete.');
  })
  .catch((error) => {
    console.error('Error during packaging:', error);
  });
