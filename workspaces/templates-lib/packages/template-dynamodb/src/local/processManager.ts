import { debug, error, warn } from '@goldstack/utils-log';
import { execAsync } from '@goldstack/utils-sh';
import { spawnSync } from 'child_process';

/**
 * Handles process termination for both Windows and Unix systems
 */
export async function terminateProcess(processId: number): Promise<void> {
  if (process.platform === 'win32') {
    await terminateWindowsProcess(processId);
  } else {
    await terminateUnixProcess(processId);
  }
}

async function terminateWindowsProcess(processId: number): Promise<void> {
  const isProcessNotFound = (stderr: string | Buffer | null): boolean =>
    stderr?.toString().toLowerCase().includes('could not be found') || false;

  // Try graceful termination first
  const result = spawnSync('taskkill', ['/pid', processId.toString(), '/t']);
  if (result.status !== 0 && !isProcessNotFound(result.stderr)) {
    warn(`Failed to terminate process ${processId} gracefully: ${result.stderr}`);
  }

  // Give it some time before force kill
  await new Promise<void>((resolve) => setTimeout(resolve, 5000));

  // Force kill
  const forceResult = spawnSync('taskkill', ['/pid', processId.toString(), '/f', '/t']);
  if (forceResult.status !== 0) {
    if (isProcessNotFound(forceResult.stderr)) {
      debug(`Process ${processId} does not exist, skipping termination`);
      return;
    }
    error(`Failed to force kill process ${processId}: ${forceResult.stderr}`);
    throw new Error(`Failed to terminate process ${processId}`);
  }
}

async function terminateUnixProcess(processId: number): Promise<void> {
  // Try graceful termination first
  try {
    process.kill(processId, 'SIGTERM');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ESRCH') {
      debug(`Process ${processId} does not exist, skipping termination`);
      return;
    }
    throw e;
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 5000));

  // Check if process still exists
  try {
    process.kill(processId, 0); // Signal 0 is used to check existence
    // Process still exists, try force kill
    process.kill(processId, 'SIGKILL');

    // Wait and verify process is gone
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    try {
      process.kill(processId, 0);
      error(`Failed to terminate process ${processId} after SIGKILL`);
      throw new Error(`Process ${processId} could not be terminated`);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ESRCH') {
        debug(`Process ${processId} successfully terminated`);
      } else {
        throw e;
      }
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ESRCH') {
      debug(`Process ${processId} terminated gracefully`);
    } else {
      throw e;
    }
  }
}

/**
 * Stops a Docker container by its ID
 */
export async function stopContainer(containerId: string): Promise<void> {
  await execAsync(`docker stop ${containerId}`);
}
