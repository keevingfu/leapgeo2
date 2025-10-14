#!/usr/bin/env node

/**
 * Frontend Health Check Script
 * Automatically verify the application can start and run without errors
 */

import { spawn } from 'child_process';
import http from 'http';
import { setTimeout } from 'timers/promises';

const CONFIG = {
  port: 5173,
  maxRetries: 5,
  retryDelay: 1000,
  startupTimeout: 30000,
  healthCheckPath: '/',
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

async function checkServerHealth(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: CONFIG.healthCheckPath,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      resolve({
        success: res.statusCode >= 200 && res.statusCode < 400,
        statusCode: res.statusCode,
      });
    });

    req.on('error', () => resolve({ success: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false });
    });
    req.end();
  });
}

async function waitForServer(port, maxWaitTime = CONFIG.startupTimeout) {
  const startTime = Date.now();
  let attempt = 0;

  while (Date.now() - startTime < maxWaitTime) {
    attempt++;
    log(`⏳ Attempt ${attempt}: Checking server at http://localhost:${port}...`, 'cyan');

    const result = await checkServerHealth(port);
    if (result.success) {
      log(`✅ Server is responding (Status: ${result.statusCode})`, 'green');
      return true;
    }

    await setTimeout(CONFIG.retryDelay);
  }

  return false;
}

async function runHealthCheck() {
  log('\n🏥 Starting Frontend Health Check...', 'blue');
  log('=' .repeat(60), 'blue');

  // Step 1: Check if port is available
  log('\n📍 Step 1: Checking available port...', 'yellow');
  const availablePort = await findAvailablePort(CONFIG.port);

  if (availablePort !== CONFIG.port) {
    log(`⚠️  Port ${CONFIG.port} is in use, will use port ${availablePort}`, 'yellow');
  } else {
    log(`✅ Port ${CONFIG.port} is available`, 'green');
  }

  // Step 2: Start development server
  log('\n🚀 Step 2: Starting development server...', 'yellow');

  let serverProcess;
  let serverStarted = false;
  let serverPort = null;
  let hasErrors = false;
  const errorMessages = [];

  try {
    serverProcess = spawn('npm', ['run', 'dev'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    // Capture stdout
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();

      // Detect server port
      const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
      if (portMatch) {
        serverPort = parseInt(portMatch[1]);
        log(`📡 Server detected on port ${serverPort}`, 'cyan');
        serverStarted = true;
      }

      // Check for errors
      if (output.includes('error') || output.includes('Error')) {
        hasErrors = true;
        errorMessages.push(output.trim());
      }
    });

    // Capture stderr
    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('ExperimentalWarning')) {
        hasErrors = true;
        errorMessages.push(error.trim());
      }
    });

    // Wait for server to start
    log('⏳ Waiting for server to start...', 'cyan');
    const maxWait = 30;
    for (let i = 0; i < maxWait; i++) {
      if (serverStarted && serverPort) break;
      await setTimeout(1000);
      process.stdout.write('.');
    }
    console.log('');

    if (!serverStarted || !serverPort) {
      throw new Error('Server failed to start within timeout period');
    }

    log(`✅ Server started successfully on port ${serverPort}`, 'green');

    // Step 3: Health check
    log('\n🔍 Step 3: Performing health check...', 'yellow');
    const isHealthy = await waitForServer(serverPort);

    if (!isHealthy) {
      throw new Error('Server is not responding to health checks');
    }

    // Step 4: Check for compilation errors
    log('\n📝 Step 4: Checking for errors...', 'yellow');
    await setTimeout(2000); // Wait a bit more for any delayed errors

    if (hasErrors && errorMessages.length > 0) {
      log('⚠️  Errors detected:', 'red');
      errorMessages.forEach(msg => {
        console.log(`   ${msg}`);
      });
      throw new Error('Compilation or runtime errors detected');
    }

    log('✅ No errors detected', 'green');

    // Step 5: Final report
    log('\n' + '='.repeat(60), 'blue');
    log('🎉 HEALTH CHECK PASSED', 'green');
    log('='.repeat(60), 'blue');
    log(`📍 Server URL: http://localhost:${serverPort}`, 'cyan');
    log(`✅ Status: Running without errors`, 'green');
    log(`⏱️  Startup time: ${((Date.now() - checkStartTime) / 1000).toFixed(2)}s`, 'cyan');
    log('='.repeat(60) + '\n', 'blue');

    return { success: true, port: serverPort };

  } catch (error) {
    log('\n' + '='.repeat(60), 'red');
    log('❌ HEALTH CHECK FAILED', 'red');
    log('='.repeat(60), 'red');
    log(`Error: ${error.message}`, 'red');

    if (errorMessages.length > 0) {
      log('\nError details:', 'red');
      errorMessages.forEach(msg => {
        console.log(`   ${msg}`);
      });
    }

    log('='.repeat(60) + '\n', 'red');
    return { success: false, error: error.message };

  } finally {
    // Cleanup: Kill the server process
    if (serverProcess) {
      log('🧹 Cleaning up: Stopping development server...', 'yellow');
      serverProcess.kill('SIGTERM');

      // Force kill after 3 seconds if still running
      await setTimeout(3000);
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
      log('✅ Server stopped', 'green');
    }
  }
}

// Run the health check
const checkStartTime = Date.now();
runHealthCheck()
  .then((result) => {
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
