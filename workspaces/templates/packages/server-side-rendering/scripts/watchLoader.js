/* eslint-disable @typescript-eslint/no-var-requires */
const chokidar = require('chokidar');
const Module = require('module');
const http = require('http');

// Keep track of watched files
const watchedFiles = new Set();
const watcher = chokidar.watch([], {
  ignored: /node_modules|\.git|\.yarn/,
  persistent: true,
});

function restartScript() {
  http
    .get(process.env.KILL_URL, () => {
      // noop
    })
    .on('error', (error) => {
      console.error('Error making kill request:', error);
    });
}

// Watch for file changes
watcher.on('change', (file) => {
  console.info(`File changed: ${file}`);
  restartScript();
});

// Override the default `require`
const originalRequire = Module.prototype.require;

Module.prototype.require = function (filePath) {
  setTimeout(() => {
    const resolvedPath = Module._resolveFilename(filePath, this);
    if (
      // resolvedPath !== filePath &&
      !/node_modules|\.git|\.yarn/.test(resolvedPath) &&
      /[.\/\\]/.test(resolvedPath) && // Check if the path contains at least one of ., \, or /
      !watchedFiles.has(resolvedPath)
    ) {
      watchedFiles.add(resolvedPath);
      watcher.add(resolvedPath);
      // console.log(`Watching file: ${resolvedPath}`);
    }
  }, 1000);
  return originalRequire.call(this, filePath);
};
