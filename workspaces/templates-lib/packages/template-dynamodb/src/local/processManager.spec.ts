import { spawn } from 'child_process';
import { terminateProcess } from './processManager';

jest.setTimeout(30000);

describe('terminateProcess', () => {
  it('resolves when the target process has already exited', async () => {
    const child = spawn(process.execPath, ['-e', 'process.exit(0)'], { stdio: 'ignore' });
    const processId = child.pid;
    expect(processId).toBeDefined();

    await new Promise<void>((resolve) => {
      child.on('exit', () => resolve());
    });

    await expect(terminateProcess(processId as number)).resolves.toBeUndefined();
  });
});
