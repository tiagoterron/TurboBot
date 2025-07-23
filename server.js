//V 1.0.8
const express = require('express');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { ethers } = require('ethers');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

const { 
    config,
    provider,
    addTokens,
    addSingleToken,
    loadTokens,
    saveTokens,
    getTokenByAddress,
    getTokensBySymbol,
    errorLog,
    sleep,
    log,
    saveWallets,
    randomIndex,
    loadWallets,
    createWallets,
    savePrivateKey,
    analyzeTransactionGas,
    analyzeGasPrice,
    getGasEstimates,
    contracts,
    routerAbi,
    airdropAbi,
    multicallAbi,
    turboDeployerAbi,
    volumeSwapAbi,
    ERC20_ABI,
    defaultTokens,
    LockyFiDeployerAbi,
    getContractAddress,
    createWalletsToTarget,
    checkWallets
} = require("./helper")

app.use(express.json());
app.use(express.static('public')); // Serve the HTML file

// Load environment variables for RPC connection
require('dotenv').config();

// Store active processes and WebSocket connections
const activeProcesses = new Map();
const wsConnections = new Set();

// Gas price cache to avoid excessive API calls
let gasPriceCache = {
    data: null,
    lastUpdate: 0,
    cacheTime: 30000 // 30 seconds cache
};

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

// Enhanced gas price calculation with real blockchain data
async function calculateGasPrices() {
    try {
        // Check cache first
        const now = Date.now();
        if (gasPriceCache.data && (now - gasPriceCache.lastUpdate) < gasPriceCache.cacheTime) {
            return gasPriceCache.data;
        }

        console.log('Fetching fresh gas price data...');

        // Initialize provider
        const rpcUrl = process.env.RPC_URL || "https://base-mainnet.g.alchemy.com/v2/your-api-key";
        let provider;
        
        try {
            provider = new ethers.providers.JsonRpcProvider(rpcUrl);
            
            // Test connection
            await provider.getNetwork();
        } catch (rpcError) {
            console.warn('RPC connection failed, using fallback provider');
            // Fallback to a public Base RPC
            provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
        }

        // Get current gas price from blockchain
        const currentGasPrice = await provider.getGasPrice();
        const currentGasPriceGwei = parseFloat(ethers.utils.formatUnits(currentGasPrice, 9));

        console.log(`Current gas price: ${currentGasPriceGwei} Gwei`);

        // Apply the same gas price logic as your script
        const minGasPrice = ethers.utils.parseUnits("0.001", 9); // 0.001 Gwei minimum
        let adjustedGasPrice = currentGasPrice.lt(minGasPrice) ? 
            minGasPrice.mul(5) : currentGasPrice.mul(120).div(100); // 5x minimum or 20% boost

        const adjustedGasPriceGwei = parseFloat(ethers.utils.formatUnits(adjustedGasPrice, 9));
        const recommendedGasPriceGwei = adjustedGasPriceGwei * 1.1; // 10% higher for recommended

        // Fetch ETH price from CoinGecko
        let ethPriceUSD = 0; // Fallback price
        
        try {
            const ethPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
                timeout: 5000
            });
            
            if (ethPriceResponse.ok) {
                const ethPriceData = await ethPriceResponse.json();
                ethPriceUSD = ethPriceData.ethereum.usd;
                console.log(`ETH price: $${ethPriceUSD}`);
            }
        } catch (priceError) {
            console.warn('Failed to fetch ETH price, using fallback:', priceError.message);
        }

        // Calculate costs for micro transactions
        // Standard ETH transfer: 21,000 gas
        // Smart contract swap: ~150,000-300,000 gas (we'll use 200,000 as average)
        
        const microTxGasLimit = 21000; // Simple ETH transfer
        const swapTxGasLimit = 200000; // Average for swaps
        
        // Calculate costs using adjusted gas price
        const microTxGasCostETH = (adjustedGasPriceGwei * microTxGasLimit) / 1e9; // Convert Gwei to ETH
        const microTxGasCostUSD = microTxGasCostETH * ethPriceUSD;
        
        const swapTxGasCostETH = (adjustedGasPriceGwei * swapTxGasLimit) / 1e9;
        const swapTxGasCostUSD = swapTxGasCostETH * ethPriceUSD;
        
        // Calculate for 1000 transactions
        const cost1000MicroTxUSD = microTxGasCostUSD * 1000;
        const cost1000SwapTxUSD = swapTxGasCostUSD * 1000;

        // Create result object
        const result = {
            timestamp: new Date().toISOString(),
            network: 'Base Mainnet',
            
            // Raw gas prices
            currentGasPriceGwei: currentGasPriceGwei,
            adjustedGasPriceGwei: adjustedGasPriceGwei,
            recommendedGasPriceGwei: recommendedGasPriceGwei,
            
            // ETH price
            ethPriceUSD: ethPriceUSD,
            
            // Micro transaction costs (21,000 gas)
            costPerMicroTxETH: microTxGasCostETH.toFixed(8),
            costPerMicroTxUSD: microTxGasCostUSD.toFixed(6),
            costPer1000MicroTxUSD: cost1000MicroTxUSD.toFixed(2),
            
            // Swap transaction costs (200,000 gas average)
            costPerSwapTxETH: swapTxGasCostETH.toFixed(8),
            costPerSwapTxUSD: swapTxGasCostUSD.toFixed(6),
            costPer1000SwapTxUSD: cost1000SwapTxUSD.toFixed(2),
            
            // For backward compatibility with frontend
            costPerTxUSD: microTxGasCostUSD.toFixed(6),
            costPer1000TxUSD: cost1000MicroTxUSD.toFixed(2),
            
            // Gas limits used
            microTxGasLimit: microTxGasLimit,
            swapTxGasLimit: swapTxGasLimit,
            
            // Network health indicators
            gasMultiplier: adjustedGasPriceGwei / currentGasPriceGwei,
            networkCongestion: currentGasPriceGwei > 2.0 ? 'High' : currentGasPriceGwei > 1.0 ? 'Medium' : 'Low'
        };

        // Update cache
        gasPriceCache.data = result;
        gasPriceCache.lastUpdate = now;

        console.log('Gas price calculation completed:', {
            gasPrice: `${adjustedGasPriceGwei.toFixed(3)} Gwei`,
            ethPrice: `$${ethPriceUSD}`,
            cost1000MicroTx: `$${cost1000MicroTxUSD.toFixed(2)}`,
            cost1000SwapTx: `$${cost1000SwapTxUSD.toFixed(2)}`
        });

        return result;

    } catch (error) {
        console.error('Error calculating gas prices:', error);
        
        // Return fallback data if calculation fails
        const fallbackData = {
            timestamp: new Date().toISOString(),
            network: 'Fallback Data',
            error: error.message,
            
            currentGasPriceGwei: 1.0,
            adjustedGasPriceGwei: 1.2,
            recommendedGasPriceGwei: 1.32,
            
            ethPriceUSD: 3500,
            
            costPerMicroTxETH: "0.0000252",
            costPerMicroTxUSD: "0.088200",
            costPer1000MicroTxUSD: "88.20",
            
            costPerSwapTxETH: "0.0024000",
            costPerSwapTxUSD: "8.400000",
            costPer1000SwapTxUSD: "8400.00",
            
            costPerTxUSD: "0.088200",
            costPer1000TxUSD: "88.20",
            
            microTxGasLimit: 21000,
            swapTxGasLimit: 200000,
            
            gasMultiplier: 1.2,
            networkCongestion: 'Unknown'
        };
        
        return fallbackData;
    }
}

// Gas prices API endpoint
app.get('/api/gas-prices', async (req, res) => {
    try {
        const gasData = await calculateGasPrices();

        
        res.json({
            success: true,
            ...gasData
        });
        
    } catch (error) {
        console.error('Gas prices API error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch gas prices',
            details: error.message
        });
    }
});

// Gas cost estimation for specific transaction types
app.post('/api/estimate-gas', async (req, res) => {
    try {
        const { transactionType = 'micro', quantity = 1 } = req.body;
        
        const gasData = await calculateGasPrices();
        
        let gasLimit, costPerTx, costPerTxUSD;
        
        switch (transactionType.toLowerCase()) {
            case 'micro':
            case 'transfer':
                gasLimit = gasData.microTxGasLimit;
                costPerTx = gasData.costPerMicroTxETH;
                costPerTxUSD = gasData.costPerMicroTxUSD;
                break;
                
            case 'swap':
            case 'uniswap':
                gasLimit = gasData.swapTxGasLimit;
                costPerTx = gasData.costPerSwapTxETH;
                costPerTxUSD = gasData.costPerSwapTxUSD;
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid transaction type. Use "micro" or "swap"'
                });
        }
        
        const totalCostETH = (parseFloat(costPerTx) * quantity).toFixed(8);
        const totalCostUSD = (parseFloat(costPerTxUSD) * quantity).toFixed(2);
        
        res.json({
            success: true,
            transactionType,
            quantity,
            gasPrice: gasData.adjustedGasPriceGwei,
            gasLimit,
            costPerTransaction: {
                eth: costPerTx,
                usd: costPerTxUSD
            },
            totalCost: {
                eth: totalCostETH,
                usd: totalCostUSD
            },
            networkInfo: {
                congestion: gasData.networkCongestion,
                ethPrice: gasData.ethPriceUSD,
                timestamp: gasData.timestamp
            }
        });
        
    } catch (error) {
        console.error('Gas estimation error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to estimate gas costs',
            details: error.message
        });
    }
});

// Validate token address format
function isValidTokenAddress(address) {
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
            if (args[0] && !isValidNumber(args[0], 0)) {
                errors.push('Start index must be a valid number >= 0');
            }
            if (args[1] && !isValidNumber(args[1], 1)) {
                errors.push('End index must be a valid number >= 1');
            }
            if (args[2] && !isValidTokenAddress(args[2])) {
                errors.push('Token address must be a valid Ethereum address (0x...)');
            }
            // if (args[4] && !isValidNumber(args[3], 50, 60000)) {
            //     errors.push('TX delay must be between 50-60000 milliseconds');
            // }
            // if (args[5] && !isValidNumber(args[4], 1000, 300000)) {
            //     errors.push('Cycle delay must be between 1000-300000 milliseconds');
            // }
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

// Add these API endpoints to your existing Express server

// ============================================================================
// WALLET MANAGEMENT APIs
// ============================================================================

// Get comprehensive wallet statistics
app.get('/api/wallets/stats', async (req, res) => {
    try {
        const wallets = loadWallets();
        
        if (wallets.length === 0) {
            return res.json({
                success: true,
                totalWallets: 0,
                wallets: [],
                mainWallet: null,
                summary: {
                    totalETH: "0",
                    avgBalance: "0",
                    fundedWallets: 0,
                    emptyWallets: 0
                }
            });
        }

        // Get main wallet info
        let mainWalletInfo = null;
        if (config.fundingPrivateKey) {
            try {
                const mainWallet = new ethers.Wallet(config.fundingPrivateKey, provider);
                const mainBalance = await provider.getBalance(mainWallet.address);
                
                mainWalletInfo = {
                    address: mainWallet.address,
                    balance: ethers.utils.formatEther(mainBalance),
                    balanceWei: mainBalance.toString()
                };
            } catch (error) {
                console.error('Error fetching main wallet:', error);
                mainWalletInfo = {
                    error: 'Failed to load main wallet',
                    details: error.message
                };
            }
        }

        // Sample first 5 wallets for balance checking (to avoid rate limiting)
        const sampleSize = Math.min(5, wallets.length);
        const sampleWallets = [];
        let totalETH = ethers.BigNumber.from(0);
        let fundedWallets = 0;
        
        for (let i = 0; i < sampleSize; i++) {
            try {
                const balance = await provider.getBalance(wallets[i][0]);
                const balanceETH = ethers.utils.formatEther(balance);
                
                sampleWallets.push({
                    index: i,
                    address: wallets[i][0],
                    balance: balanceETH,
                    balanceWei: balance.toString()
                });
                
                totalETH = totalETH.add(balance);
                if (balance.gt(0)) fundedWallets++;
                
                // Small delay to avoid rate limiting
                if (i < sampleSize - 1) await sleep(100);
                
            } catch (error) {
                console.error(`Error checking wallet ${i}:`, error);
                sampleWallets.push({
                    index: i,
                    address: wallets[i][0],
                    balance: "0",
                    balanceWei: "0",
                    error: error.message
                });
            }
        }

        const avgBalance = sampleSize > 0 ? 
            ethers.utils.formatEther(totalETH.div(sampleSize)) : "0";

        res.json({
            success: true,
            totalWallets: wallets.length,
            sampleSize: sampleSize,
            sampleWallets: sampleWallets,
            mainWallet: mainWalletInfo,
            summary: {
                totalETHSample: ethers.utils.formatEther(totalETH),
                avgBalance: avgBalance,
                fundedWallets: fundedWallets,
                emptyWallets: sampleSize - fundedWallets,
                estimatedTotalValue: parseFloat(avgBalance) * wallets.length
            },
            firstWallet: wallets.length > 0 ? wallets[0][0] : null,
            lastWallet: wallets.length > 0 ? wallets[wallets.length - 1][0] : null
        });

    } catch (error) {
        console.error('Error fetching wallet stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch wallet statistics',
            details: error.message
        });
    }
});

// Get specific wallet details
app.get('/api/wallets/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const wallets = loadWallets();
        
        if (index < 0 || index >= wallets.length) {
            return res.status(404).json({
                success: false,
                error: 'Wallet index out of range'
            });
        }

        const walletAddress = wallets[index][0];
        const balance = await provider.getBalance(walletAddress);
        
        res.json({
            success: true,
            index: index,
            address: walletAddress,
            balance: ethers.utils.formatEther(balance),
            balanceWei: balance.toString(),
            hasPrivateKey: true
        });

    } catch (error) {
        console.error('Error fetching wallet details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch wallet details',
            details: error.message
        });
    }
});

// Get main wallet detailed information
app.get('/api/wallet/main', async (req, res) => {
    try {
        if (!config.fundingPrivateKey) {
            return res.json({
                success: false,
                error: 'Main wallet not configured (PK_MAIN missing in .env)'
            });
        }

        const mainWallet = new ethers.Wallet(config.fundingPrivateKey, provider);
        const balance = await provider.getBalance(mainWallet.address);
        
        // Get transaction count (nonce)
        const nonce = await provider.getTransactionCount(mainWallet.address);
        
        // Get recent gas price for cost estimation
        const gasPrice = await provider.getGasPrice();
        const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 9);

        res.json({
            success: true,
            address: mainWallet.address,
            balance: ethers.utils.formatEther(balance),
            balanceWei: balance.toString(),
            nonce: nonce,
            gasPrice: gasPriceGwei,
            network: await provider.getNetwork(),
            canFund: balance.gt(ethers.utils.parseEther("0.001")) // Can fund if > 0.001 ETH
        });

    } catch (error) {
        console.error('Error fetching main wallet:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch main wallet information',
            details: error.message
        });
    }
});

// Create new wallets via API
app.post('/api/wallets/create', async (req, res) => {
    try {
        const { count = 10 } = req.body;
        
        if (!isValidNumber(count, 1, 10000)) {
            return res.status(400).json({
                success: false,
                error: 'Count must be between 1 and 10000'
            });
        }

        const existingWallets = loadWallets();
        const newWallets = [];
        
        for (let i = 0; i < count; i++) {
            const wallet = ethers.Wallet.createRandom();
            newWallets.push([wallet.address, wallet.privateKey]);
        }
        
        const allWallets = [...existingWallets, ...newWallets];
        saveWallets(allWallets);

        res.json({
            success: true,
            created: count,
            totalWallets: allWallets.length,
            newAddresses: newWallets.map(w => w[0])
        });

    } catch (error) {
        console.error('Error creating wallets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create wallets',
            details: error.message
        });
    }
});

// ============================================================================
// TOKEN DATABASE APIs  
// ============================================================================

// Get all tokens in database
app.get('/api/tokens', (req, res) => {
    try {
        const tokens = loadTokens();
        
        // Group tokens by symbol for better organization
        const tokensBySymbol = {};
        tokens.forEach(token => {
            if (!tokensBySymbol[token.symbol]) {
                tokensBySymbol[token.symbol] = [];
            }
            tokensBySymbol[token.symbol].push(token);
        });

        res.json({
            success: true,
            totalTokens: tokens.length,
            uniqueSymbols: Object.keys(tokensBySymbol).length,
            tokens: tokens,
            tokensBySymbol: tokensBySymbol,
            recentlyAdded: tokens
                .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
                .slice(0, 10)
        });

    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tokens',
            details: error.message
        });
    }
});

// Get specific token by address
app.get('/api/tokens/:address', (req, res) => {
    try {
        const address = req.params.address;
        
        if (!isValidTokenAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token address format'
            });
        }

        const token = getTokenByAddress(address);
        
        if (!token) {
            return res.status(404).json({
                success: false,
                error: 'Token not found in database'
            });
        }

        res.json({
            success: true,
            token: token
        });

    } catch (error) {
        console.error('Error fetching token:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch token',
            details: error.message
        });
    }
});

// Add new token(s) to database
app.post('/api/tokens/add', async (req, res) => {
    try {
        const { addresses } = req.body;
        
        if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Addresses array is required'
            });
        }

        // Validate all addresses
        const invalidAddresses = addresses.filter(addr => !isValidTokenAddress(addr));
        if (invalidAddresses.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Invalid addresses: ${invalidAddresses.join(', ')}`
            });
        }

        // Add tokens using the enhanced function from your codebase
        const result = await addTokens(addresses);

        res.json({
            success: true,
            message: `Successfully processed ${addresses.length} token addresses`,
            added: result.added.length,
            failed: result.failed.length,
            duplicates: result.summary.duplicateCount,
            totalTokens: result.total,
            details: {
                successful: result.added,
                failed: result.failed
            }
        });

    } catch (error) {
        console.error('Error adding tokens:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add tokens',
            details: error.message
        });
    }
});

// Search tokens by symbol
app.get('/api/tokens/search/:symbol', (req, res) => {
    try {
        const symbol = req.params.symbol;
        const tokens = getTokensBySymbol(symbol);

        res.json({
            success: true,
            symbol: symbol,
            found: tokens.length,
            tokens: tokens
        });

    } catch (error) {
        console.error('Error searching tokens:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search tokens',
            details: error.message
        });
    }
});

// Get default tokens configuration
app.get('/api/tokens/defaults', (req, res) => {
    try {
        res.json({
            success: true,
            defaultTokens: defaultTokens,
            v2Tokens: defaultTokens.V2 || [],
            v3Tokens: defaultTokens.V3 || []
        });

    } catch (error) {
        console.error('Error fetching default tokens:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch default tokens',
            details: error.message
        });
    }
});

// ============================================================================
// SYSTEM CONFIGURATION APIs
// ============================================================================

// Get current configuration
app.get('/api/config', (req, res) => {
    try {
        // Don't expose sensitive data like private keys
        const safeConfig = {
            rpcUrl: config.rpcUrl ? config.rpcUrl.replace(/\/[a-zA-Z0-9]+$/, '/***') : null,
            hasMainWallet: !!config.fundingPrivateKey,
            defaultWalletCount: config.defaultWalletCount,
            defaultChunkSize: config.defaultChunkSize,
            defaultBatchSize: config.defaultBatchSize,
            defaultV3Fee: config.defaultV3Fee,
            gasSettings: {
                gasMax: config.gasSettings.gasMax,
                hasCustomGasPrice: !!config.gasSettings.gasPrice,
                hasCustomGasLimit: !!config.gasSettings.gasLimit
            },
            contracts: contracts
        };

        res.json({
            success: true,
            config: safeConfig
        });

    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch configuration',
            details: error.message
        });
    }
});

// Get comprehensive dashboard data (combines everything)
app.get('/api/dashboard', async (req, res) => {
    try {
        // Get wallet stats (limited sample to avoid long response time)
        const wallets = loadWallets();
        let mainWalletInfo = null;
        
        if (config.fundingPrivateKey) {
            try {
                const mainWallet = new ethers.Wallet(config.fundingPrivateKey, provider);
                const mainBalance = await provider.getBalance(mainWallet.address);
                
                mainWalletInfo = {
                    address: mainWallet.address,
                    balance: ethers.utils.formatEther(mainBalance),
                    balanceWei: mainBalance.toString()
                };
            } catch (error) {
                mainWalletInfo = { error: 'Failed to load main wallet' };
            }
        }

        // Get token stats
        const tokens = loadTokens();
        const tokensBySymbol = {};
        tokens.forEach(token => {
            if (!tokensBySymbol[token.symbol]) {
                tokensBySymbol[token.symbol] = [];
            }
            tokensBySymbol[token.symbol].push(token);
        });

        // Get gas prices
        const gasData = await calculateGasPrices();

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            dashboard: {
                wallets: {
                    total: wallets.length,
                    firstAddress: wallets.length > 0 ? wallets[0][0] : null,
                    lastAddress: wallets.length > 0 ? wallets[wallets.length - 1][0] : null
                },
                mainWallet: mainWalletInfo,
                tokens: {
                    total: tokens.length,
                    uniqueSymbols: Object.keys(tokensBySymbol).length,
                    recent: tokens
                        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
                        .slice(0, 5)
                },
                gas: {
                    ...gasData
                },
                system: {
                    activeProcesses: activeProcesses.size,
                    wsConnections: wsConnections.size,
                    uptime: process.uptime()
                }
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data',
            details: error.message
        });
    }
});

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
            env: { ...process.env, FORCE_COLOR: '0' }
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
            
            broadcast({
                type: 'output',
                processId,
                data: output,
                timestamp: new Date().toISOString(),
                command: command
            });
            
            if (activeProcesses.has(processId)) {
                activeProcesses.get(processId).output += output;
            }
        });
        
        // Handle stderr data
        childProcess.stderr.on('data', (data) => {
            const error = data.toString();
            fullOutput += error;
            hasError = true;
            
            broadcast({
                type: 'error',
                processId,
                data: error,
                timestamp: new Date().toISOString(),
                command: command
            });
            
            if (activeProcesses.has(processId)) {
                activeProcesses.get(processId).errors += error;
            }
        });
        
        // Handle process completion
        childProcess.on('close', (code) => {
            exitCode = code;
            const success = code === 0 && !hasError;
            
            broadcast({
                type: 'complete',
                processId,
                success,
                exitCode: code,
                timestamp: new Date().toISOString(),
                command: command
            });
            
            activeProcesses.delete(processId);
            
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
        }, 300000);
        
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

// Enhanced stop all processes with force kill option
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

// Force kill all processes (for emergency situations)
app.post('/api/force-kill', (req, res) => {
    const killedProcesses = [];
    
    activeProcesses.forEach((processInfo, processId) => {
        try {
            processInfo.process.kill('SIGKILL'); // Force kill
            killedProcesses.push(processId);
        } catch (error) {
            console.error(`Error force killing process ${processId}:`, error);
        }
    });
    
    broadcast({
        type: 'all_stopped',
        message: `Force killed ${killedProcesses.length} process(es)`,
        timestamp: new Date().toISOString(),
        killedProcesses
    });
    
    activeProcesses.clear();
    
    res.json({ 
        success: true, 
        message: `Force killed ${killedProcesses.length} process(es)`,
        killedProcesses 
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

// Get enhanced system status
app.get('/api/status', (req, res) => {
    const scriptExists = fs.existsSync(path.join(__dirname, 'script.js'));
    const envExists = fs.existsSync(path.join(__dirname, '.env'));
    
    res.json({
        scriptExists,
        envExists,
        activeProcesses: activeProcesses.size,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        connections: wsConnections.size,
        gasCacheStatus: {
            hasCache: gasPriceCache.data !== null,
            lastUpdate: gasPriceCache.lastUpdate,
            cacheAge: gasPriceCache.lastUpdate ? Date.now() - gasPriceCache.lastUpdate : 0
        }
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
            console.log(`Stopping process ${processId}: ${processInfo.command}`);
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
    console.log(`⛽ Gas price API available at /api/gas-prices`);
    console.log(`📈 Gas estimation API available at /api/estimate-gas`);
    
    // Initialize gas price cache on startup
    calculateGasPrices().then(() => {
        console.log('✅ Initial gas price data loaded');
    }).catch(error => {
        console.warn('⚠️  Failed to load initial gas price data:', error.message);
    });
});