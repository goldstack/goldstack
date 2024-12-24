/* eslint-disable @typescript-eslint/no-var-requires */
const chokidar = require('chokidar');
const { spawn } = require('child_process');
const path = require('path');

let childProcess;

// Initialize watcher
const watcher = chokidar.watch(['src/**/*', 'scripts/**/*'], {
  ignored: [/node_modules/, /\.git/, /dist/, /\.swc/],
  persistent: true,
  ignoreInitial: true,
});

function restartScript() {
  if (childProcess) {
    childProcess.kill();
  }

  console.log('\nRestarting server...');

  childProcess = spawn(
    'yarn node -r @swc-node/register -r ./scripts/register.js ./scripts/start.ts',
    {
      shell: true,
      stdio: 'inherit',
      env: process.env,
    }
  );

  childProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
  });

  childProcess.on('exit', (code, signal) => {
    if (code !== null) {
      console.log(`Process exited with code ${code}`);
    } else if (signal !== null) {
      console.log(`Process killed with signal ${signal}`);
    }
  });
}

// Watch for file changes
watcher.on('change', (file) => {
  console.log(`\nFile changed: ${path.relative(process.cwd(), file)}`);
  restartScript();
});

// Handle process termination
process.on('SIGINT', () => {
  if (childProcess) {
    childProcess.kill();
  }
  process.exit(0);
});

// Initial script run
console.log('Starting server...');
restartScript();
