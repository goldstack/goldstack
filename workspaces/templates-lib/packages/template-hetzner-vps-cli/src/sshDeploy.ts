import { logger } from '@goldstack/utils-cli';
import { exec, zip } from '@goldstack/utils-sh';
import { existsSync } from 'fs';
import { stat } from 'fs/promises';

// Helper function to execute commands remotely via SSH
const sshExec = (host: string, command: string): string => {
  const sshCmd = `ssh  -o StrictHostKeyChecking=no ${host} "${command}"`;
  return exec(sshCmd);
};

// Helper function to upload files via SCP
const scpUpload = (
  localPath: string,
  remotePath: string,
  host: string
): string => {
  const scpCmd = `scp  -o StrictHostKeyChecking=no ${localPath} ${host}:${remotePath}`;
  return exec(scpCmd);
};

// Method to create the zip file
const createZip = async (sourceDir: string, outputZip: string) => {
  logger().info(`Creating zip from ${sourceDir}...`);
  await zip({
    directory: sourceDir,
    target: outputZip,
  });

  // Get the size of the zip file
  const stats = await stat(outputZip);
  const fileSizeInBytes = stats.size;
  const fileSizeInMegabytes = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

  logger().info(`Zip file size: ${fileSizeInMegabytes} MB`);
};

// Deploy function
export const sshDeploy = async (host: string) => {
  const localDir = 'server/';
  const zipPath = 'dist/server.zip';
  const credentialsPath = 'dist/credentials/credentials.json';

  try {
    // Step 1: Create the zip file
    await createZip(localDir, zipPath);
    const remoteCredentialsPath = '/home/goldstack/credentials.json';

    // Step 2: Upload the zip file via SCP
    logger().info('Uploading zip file...');
    scpUpload(zipPath, '/home/goldstack', host);

    // Step 3: Upload credentials if they exist
    if (existsSync(credentialsPath)) {
      logger().info('Uploading credentials...');
      scpUpload(credentialsPath, remoteCredentialsPath, host);
    }

    // Step 4: Run deploy.sh to stop the app, unzip the file, unpack secrets, and start the app
    logger().info('Running deploy.sh...');
    sshExec(host, 'bash /home/goldstack/deploy.sh');

    logger().info('Deployment completed successfully.');
  } catch (error) {
    logger().error(`Error during deployment: ${error}`);
    throw error;
  }
};
