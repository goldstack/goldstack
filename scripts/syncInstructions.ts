import { execSync, spawnSync } from 'child_process';

function isVendirInstalled(): boolean {
  try {
    execSync('command -v vendir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function runVendirSync(): boolean {
  if (!isVendirInstalled()) {
    console.warn(
      '\n⚠ vendir is not installed. Skipping remote instruction sync.\n' +
        '  Install vendir to pull the latest goldstack instructions:\n' +
        '  https://carvel.dev/vendir/docs/latest/install/\n',
    );
    return false;
  }

  console.log('Running vendir sync...');
  const result = spawnSync('vendir', ['sync'], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.warn('vendir sync failed, continuing with local instructions...');
    return false;
  }
  return true;
}

function runMarkdownMagic(): void {
  console.log('Running markdown-magic...');
  const result = spawnSync('md-magic', ['--file', 'AGENTS.md'], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error('markdown-magic failed');
  }
}

runVendirSync();
runMarkdownMagic();
