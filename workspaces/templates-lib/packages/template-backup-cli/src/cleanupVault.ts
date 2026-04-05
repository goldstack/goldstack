import { readDeploymentState } from '@goldstack/infra';
import {
  BackupClient,
  DeleteRecoveryPointCommand,
  ListBackupJobsCommand,
  ListBackupJobsCommandOutput,
  ListRecoveryPointsByBackupVaultCommand,
  ListRecoveryPointsByBackupVaultCommandOutput,
  StopBackupJobCommand,
} from '@aws-sdk/client-backup';
import {
  readDeploymentFromPackageConfig,
  getAWSUser,
  type AWSDeployment,
} from '@goldstack/infra-aws';
import { fatal, info, warn } from '@goldstack/utils-log';
import child_process, { type SpawnSyncOptionsWithStringEncoding } from 'child_process';
import os from 'os';

export interface CleanupVaultParams {
  deploymentName: string;
  confirm?: boolean;
}

const prompt = (message: string): string => {
  process.stdout.write(message);

  let cmd: string;
  let args: string[];
  if (os.platform() === 'win32') {
    cmd = 'cmd';
    args = ['/V:ON', '/C', 'set /p response= && echo !response!'];
  } else {
    cmd = 'bash';
    args = ['-c', 'read response; echo "$response"'];
  }

  const opts: SpawnSyncOptionsWithStringEncoding = {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: false,
    encoding: 'utf-8',
  };

  return child_process.spawnSync(cmd, args, opts).stdout.toString().trim();
};

export const cleanupVault = async (params: CleanupVaultParams): Promise<void> => {
  const { deploymentName, confirm } = params;

  const deployment = readDeploymentFromPackageConfig({
    deploymentName,
  }) as AWSDeployment;

  const awsRegion = deployment.awsRegion;
  const awsUserName = deployment.awsUser;

  const deploymentState = readDeploymentState('./', deploymentName, {
    createIfNotExist: false,
  });

  const backupPlanId = deploymentState.terraform?.backup_plan_id?.value as string | undefined;
  const backupVaultName =
    (deploymentState.terraform?.backup_vault_name?.value as string | undefined) || 'GoldstackLocal';

  if (!backupPlanId) {
    warn(
      `No backup plan ID found for deployment '${deploymentName}'. Backup plan may already be deleted.`,
    );
  }

  if (!confirm) {
    const response = prompt(
      `This will stop all active backup jobs and delete all recovery points for '${deploymentName}'.\n` +
        `Backup Vault: ${backupVaultName}\n` +
        `Backup Plan ID: ${backupPlanId || 'N/A'} (will be deleted by terraform destroy)\n\n` +
        `Type 'y' to confirm: `,
    );
    if (response !== 'y') {
      fatal('Cleanup cancelled');
    }
  }

  const awsUser = await getAWSUser(awsUserName);
  const credentials = await awsUser();

  const client = new BackupClient({
    region: awsRegion,
    credentials: credentials,
  });

  info(`Stopping all RUNNING backup jobs in vault: ${backupVaultName}`);
  let runningJobs: any[] = [];
  try {
    const response: ListBackupJobsCommandOutput = await client.send(
      new ListBackupJobsCommand({
        ByBackupVaultName: backupVaultName,
        ByState: 'RUNNING',
        MaxResults: 100,
      }),
    );
    runningJobs = response.BackupJobs || [];
  } catch (err) {
    warn(`Failed to list running backup jobs: ${err}`);
  }

  if (runningJobs.length > 0) {
    info(`Found ${runningJobs.length} RUNNING backup jobs, stopping them...`);
    for (const job of runningJobs) {
      try {
        await client.send(
          new StopBackupJobCommand({
            BackupJobId: job.BackupJobId,
          }),
        );
        info(`Stopped backup job: ${job.BackupJobId}`);
      } catch (err) {
        warn(`Failed to stop backup job ${job.BackupJobId}: ${err}`);
      }
    }
  } else {
    info('No RUNNING backup jobs found');
  }

  info(`Deleting all recovery points in vault: ${backupVaultName}`);
  let recoveryPoints: any[] = [];
  let nextToken: string | undefined;

  do {
    try {
      const response: ListRecoveryPointsByBackupVaultCommandOutput = await client.send(
        new ListRecoveryPointsByBackupVaultCommand({
          BackupVaultName: backupVaultName,
          MaxResults: 100,
          NextToken: nextToken,
        }),
      );
      recoveryPoints = recoveryPoints.concat(response.RecoveryPoints || []);
      nextToken = response.NextToken;
    } catch (err) {
      warn(`Failed to list recovery points: ${err}`);
      break;
    }
  } while (nextToken);

  if (recoveryPoints.length > 0) {
    info(`Found ${recoveryPoints.length} recovery points, deleting them...`);
    for (const rp of recoveryPoints) {
      try {
        await client.send(
          new DeleteRecoveryPointCommand({
            RecoveryPointArn: rp.RecoveryPointArn,
            BackupVaultName: backupVaultName,
          }),
        );
        info(`Deleted recovery point: ${rp.RecoveryPointArn}`);
      } catch (err) {
        warn(`Failed to delete recovery point ${rp.RecoveryPointArn}: ${err}`);
      }
    }
  } else {
    info('No recovery points found');
  }

  info(
    'Vault cleanup completed. You can now run "yarn infra destroy" to delete the remaining infrastructure.',
  );
};
