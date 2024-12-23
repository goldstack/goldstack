/* eslint-disable @typescript-eslint/no-var-requires */
const chokidar = require('chokidar');
const Module = require('module');
const path = require('path');

// Keep track of watched files
const watchedFiles = new Set();
const watcher = chokidar.watch([], {
  ignored: /node_modules|\.git/,
  persistent: true,
});

// Restart logic
const { spawn } = require('child_process');
let childProcess;

function restartScript() {
  if (childProcess) {
    childProcess.kill();
  }
  console.log('Restarting script...');
  childProcess = spawn(
    'node -r @swc-node/register -r ./scripts/register.js',
    process.argv.slice(1),
    {
      stdio: 'inherit',
    }
  );
}

// Watch for file changes
watcher.on('change', (file) => {
  console.log(`File changed: ${file}`);
  restartScript();
});

// Override the default `require`
const originalRequire = Module.prototype.require;

Module.prototype.require = function (filePath) {
  const resolvedPath = Module._resolveFilename(filePath, this);
  if (!watchedFiles.has(resolvedPath)) {
    watchedFiles.add(resolvedPath);
    watcher.add(resolvedPath);
    console.log(`Watching file: ${resolvedPath}`);
  }
  return originalRequire.call(this, filePath);
};

// Initial script run
restartScript();
