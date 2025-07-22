// server.js - Enhanced Backend API server with real-time streaming
const express = require('express');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public')); // Serve the HTML file

// Store active processes and WebSocket connections
const activeProcesses = new Map();
const wsConnections = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    wsConnections.add(ws);
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString()
    }));
    
    ws.on('close', () => {
        console.log('WebSocket connection closed');
        wsConnections.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        wsConnections.delete(ws);
    });
});

// Broadcast message to all connected WebSocket clients
function broadcast(message) {
    const messageStr = JSON.stringify(message);
    wsConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(messageStr);
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                wsConnections.delete(ws);
            }
        }
    });
}

// Validate token address format
function isValidTokenAddress(address) {
    // Check if it's a valid Ethereum address (0x followed by 40 hex characters)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate numeric inputs
function isValidNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}

// Enhanced command validation
function validateCommand(command, args) {
    const errors = [];
    
    switch (command) {
        case 'volumeV2':
        case 'volumeV3':
            // Validate wallet indices
            if (args[0] && !isValidNumber(args[0], 0)) {
                errors.push('Start index must be a valid number >= 0');
            }
            if (args[1] && !isValidNumber(args[1], 1)) {
                errors.push('End index must be a valid number >= 1');
            }
            // Validate token address if provided
            if (args[2] && !isValidTokenAddress(args[2])) {
                errors.push('Token address must be a valid Ethereum address (0x...)');
            }
            // Validate timing parameters
            if (args[3] && !isValidNumber(args[3], 50, 60000)) {
                errors.push('TX delay must be between 50-60000 milliseconds');
            }
            if (args[4] && !isValidNumber(args[4], 1000, 300000)) {
                errors.push('Cycle delay must be between 1000-300000 milliseconds');
            }
            break;
            
        case 'create':
        case 'target':
            if (args[0] && !isValidNumber(args[0], 1, 50000)) {
                errors.push('Wallet count must be between 1-50000');
            }
            break;
            
        case 'swap':
        case 'multiswap':
        case 'swapv3':
        case 'multiswapV3':
            if (args[0] && !isValidNumber(args[0], 0)) {
                errors.push('Start index must be >= 0');
            }
            if (args[1] && !isValidNumber(args[1], 1)) {
                errors.push('End index must be >= 1');
            }
            if (args[2] && command !== 'multiswap' && command !== 'multiswapV3' && !isValidTokenAddress(args[2])) {
                errors.push('Token address must be a valid Ethereum address');
            }
            break;
            
        case 'deploy':
        case 'withdraw-token':
            if (!args[0] || !isValidTokenAddress(args[0])) {
                errors.push('Valid token address is required');
            }
            break;
    }
    
    return errors;
}

// Enhanced execute endpoint with real-time streaming
app.post('/api/execute', async (req, res) => {
    const { command, args = [] } = req.body;
    
    console.log(`Executing command: ${command} ${args.join(' ')}`);
    
    // Validate the command and arguments
    const validationErrors = validateCommand(command, args);
    if (validationErrors.length > 0) {
        return res.json({
            success: false,
            error: 'Validation failed: ' + validationErrors.join(', '),
            validationErrors
        });
    }
    
    // Generate unique process ID
    const processId = Date.now().toString();
    
    try {
        // Check if script.js exists
        const scriptPath = path.join(__dirname, 'script.js');
        if (!fs.existsSync(scriptPath)) {
            return res.json({
                success: false,
                error: 'script.js not found. Please run setup first.'
            });
        }
        
        // Spawn the Node.js process
        const childProcess = spawn('node', ['script.js', command, ...args], {
            cwd: __dirname,
            env: { ...process.env, FORCE_COLOR: '0' } // Disable ANSI color codes
        });
        
        // Store the process
        activeProcesses.set(processId, {
            process: childProcess,
            command: `${command} ${args.join(' ')}`,
            startTime: new Date(),
            output: '',
            errors: ''
        });
        
        let fullOutput = '';
        let hasError = false;
        let exitCode = null;
        
        // Handle stdout data
        childProcess.stdout.on('data', (data) => {
            const output = data.toString();
            fullOutput += output;
            
            // Broadcast real-time output to WebSocket clients
            broadcast({
                type: 'output',
                processId,
                data: output,
                timestamp: new Date().toISOString(),
                command: command
            });
            
            // Update stored process data
            if (activeProcesses.has(processId)) {
                activeProcesses.get(processId).output += output;
            }
        });
        
        // Handle stderr data
        childProcess.stderr.on('data', (data) => {
            const error = data.toString();
            fullOutput += error;
            hasError = true;
            
            // Broadcast error output to WebSocket clients
            broadcast({
                type: 'error',
                processId,
                data: error,
                timestamp: new Date().toISOString(),
                command: command
            });
            
            // Update stored process data
            if (activeProcesses.has(processId)) {
                activeProcesses.get(processId).errors += error;
            }
        });
        
        // Handle process completion
        childProcess.on('close', (code) => {
            exitCode = code;
            const success = code === 0 && !hasError;
            
            // Broadcast completion status
            broadcast({
                type: 'complete',
                processId,
                success,
                exitCode: code,
                timestamp: new Date().toISOString(),
                command: command
            });
            
            // Clean up process tracking
            activeProcesses.delete(processId);
            
            // Send final response
            res.json({
                success,
                output: fullOutput,
                error: success ? null : `Process exited with code ${code}`,
                exitCode: code,
                processId,
                command: `${command} ${args.join(' ')}`
            });
        });
        
        // Handle process errors
        childProcess.on('error', (error) => {
            console.error('Process error:', error);
            
            broadcast({
                type: 'process_error',
                processId,
                error: error.message,
                timestamp: new Date().toISOString(),
                command: command
            });
            
            activeProcesses.delete(processId);
            
            res.json({
                success: false,
                error: `Failed to start process: ${error.message}`,
                processId,
                command: `${command} ${args.join(' ')}`
            });
        });
        
        // Set timeout for long-running processes
        setTimeout(() => {
            if (activeProcesses.has(processId)) {
                console.log(`Process ${processId} still running after 5 minutes, continuing...`);
                
                broadcast({
                    type: 'long_running',
                    processId,
                    message: 'Process is still running (5+ minutes). This is normal for automation commands.',
                    timestamp: new Date().toISOString(),
                    command: command
                });
            }
        }, 300000); // 5 minutes
        
    } catch (error) {
        console.error('Execute error:', error);
        
        res.json({
            success: false,
            error: error.message,
            command: `${command} ${args.join(' ')}`
        });
    }
});

// Stop a specific process
app.post('/api/stop/:processId', (req, res) => {
    const processId = req.params.processId;
    
    if (activeProcesses.has(processId)) {
        const processInfo = activeProcesses.get(processId);
        
        try {
            processInfo.process.kill('SIGTERM');
            
            broadcast({
                type: 'stopped',
                processId,
                message: 'Process stopped by user',
                timestamp: new Date().toISOString(),
                command: processInfo.command
            });
            
            activeProcesses.delete(processId);
            
            res.json({ success: true, message: 'Process stopped' });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    } else {
        res.json({ success: false, error: 'Process not found' });
    }
});

// Stop all processes
app.post('/api/stop-all', (req, res) => {
    const stoppedProcesses = [];
    
    activeProcesses.forEach((processInfo, processId) => {
        try {
            processInfo.process.kill('SIGTERM');
            stoppedProcesses.push(processId);
        } catch (error) {
            console.error(`Error stopping process ${processId}:`, error);
        }
    });
    
    broadcast({
        type: 'all_stopped',
        message: `Stopped ${stoppedProcesses.length} process(es)`,
        timestamp: new Date().toISOString(),
        stoppedProcesses
    });
    
    activeProcesses.clear();
    
    res.json({ 
        success: true, 
        message: `Stopped ${stoppedProcesses.length} process(es)`,
        stoppedProcesses 
    });
});

// Get active processes
app.get('/api/processes', (req, res) => {
    const processes = Array.from(activeProcesses.entries()).map(([id, info]) => ({
        id,
        command: info.command,
        startTime: info.startTime,
        outputLength: info.output.length,
        errorLength: info.errors.length
    }));
    
    res.json({ processes });
});

// Get system status
app.get('/api/status', (req, res) => {
    const scriptExists = fs.existsSync(path.join(__dirname, 'script.js'));
    const envExists = fs.existsSync(path.join(__dirname, '.env'));
    
    res.json({
        scriptExists,
        envExists,
        activeProcesses: activeProcesses.size,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        connections: wsConnections.size
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    
    // Stop all active processes
    activeProcesses.forEach((processInfo, processId) => {
        try {
            processInfo.process.kill('SIGTERM');
        } catch (error) {
            console.error(`Error stopping process ${processId}:`, error);
        }
    });
    
    // Close WebSocket connections
    wsConnections.forEach(ws => {
        try {
            ws.close();
        } catch (error) {
            console.error('Error closing WebSocket:', error);
        }
    });
    
    server.close(() => {
        console.log('Server shut down gracefully');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 TurboBot Web GUI running on http://localhost:${PORT}`);
    console.log(`📊 WebSocket server ready for real-time updates`);
    console.log(`📁 Serving files from: ${__dirname}/public`);
});