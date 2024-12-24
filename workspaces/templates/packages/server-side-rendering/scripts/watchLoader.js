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
    .get(process.env.KILL_URL, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        console.log('Received kill signal:', data);
      });
    })
    .on('error', (error) => {
      console.error('Error making kill request:', error);
    });
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
