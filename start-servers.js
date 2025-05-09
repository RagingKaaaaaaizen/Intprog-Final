const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Determine if we're on Windows
const isWindows = os.platform() === 'win32';

console.log('Starting API and Frontend servers...');

// Function to create a server process
function startServer(name, cwd, command, args) {
  console.log(`Starting ${name} server...`);
  
  const serverProcess = spawn(
    isWindows && command === 'npm' ? 'npm.cmd' : command,
    args,
    {
      cwd: path.join(__dirname, cwd),
      stdio: 'pipe',
      shell: true
    }
  );

  serverProcess.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[${name} ERROR] ${data.toString().trim()}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`${name} server exited with code ${code}`);
  });

  return serverProcess;
}

// Start backend API server
const backendServer = startServer('Backend API', 'backend', 'npm', ['start']);

// Start frontend server
const frontendServer = startServer('Frontend', 'frontend', 'npm', ['start']);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  backendServer.kill();
  frontendServer.kill();
  process.exit(0);
}); 