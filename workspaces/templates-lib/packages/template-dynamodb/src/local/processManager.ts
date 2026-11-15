import { debug, warn } from '@goldstack/utils-log';
import { execAsync } from '@goldstack/utils-sh';
import { spawnSync } from 'child_process';

/**
 * Handles process termination for both Windows and Unix systems.
 *
 * Process termination is best-effort: this function logs a warning instead of
 * throwing, so that a process that has already exited (or cannot be terminated)
 * does not fail an otherwise successful run.
 */
export async function terminateProcess(processId: number): Promise<void> {
  try {
    if (process.platform === 'win32') {
      await terminateWindowsProcess(processId);
    } else {
      await terminateUnixProcess(processId);
    }
  } catch (e) {
    warn(`Unexpected error while terminating process ${processId}`, {
      processId,
      error: e,
      message: (e as Error).message,
    });
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
    warn(`Failed to force kill process ${processId}: ${forceResult.stderr}`, {
      processId,
      stderr: forceResult.stderr?.toString(),
    });
    return;
  }
}

async function terminateUnixProcess(processId: number): Promise<void> {
  const isESRCH = (e: unknown): boolean => (e as NodeJS.ErrnoException).code === 'ESRCH';

  // Try graceful termination first
  try {
    process.kill(processId, 'SIGTERM');
  } catch (e) {
    if (isESRCH(e)) {
      debug(`Process ${processId} does not exist, skipping termination`);
      return; // Already stopped
    }
    warn(`Failed to send SIGTERM to process ${processId}`, {
      processId,
      message: (e as Error).message,
      code: (e as NodeJS.ErrnoException).code,
    });
    return;
  }

  // Wait for graceful termination
  await new Promise<void>((resolve) => setTimeout(resolve, 5000));

  // Check if process is still running
  try {
    process.kill(processId, 0); // Throws ESRCH if not running
  } catch (e) {
    if (isESRCH(e)) {
      debug(`Process ${processId} terminated gracefully`);
      return; // Stopped gracefully
    }
    warn(`Failed to check whether process ${processId} is still running`, {
      processId,
      message: (e as Error).message,
      code: (e as NodeJS.ErrnoException).code,
    });
    return;
  }

  // Process still exists, try force kill
  debug(`Process ${processId} did not terminate gracefully, attempting SIGKILL.`);
  try {
    process.kill(processId, 'SIGKILL');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ESRCH') {
      debug(`Process ${processId} terminated before SIGKILL could be sent.`);
      return; // Stopped before force kill
    }
    warn(`Failed to send SIGKILL to process ${processId}`, {
      processId,
      message: (e as Error).message,
      code: (e as NodeJS.ErrnoException).code,
    });
    return;
  }

  // Wait for force kill to take effect
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  // Verify process is gone
  try {
    process.kill(processId, 0);
    // If we get here, process is still alive
    warn(`Process ${processId} is still running after SIGKILL`, { processId });
    return;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ESRCH') {
      debug(`Process ${processId} successfully terminated by SIGKILL`);
      return; // Stopped by force kill
    }
    warn(`Failed to verify termination of process ${processId}`, {
      processId,
      message: (e as Error).message,
      code: (e as NodeJS.ErrnoException).code,
    });
    return;
  }
}

/**
 * Stops a Docker container by its ID
 */
export async function stopContainer(containerId: string): Promise<void> {
  await execAsync(`docker stop ${containerId}`);
}
