/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const fs = require('fs');
const treeKill = require('tree-kill');
const { promisify } = require('util');

let childProcess;
let killPort = undefined;
const treeKillAsync = promisify(treeKill);

// Find an available port
async function getAvailablePort(startPort = 3100) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => {
      resolve(getAvailablePort(startPort + 1));
    });
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });
}

async function startServer() {
  const port = await getAvailablePort();
  killPort = port;

  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/restart') {
      try {
        console.info('\nReceived restart signal');
        restartScript();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'restarting' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(port, () => {
    console.info(`Watcher server listening on port ${port}`);
  });

  return port;
}

async function killProcess(proc) {
  if (!proc) return;

  console.log('\nStopping current server...');

  try {
    // Try graceful shutdown first
    await treeKillAsync(proc.pid);
  } catch (err) {
    console.log('Error during graceful shutdown, force killing...');
    try {
      // Force kill if graceful shutdown fails
      await treeKillAsync(proc.pid, 'SIGKILL');
    } catch (err) {
      console.log('Error force killing process:', err);
    }
  }

  // Wait for the process to fully exit
  await new Promise((resolve) => {
    if (!proc.connected && proc.exitCode !== null) {
      resolve();
      return;
    }
    proc.once('exit', () => resolve());
  });
}

async function restartScript() {
  await killProcess(childProcess);

  console.info('\nStarting server...');

  process.env.KILL_URL = `http://localhost:${killPort}/restart`;

  let pnpJsPath = './../../.pnp.cjs';
  if (!fs.existsSync(pnpJsPath)) {
    pnpJsPath = './../../../../.pnp.cjs';
  }

  childProcess = spawn(
    `node --require ${pnpJsPath} -r @swc-node/register -r ./scripts/register.js -r ./scripts/watchLoader.js ./scripts/start.ts`,
    {
      shell: true,
      stdio: 'inherit',
      env: process.env,
    }
  );

  childProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
  });
}

// Initial setup
console.log('Starting watcher and server...');
startServer().then(async () => {
  console.log('Starting application...');
  await restartScript();
});
