#!/usr/bin/env node

/**
 * NextVibe Monitor CLI
 * A comprehensive monitoring tool for the Next.js development server
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MONITOR_LOG = path.join(__dirname, '..', 'logs', 'server-monitor.log');

// Colors for terminal output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkServerHealth() {
    return new Promise((resolve) => {
        exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', (error, stdout) => {
            resolve(error ? '000' : stdout.trim());
        });
    });
}

function getPM2Status() {
    try {
        const output = execSync('pm2 jlist', { encoding: 'utf8' });
        const processes = JSON.parse(output);
        const nextvibeProcess = processes.find(p => p.name === 'nextvibe-dev');
        return nextvibeProcess ? nextvibeProcess.pm2_env.status : 'not found';
    } catch (error) {
        return 'error';
    }
}

async function showStatus() {
    log('\n🚀 NextVibe Server Status', 'cyan');
    log('═'.repeat(30), 'cyan');

    // PM2 Status
    const pm2Status = getPM2Status();
    const pm2Color = pm2Status === 'online' ? 'green' : 'red';
    log(`PM2 Process: ${pm2Color === 'green' ? '●' : '●'} ${pm2Status}`, pm2Color);

    // Port Status
    try {
        execSync('lsof -i :3000', { stdio: 'pipe' });
        log('Port 3000: ● Listening', 'green');
    } catch {
        log('Port 3000: ● Not listening', 'red');
    }

    // HTTP Status
    const httpStatus = await checkServerHealth();
    if (httpStatus === '200') {
        log(`HTTP Response: ● ${httpStatus} OK`, 'green');
    } else if (httpStatus === '000') {
        log('HTTP Response: ● Connection failed', 'red');
    } else {
        log(`HTTP Response: ● ${httpStatus}`, 'yellow');
    }

    // Resource usage
    try {
        const pm2Output = execSync('pm2 jlist', { encoding: 'utf8' });
        const processes = JSON.parse(pm2Output);
        const nextvibeProcess = processes.find(p => p.name === 'nextvibe-dev');

        if (nextvibeProcess) {
            const cpu = nextvibeProcess.monit.cpu;
            const memory = Math.round(nextvibeProcess.monit.memory / 1024 / 1024);
            const restarts = nextvibeProcess.pm2_env.restart_time;
            log(`\n📊 Resources: ${cpu}% CPU, ${memory}MB RAM, ${restarts} restarts`, 'blue');
        }
    } catch (error) {
        log('\n📊 Resources: Unable to fetch', 'yellow');
    }
}

async function startServer() {
    log('🚀 Starting NextVibe development server...', 'yellow');

    try {
        execSync('pm2 delete nextvibe-dev', { stdio: 'pipe' });
    } catch {
        // Process doesn't exist, that's fine
    }

    exec('pm2 start "npm run dev -- -p 3000" --name "nextvibe-dev"', (error) => {
        if (error) {
            log('❌ Failed to start server', 'red');
            return;
        }

        log('✅ Server started successfully!', 'green');
        log('📊 Monitoring on port 3000', 'blue');
    });
}

function stopServer() {
    log('🛑 Stopping NextVibe server...', 'yellow');

    try {
        execSync('pm2 delete nextvibe-dev', { stdio: 'pipe' });
        log('✅ Server stopped successfully!', 'green');
    } catch (error) {
        log('❌ Failed to stop server', 'red');
    }
}

function showLogs(lines = 20) {
    log(`📝 Last ${lines} log entries:`, 'blue');
    log('─'.repeat(50), 'blue');

    try {
        execSync(`pm2 logs nextvibe-dev --lines ${lines}`, { stdio: 'inherit' });
    } catch {
        log('No logs available', 'yellow');
    }
}

function showErrors(lines = 20) {
    log(`❌ Last ${lines} error entries:`, 'red');
    log('─'.repeat(50), 'red');

    try {
        execSync(`pm2 logs nextvibe-dev --err --lines ${lines}`, { stdio: 'inherit' });
    } catch {
        log('No error logs available', 'yellow');
    }
}

async function monitorHealth() {
    log('🔍 Starting health monitoring...', 'cyan');
    log('Press Ctrl+C to stop', 'yellow');

    const checkInterval = 5000; // 5 seconds

    const monitor = async () => {
        const httpStatus = await checkServerHealth();
        const pm2Status = getPM2Status();
        const timestamp = new Date().toLocaleTimeString();

        if (httpStatus === '200' && pm2Status === 'online') {
            log(`[${timestamp}] ✅ Server healthy`, 'green');
        } else {
            log(`[${timestamp}] ❌ Server issues detected`, 'red');
            if (pm2Status !== 'online') {
                log(`  PM2 Status: ${pm2Status}`, 'red');
            }
            if (httpStatus !== '200') {
                log(`  HTTP Status: ${httpStatus}`, 'red');
            }
        }
    };

    // Initial check
    await monitor();

    // Continuous monitoring
    const interval = setInterval(monitor, checkInterval);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
        log('\n🛑 Monitoring stopped', 'yellow');
        clearInterval(interval);
        process.exit(0);
    });
}

// Main CLI logic
const command = process.argv[2];
const subCommand = process.argv[3];

switch (command) {
    case 'start':
    case 'up':
        startServer();
        break;

    case 'stop':
    case 'down':
        stopServer();
        break;

    case 'status':
        showStatus();
        break;

    case 'logs':
        if (subCommand === 'error' || subCommand === 'errors') {
            showErrors();
        } else {
            showLogs(subCommand ? parseInt(subCommand) : 20);
        }
        break;

    case 'monitor':
    case 'watch':
        monitorHealth();
        break;

    case 'restart':
        stopServer();
        setTimeout(() => startServer(), 2000);
        break;

    case 'help':
    default:
        log('\n🎯 NextVibe Monitor CLI', 'cyan');
        log('Usage: node scripts/monitor-cli.js <command>', 'yellow');
        log('');
        log('Commands:', 'bright');
        log('  start/up     Start the development server');
        log('  stop/down    Stop the development server');
        log('  status       Show server status and resources');
        log('  logs [n]     Show last n log entries (default: 20)');
        log('  logs errors  Show only error logs');
        log('  monitor      Continuously monitor server health');
        log('  restart      Restart the development server');
        log('  help         Show this help message');
        log('');
        log('Examples:', 'blue');
        log('  node scripts/monitor-cli.js start');
        log('  node scripts/monitor-cli.js logs 50');
        log('  node scripts/monitor-cli.js monitor');
        log('');
        break;
}

// Export functions for use in other scripts
module.exports = {
    checkServerHealth,
    getPM2Status,
    showStatus,
    startServer,
    stopServer
};
