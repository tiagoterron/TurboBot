//V 1.0.8
const { ethers, utils } = require('ethers');
const fs = require('fs');
const path = require('path');
const { start } = require('repl');
require('dotenv').config();

// Configuration from environment variables
const config = {
    rpcUrl: process.env.RPC_URL || "https://base-mainnet.g.alchemy.com/v2/your-api-key",
    tokenFile: "tokens.json",
    fundingPrivateKey: process.env.PK_MAIN,
    defaultWalletCount: parseInt(process.env.DEFAULT_WALLET_COUNT) || 1000,
    defaultChunkSize: parseInt(process.env.DEFAULT_CHUNK_SIZE) || 500,
    defaultBatchSize: parseInt(process.env.DEFAULT_BATCH_SIZE) || 50,
    defaultV3Fee: parseInt(process.env.DEFAULT_V3_FEE) || 10000,
    gasSettings: {
        gasPrice: process.env.GAS_PRICE_GWEI ? ethers.utils.parseUnits(process.env.GAS_PRICE_GWEI, 9) : null,
        gasLimit: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : null,
        gasMax: process.env.GAS_MAX ? String(process.env.GAS_MAX) : "0.000004"
    }
};

// Provider and contract configurations
const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);



const contracts = {
    uniswapRouter: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
    uniswapRouterV3: "0x2626664c2603336E57B271c5C0b26F421741e481",
    airdropContract: "0x4F50E08aa6059aC120AD7Bb82c097Fd89f517Da3",
    multicallSwap: "0x0D99F3072fDbEDFFFf920f166F3B5d7e2bE32Ba0",
    multicallSwapV3: "0xa960Fb933b4eD5130e140824c67a6d7c4c5118a2",
    deployerContract: "0xf3751f6a3900879b76023bDAD40286d86E61883b",
    v3SwapContract: "0xe9d7E6669C39350DD6664fd6fB66fCE4D871D374"
};

const routerAbi = [
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
];

const airdropAbi = [
    "function sendAirdropETH(address[] calldata recipients) external payable"
];

const multicallAbi = [
    "function executeMultiSwapV3(tuple(address tokenAddress, uint256 ethAmount, address recipient, uint24 fee, uint256 minAmountOut)[] swapDetails) external payable",
    "function executeMultiTokenSwap(address[] tokenAddresses, uint256 ethAmountPerToken, address recipient, uint24 fee, uint256 minAmountOut) external payable",
    "function executeMultiFeeSwap(address tokenAddress, uint256 ethAmountPerSwap, address recipient, uint24[] fees, uint256 minAmountOut) external payable",
    "function quickMultiSwap(address[] tokenAddresses, uint256 ethAmountPerToken, address recipient) external payable",
    
    "function executeMultiSwap(tuple(address tokenAddress, uint256 ethAmount, address recipient, address router, uint256 minAmountOut)[] swapDetails) external payable",
    "function swapPredefinedTokens(uint256 ethAmountToken1, uint256 ethAmountToken2, uint256 minAmountOutToken1, uint256 minAmountOutToken2, address recipient, address router) external payable",
    "function swapEqualAmounts(uint256 ethAmountEach, uint256 minAmountOutToken1, uint256 minAmountOutToken2, address recipient, address router) external payable"
];

const turboDeployerAbi = [
    "function deploy(address tokenAddress, address owner) external payable returns (address)",
    "function deployedContracts(uint256) external view returns (address)",
    "function tokenToContracts(address, uint256) external view returns (address)",
    "function ownerTokenToContract(address, address) external view returns (address)",
    "function ownerToContracts(address, uint256) external view returns (address)",
    "function getAllDeployedContracts() external view returns (address[])",
    "function getDeployedContractsCount() external view returns (uint256)",
    "function getDeployedContractByIndex(uint256 index) external view returns (address)",
    "function getContractsByToken(address tokenAddress) external view returns (address[])",
    "function getContractCountByToken(address tokenAddress) external view returns (uint256)",
    "function getContractsByOwner(address owner) external view returns (address[])",
    "function getContractCountByOwner(address owner) external view returns (uint256)",
    "function getContractByOwnerAndToken(address owner, address tokenAddress) external view returns (address)",
    "function hasDeployed(address owner, address tokenAddress) external view returns (bool)",
    "event Deployed(address indexed token, address indexed deployedContract, address indexed owner)"
];

const volumeSwapAbi = [
    // Main Functions
    "function executeSwap() external payable",
    "function executeV3Swap() external payable",
    "function withdraw() external",
    
    // Owner Functions
    "function changeSellValue(uint256 value) external",
    "function changeBuyValue(uint256 value) external", 
    "function setMaxBuy(uint256 value) external",
    "function setOwner(address newOwner) external",
    
    // View Functions
    "function WETH() external view returns (address)",
    "function owner() external view returns (address)",
    "function tokenAddress() external view returns (address)",
    "function percentualSell() external view returns (uint256)",
    "function routerUniV2() external view returns (address)",
    "function percentualBuy() external view returns (uint256)",
    "function maxBuy() external view returns (uint256)",
    "function approvedRouters(address) external view returns (bool)",
    
    // Events
    "event SwapPrepared(address indexed recipient, address indexed tokenAddress, uint256 amountETH)",
    "event SwapExecuted(address indexed recipient, address indexed tokenAddress, uint256 amountETH)",
];

const ERC20_ABI = [
    // Read functions
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",

    // Write functions
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transfer(address recipient, uint256 amount) external returns (bool)",
    "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];


// Default token addresses
const defaultTokens = {
    "V2": [
    "0xc849418f46A25D302f55d25c40a82C99404E5245", // KIKI
    "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460", // TURBO
    "0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB", // LORDY
    "0x7480527815ccAE421400Da01E052b120Cc4255E9"  // WORKIE
    ],
    "V3": [
    "0xf83cde146AC35E99dd61b6448f7aD9a4534133cc", // Ebert
    "0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9", // BasedBonk
    ]
}

// Utility functions


const LockyFiDeployerAbi = [
    "function deploy(address tokenAddress) external payable returns (address)",
    "function deployedContracts(uint256) external view returns (address)",
    "function tokenToContracts(address, uint256) external view returns (address)",
    "function ownerTokenToContract(address, address) external view returns (address)",
    "function ownerToContracts(address, uint256) external view returns (address)",
    "function getAllDeployedContracts() external view returns (address[])",
    "function getDeployedContractsCount() external view returns (uint256)",
    "function getDeployedContractByIndex(uint256 index) external view returns (address)",
    "function getContractsByToken(address tokenAddress) external view returns (address[])",
    "function getContractCountByToken(address tokenAddress) external view returns (uint256)",
    "function getContractsByOwner(address owner) external view returns (address[])",
    "function getContractCountByOwner(address owner) external view returns (uint256)",
    "function getContractByOwnerAndToken(address owner, address tokenAddress) external view returns (address)",
    "function hasDeployed(address owner, address tokenAddress) external view returns (bool)",
    "event Deployed(address indexed token, address indexed deployedContract, address indexed owner)"
];


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function errorLog(message) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
}

function randomIndex(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return randomIndex;
  }

function random(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

async function getGasEstimates(tx, options) {
    const provider = options.provider.provider || options.provider;
    const baseGasPrice = await provider.getGasPrice();
    
    let gasLimit;
    try {
        gasLimit = await provider.estimateGas(tx);
        gasLimit = gasLimit.mul(100).div(100); // 50% buffer
    } catch (error) {
        gasLimit = 21000; // Fallback for simple transfers
    }
    
    const gasPrice = baseGasPrice.mul(100).div(100); // 20% boost
    const gasWei = gasPrice.mul(gasLimit);
    
    return { gasLimit, gasPrice, gasWei };
}

async function analyzeGasPrice(operationType = 'OPERATION', estimatedGasUnits = 400000, bufferMultiplier = 1.2) {
    try {
        // Get gas max limit from config
        const gasMaxETH = typeof config.gasSettings.gasMax === 'string' ? 
            config.gasSettings.gasMax : 
            config.gasSettings.gasMax.toString();
        const gasMaxWei = ethers.utils.parseUnits(gasMaxETH, 18);
        
        console.log(`🔍 Analyzing gas conditions for ${operationType}...`);
        console.log(`⚙️  Gas max limit: ${gasMaxETH} ETH`);
        
        // Get current gas price from network
        const currentGasPrice = await provider.getGasPrice();
        const currentGasPriceGwei = ethers.utils.formatUnits(currentGasPrice, 9);
        
        console.log(`⛽ Current network gas price: ${currentGasPriceGwei} Gwei`);
        
        // Apply gas price adjustments (same logic as in your existing functions)
        const minGasPrice = ethers.utils.parseUnits("0.001", 9); // 0.001 Gwei minimum
        let adjustedGasPrice = currentGasPrice.lt(minGasPrice) ? 
            minGasPrice.mul(5) : currentGasPrice.mul(120).div(100); // 5x minimum or 20% boost
        
        const adjustedGasPriceGwei = ethers.utils.formatUnits(adjustedGasPrice, 9);
        console.log(`📈 Adjusted gas price (with boost): ${adjustedGasPriceGwei} Gwei`);
        
        // Calculate estimated gas cost with buffer
        const bufferedGasUnits = Math.floor(estimatedGasUnits * bufferMultiplier);
        const estimatedGasCost = adjustedGasPrice.mul(bufferedGasUnits);
        const estimatedGasCostETH = ethers.utils.formatUnits(estimatedGasCost, 18);
        
        console.log(`🧮 Estimated gas units: ${bufferedGasUnits.toLocaleString()} (${estimatedGasUnits.toLocaleString()} + ${((bufferMultiplier - 1) * 100).toFixed(0)}% buffer)`);
        console.log(`💰 Estimated gas cost: ${estimatedGasCostETH} ETH`);
        
        // Compare against gas max limit
        const gasRatio = estimatedGasCost.mul(10000).div(gasMaxWei).toNumber() / 100; // Percentage with 2 decimal places
        const withinLimit = estimatedGasCost.lte(gasMaxWei);
        
        console.log(`📊 Gas cost ratio: ${gasRatio.toFixed(2)}% of maximum allowed`);
        
        // Determine recommendation based on gas cost analysis
        let recommendation, priority, waitTime;
        
        if (gasRatio <= 30) {
            recommendation = 'PROCEED_IMMEDIATELY';
            priority = 'LOW_COST';
            waitTime = 0;
            console.log(`✅ Gas conditions excellent - proceed immediately`);
        } else if (gasRatio <= 60) {
            recommendation = 'PROCEED_NORMAL';
            priority = 'MODERATE_COST';
            waitTime = 0;
            console.log(`✅ Gas conditions acceptable - proceed normally`);
        } else if (gasRatio <= 85) {
            recommendation = 'PROCEED_CAUTIOUS';
            priority = 'HIGH_COST';
            waitTime = 1000; // 1 second pause
            console.log(`⚠️  Gas conditions expensive but acceptable - proceed with caution`);
        } else if (withinLimit) {
            recommendation = 'PROCEED_EXPENSIVE';
            priority = 'VERY_HIGH_COST';
            waitTime = 2000; // 2 second pause
            console.log(`⚠️  Gas conditions very expensive - last chance before limit`);
        } else {
            recommendation = 'ABORT_HIGH_GAS';
            priority = 'EXCEEDS_LIMIT';
            waitTime = 5000; // 5 second wait before retry
            console.log(`❌ Gas cost exceeds maximum limit - operation should be aborted`);
        }
        
        // Additional warnings based on gas price levels
        if (parseFloat(adjustedGasPriceGwei) > 2.0) {
            console.log(`🚨 Network congestion detected - gas price is ${adjustedGasPriceGwei} Gwei`);
        }
        
        if (parseFloat(adjustedGasPriceGwei) > 5.0) {
            console.log(`⚡ Extremely high gas detected - consider waiting for network to calm down`);
        }
        
        // Calculate suggested retry time for failed operations
        let suggestedRetryTime = 30000; // 30 seconds default
        if (gasRatio > 100) {
            suggestedRetryTime = 60000; // 1 minute for way over limit
        } else if (gasRatio > 90) {
            suggestedRetryTime = 45000; // 45 seconds for just over limit
        }
        
        const analysisResult = {
            success: true,
            recommendation,
            priority,
            withinLimit,
            gasDetails: {
                currentGasPrice: currentGasPrice,
                currentGasPriceGwei: parseFloat(currentGasPriceGwei),
                adjustedGasPrice: adjustedGasPrice,
                adjustedGasPriceGwei: parseFloat(adjustedGasPriceGwei),
                estimatedGasUnits: bufferedGasUnits,
                estimatedGasCost: estimatedGasCost,
                estimatedGasCostETH: parseFloat(estimatedGasCostETH),
                gasMaxWei: gasMaxWei,
                gasMaxETH: parseFloat(gasMaxETH),
                gasRatioPercent: gasRatio
            },
            timing: {
                waitTime,
                suggestedRetryTime
            },
            operationType
        };
        
        console.log(`📋 Gas analysis complete for ${operationType}`);
        return analysisResult;
        
    } catch (error) {
        console.error(`❌ Gas analysis failed for ${operationType}:`, error.message);
        
        // Return safe fallback recommendation
        return {
            success: false,
            recommendation: 'PROCEED_CAUTIOUS',
            priority: 'UNKNOWN',
            withinLimit: false, // Assume worst case
            error: error.message,
            gasDetails: {
                currentGasPriceGwei: 0,
                adjustedGasPriceGwei: 0,
                estimatedGasCostETH: 0,
                gasMaxETH: typeof config.gasSettings.gasMax === 'string' ? 
                    parseFloat(config.gasSettings.gasMax) : config.gasSettings.gasMax,
                gasRatioPercent: 100 // Assume at limit
            },
            timing: {
                waitTime: 3000, // 3 second wait on error
                suggestedRetryTime: 60000 // 1 minute retry on error
            },
            operationType
        };
    }
}

async function analyzeTransactionGas(transaction, signer, operationType = 'OPERATION', bufferMultiplier = 1.2) {
    try {
        // Get gas max limit from config
        const gasMaxETH = typeof config.gasSettings.gasMax === 'string' ? 
            config.gasSettings.gasMax : 
            config.gasSettings.gasMax.toString();
        const gasMaxWei = ethers.utils.parseUnits(gasMaxETH, 18);
        
        console.log(`🔍 Analyzing specific transaction gas for ${operationType}...`);
        console.log(`⚙️  Gas max limit: ${gasMaxETH} ETH`);
        
        // Get current gas price from network
        const currentGasPrice = await provider.getGasPrice();
        const currentGasPriceGwei = ethers.utils.formatUnits(currentGasPrice, 9);
        
        console.log(`⛽ Current network gas price: ${currentGasPriceGwei} Gwei`);
        
        // Apply gas price adjustments (same logic as in your existing functions)
        const minGasPrice = ethers.utils.parseUnits("0.001", 9); // 0.001 Gwei minimum
        let adjustedGasPrice = currentGasPrice.lt(minGasPrice) ? 
            minGasPrice.mul(5) : currentGasPrice.mul(120).div(100); // 5x minimum or 20% boost
        
        const adjustedGasPriceGwei = ethers.utils.formatUnits(adjustedGasPrice, 9);
        console.log(`📈 Adjusted gas price (with boost): ${adjustedGasPriceGwei} Gwei`);
        
        // Estimate gas for the specific transaction
        let estimatedGasLimit;
        try {
            console.log(`🧮 Estimating gas for specific transaction...`);
            estimatedGasLimit = await provider.estimateGas({
                ...transaction,
                from: signer.address
            });
            console.log(`📊 Estimated gas limit: ${estimatedGasLimit.toString()}`);
        } catch (gasError) {
            console.log(`⚠️  Gas estimation failed, using fallback: ${gasError.message}`);
            
            // Provide fallback gas limits based on operation type
            if (operationType.includes('FUNDING')) {
                estimatedGasLimit = ethers.BigNumber.from("21000");
            } else if (operationType.includes('SWAP') || operationType.includes('MULTISWAP')) {
                estimatedGasLimit = ethers.BigNumber.from("500000");
            } else {
                estimatedGasLimit = ethers.BigNumber.from("300000");
            }
            
            console.log(`🔄 Using fallback gas limit: ${estimatedGasLimit.toString()}`);
        }
        
        // Apply buffer to gas limit
        const bufferedGasLimit = estimatedGasLimit.mul(Math.floor(bufferMultiplier * 100)).div(100);
        console.log(`📈 Buffered gas limit (+${((bufferMultiplier - 1) * 100).toFixed(0)}%): ${bufferedGasLimit.toString()}`);
        
        // Calculate estimated gas cost
        const estimatedGasCost = adjustedGasPrice.mul(bufferedGasLimit);
        const estimatedGasCostETH = ethers.utils.formatUnits(estimatedGasCost, 18);
        
        console.log(`💰 Estimated gas cost: ${estimatedGasCostETH} ETH`);
        
        // Compare against gas max limit
        const gasRatio = estimatedGasCost.mul(10000).div(gasMaxWei).toNumber() / 100; // Percentage with 2 decimal places
        const withinLimit = estimatedGasCost.lte(gasMaxWei);
        
        console.log(`📊 Gas cost ratio: ${gasRatio.toFixed(2)}% of maximum allowed`);
        
        // Check if sender has enough balance for gas + value
        let hasEnoughBalance = true;
        let requiredBalance = estimatedGasCost;
        
        if (transaction.value) {
            const txValue = ethers.BigNumber.from(transaction.value);
            requiredBalance = requiredBalance.add(txValue);
        }
        
        try {
            const senderBalance = await provider.getBalance(signer.address);
            hasEnoughBalance = senderBalance.gte(requiredBalance);
            
            console.log(`👛 Sender balance: ${ethers.utils.formatUnits(senderBalance, 18)} ETH`);
            console.log(`💸 Required (gas + value): ${ethers.utils.formatUnits(requiredBalance, 18)} ETH`);
            
            if (!hasEnoughBalance) {
                console.log(`❌ Insufficient balance for transaction`);
            }
        } catch (balanceError) {
            console.log(`⚠️  Could not check sender balance: ${balanceError.message}`);
            hasEnoughBalance = false; // Assume worst case
        }
        
        // Determine recommendation based on gas cost analysis
        let recommendation, priority, waitTime;
        
        if (!hasEnoughBalance) {
            recommendation = 'ABORT_INSUFFICIENT_BALANCE';
            priority = 'INSUFFICIENT_FUNDS';
            waitTime = 0;
            console.log(`❌ Transaction aborted - insufficient balance`);
        } else if (gasRatio <= 30) {
            recommendation = 'PROCEED_IMMEDIATELY';
            priority = 'LOW_COST';
            waitTime = 0;
            console.log(`✅ Gas conditions excellent - proceed immediately`);
        } else if (gasRatio <= 60) {
            recommendation = 'PROCEED_NORMAL';
            priority = 'MODERATE_COST';
            waitTime = 0;
            console.log(`✅ Gas conditions acceptable - proceed normally`);
        } else if (gasRatio <= 85) {
            recommendation = 'PROCEED_CAUTIOUS';
            priority = 'HIGH_COST';
            waitTime = 1000; // 1 second pause
            console.log(`⚠️  Gas conditions expensive but acceptable - proceed with caution`);
        } else if (withinLimit) {
            recommendation = 'PROCEED_EXPENSIVE';
            priority = 'VERY_HIGH_COST';
            waitTime = 2000; // 2 second pause
            console.log(`⚠️  Gas conditions very expensive - last chance before limit`);
        } else {
            recommendation = 'ABORT_HIGH_GAS';
            priority = 'EXCEEDS_LIMIT';
            waitTime = 5000; // 5 second wait before retry
            console.log(`❌ Gas cost exceeds maximum limit - transaction should be aborted`);
        }
        
        // Additional warnings based on gas price levels
        if (parseFloat(adjustedGasPriceGwei) > 2.0) {
            console.log(`🚨 Network congestion detected - gas price is ${adjustedGasPriceGwei} Gwei`);
        }
        
        if (parseFloat(adjustedGasPriceGwei) > 5.0) {
            console.log(`⚡ Extremely high gas detected - consider waiting for network to calm down`);
        }
        
        // Calculate suggested retry time for failed operations
        let suggestedRetryTime = 30000; // 30 seconds default
        if (gasRatio > 100) {
            suggestedRetryTime = 60000; // 1 minute for way over limit
        } else if (gasRatio > 90) {
            suggestedRetryTime = 45000; // 45 seconds for just over limit
        }
        
        const analysisResult = {
            success: true,
            recommendation,
            priority,
            withinLimit,
            hasEnoughBalance,
            gasDetails: {
                currentGasPrice: currentGasPrice,
                currentGasPriceGwei: parseFloat(currentGasPriceGwei),
                adjustedGasPrice: adjustedGasPrice,
                adjustedGasPriceGwei: parseFloat(adjustedGasPriceGwei),
                estimatedGasLimit: estimatedGasLimit,
                bufferedGasLimit: bufferedGasLimit,
                estimatedGasCost: estimatedGasCost,
                estimatedGasCostETH: parseFloat(estimatedGasCostETH),
                gasMaxWei: gasMaxWei,
                gasMaxETH: parseFloat(gasMaxETH),
                gasRatioPercent: gasRatio,
                requiredBalance: requiredBalance,
                requiredBalanceETH: parseFloat(ethers.utils.formatUnits(requiredBalance, 18))
            },
            timing: {
                waitTime,
                suggestedRetryTime
            },
            operationType
        };
        
        console.log(`📋 Transaction gas analysis complete for ${operationType}`);
        return analysisResult;
        
    } catch (error) {
        console.error(`❌ Transaction gas analysis failed for ${operationType}:`, error.message);
        
        // Return safe fallback recommendation
        return {
            success: false,
            recommendation: 'ABORT_HIGH_GAS', // Assume worst case on error
            priority: 'UNKNOWN',
            withinLimit: false,
            hasEnoughBalance: false,
            error: error.message,
            gasDetails: {
                currentGasPriceGwei: 0,
                adjustedGasPriceGwei: 0,
                estimatedGasCostETH: 0,
                gasMaxETH: typeof config.gasSettings.gasMax === 'string' ? 
                    parseFloat(config.gasSettings.gasMax) : config.gasSettings.gasMax,
                gasRatioPercent: 100, // Assume at limit
                bufferedGasLimit: ethers.BigNumber.from("500000"), // Fallback for use in transactions
                adjustedGasPrice: ethers.utils.parseUnits("1", 9) // Fallback 1 Gwei
            },
            timing: {
                waitTime: 3000, // 3 second wait on error
                suggestedRetryTime: 60000 // 1 minute retry on error
            },
            operationType
        };
    }
}


// File operations
function loadWallets() {
    try {
        if (fs.existsSync('./wallets.json')) {
            const data = fs.readFileSync('./wallets.json', 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        errorLog('Error loading wallets: ' + err.message);
    }
    return [];
}

function saveWallets(wallets) {
    try {
        fs.writeFileSync('./wallets.json', JSON.stringify(wallets, null, 2));
        log(`Saved ${wallets.length} wallets to wallets.json`);
    } catch (err) {
        errorLog('Error saving wallets: ' + err.message);
    }
}

function loadTokens() {
    try {
        if (fs.existsSync(config.tokenFile)) {
            const data = fs.readFileSync(config.tokenFile, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        log(`Error loading tokens: ${error.message}`);
        return [];
    }
}

function saveTokens(tokens) {
    try {
        fs.writeFileSync(config.tokenFile, JSON.stringify(tokens, null, 2));
    } catch (error) {
        log(`Error saving tokens: ${error.message}`);
        throw error;
    }
}

async function addTokens(tokenAddresses) {
    // Convert single address to array for consistency
    const addresses = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];
    
    log(`Adding ${addresses.length} new tokens...`);
    
    const existingTokens = loadTokens();
    log(`Found ${existingTokens.length} existing tokens`);
    
    const newTokens = [];
    const duplicateAddresses = new Set();
    const failedTokens = [];
    
    // Create a set of existing addresses for quick lookup
    const existingAddresses = new Set(existingTokens.map(token => token.address.toLowerCase()));
    
    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        
        // Validate address format
        if (!ethers.utils.isAddress(address)) {
            log(`⚠️  Skipping invalid address: ${address}`);
            failedTokens.push({ address, reason: 'invalid_address' });
            continue;
        }
        
        // Check for duplicates (case-insensitive)
        const normalizedAddress = address.toLowerCase();
        
        if (existingAddresses.has(normalizedAddress) || duplicateAddresses.has(normalizedAddress)) {
            log(`⚠️  Skipping duplicate token: ${address}`);
            continue;
        }
        
        duplicateAddresses.add(normalizedAddress);
        
        try {
            log(`🔍 Fetching token info for: ${address}`);
            
            // Create contract instance to fetch token details
            const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
            
            // Fetch symbol, decimals, and name in parallel
            const [symbol, decimals, name] = await Promise.all([
                tokenContract.symbol(),
                tokenContract.decimals(), 
                tokenContract.name()
            ]);
            
            const tokenEntry = {
                address: address,
                symbol: symbol,
                decimals: decimals,
                name: name,
                addedAt: new Date().toISOString()
            };
            
            newTokens.push(tokenEntry);
            log(`✅ Added token: ${symbol} (${name}) - ${address}`);
            
            if ((newTokens.length) % 10 === 0) {
                log(`📊 Progress: ${newTokens.length}/${addresses.length} tokens processed`);
            }
            
        } catch (error) {
            log(`❌ Failed to fetch token info for ${address}: ${error.message}`);
            failedTokens.push({ address, reason: error.message });
            
            // If it's a contract call exception, the address might not be a valid ERC20 token
            if (error.code === 'CALL_EXCEPTION') {
                log(`   → Address may not be a valid ERC20 token`);
            }
        }
        
        // Small delay to avoid rate limiting
        if (i < addresses.length - 1) {
            await sleep(100);
        }
    }
    
    const allTokens = [...existingTokens, ...newTokens];
    saveTokens(allTokens);
    
    log(`\n✅ Token addition completed!`);
    log(`📊 Results Summary:`);
    log(`   • Successfully added: ${newTokens.length} tokens`);
    log(`   • Failed to add: ${failedTokens.length} tokens`);
    log(`   • Duplicates skipped: ${addresses.length - newTokens.length - failedTokens.length}`);
    log(`   • Total tokens in database: ${allTokens.length}`);
    
    if (failedTokens.length > 0) {
        log(`\n❌ Failed tokens:`);
        failedTokens.forEach(({ address, reason }) => {
            log(`   • ${address}: ${reason}`);
        });
    }
    
    if (newTokens.length > 0) {
        log(`\n🎉 Successfully added tokens:`);
        newTokens.forEach(token => {
            log(`   • ${token.symbol} (${token.name}) - ${token.address}`);
        });
    }
    
    return {
        success: true,
        added: newTokens,
        failed: failedTokens,
        total: allTokens.length,
        summary: {
            successCount: newTokens.length,
            failCount: failedTokens.length,
            duplicateCount: addresses.length - newTokens.length - failedTokens.length
        }
    };
}

// Alternative function for adding a single token by address
async function addSingleToken(address) {
    return await addTokens([address]);
}

// Function to get token by address
function getTokenByAddress(address) {
    const tokens = loadTokens();
    return tokens.find(token => token.address.toLowerCase() === address.toLowerCase());
}

// Function to get token by symbol
function getTokensBySymbol(symbol) {
    const tokens = loadTokens();
    return tokens.filter(token => token.symbol.toLowerCase() === symbol.toLowerCase());
}

function savePrivateKey(wallet) {
    try {
        let wallets = [];
        
        // Read existing wallets if file exists
        if (fs.existsSync('./wallets.json')) {
            const data = fs.readFileSync('./wallets.json', 'utf8');
            wallets = JSON.parse(data);
        }
    
        
        // Add new wallet
        wallets.push(wallet);
        
        // Save back to file
        fs.writeFileSync('./wallets.json', JSON.stringify(wallets, null, 2));
        
        console.log(`Saved wallet ${wallets.length}: ${wallet[0]}`);
        
    } catch (err) {
        console.error('Error saving wallet:', err.message);
    }
}

// Wallet management functions
async function createWallets(count) {
    log(`Creating ${count} new wallets...`);
    
    const existingWallets = loadWallets();
    log(`Found ${existingWallets.length} existing wallets`);
    
    const newWallets = [];
    
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        newWallets.push([wallet.address, wallet.privateKey]);
        
        if ((i + 1) % 100 === 0) {
            log(`Created ${i + 1}/${count} new wallets`);
        }
    }
    
    const allWallets = [...existingWallets, ...newWallets];
    saveWallets(allWallets);
    
    log(`✅ Successfully created ${count} new wallets`);
    log(`📊 Total wallets: ${allWallets.length} (${existingWallets.length} existing + ${newWallets.length} new)`);
    
    return allWallets;
}


async function getContractAddress(tokenAddress, ownerAddress, deployerContractAddress = contracts.deployerContract) {
    try {
        console.log(`Retrieving contract address for:`);
        console.log(`Token: ${tokenAddress}`);
        console.log(`Owner: ${ownerAddress}`);
        console.log(`Deployer Contract: ${deployerContractAddress}`);
        
        // Create contract instance (read-only, no signer needed)
        const deployerContract = new ethers.Contract(deployerContractAddress, turboDeployerAbi, provider);
        
        // Call the contract to get the deployed contract address
        const contractAddress = await deployerContract.getContractByOwnerAndToken(ownerAddress, tokenAddress);
        
        // Check if a contract was found (address(0) means no contract deployed)
        if (contractAddress === ethers.constants.AddressZero) {
            console.log(`❌ No contract found for this token and owner combination`);
            return {
                success: false,
                reason: 'no_contract_found',
                contractAddress: null
            };
        }
        
        console.log(`✅ Contract found: ${contractAddress}`);
        
        // Optional: Verify the contract exists by checking if it has code
        try {
            const code = await provider.getCode(contractAddress);
            if (code === '0x') {
                console.log(`⚠️  Warning: Contract address found but no code deployed at address`);
                return {
                    success: false,
                    reason: 'no_code_at_address',
                    contractAddress: contractAddress
                };
            }
            console.log(`✅ Contract verified - code exists at address`);
        } catch (codeError) {
            console.log(`Could not verify contract code: ${codeError.message}`);
        }
        
        return {
            success: true,
            contractAddress: contractAddress,
            tokenAddress: tokenAddress,
            ownerAddress: ownerAddress
        };
        
    } catch (err) {
        console.error(`Error retrieving contract address: ${err.message}`);
        
        // Handle specific error types
        if (err.code === 'CALL_EXCEPTION') {
            return {
                success: false,
                reason: 'contract_call_failed',
                error: err.message,
                contractAddress: null
            };
        } else if (err.code === 'NETWORK_ERROR') {
            return {
                success: false,
                reason: 'network_error',
                error: err.message,
                contractAddress: null
            };
        }
        
        return {
            success: false,
            reason: 'unknown_error',
            error: err.message,
            contractAddress: null
        };
    }
}

// Helper function to get contract address using main wallet as owner
async function getContractAddressForMainWallet(tokenAddress) {
    if (!config.fundingPrivateKey) {
        throw new Error('PK_MAIN not configured in .env file');
    }
    
    const mainWallet = new ethers.Wallet(config.fundingPrivateKey);
    return await getContractAddress(tokenAddress, mainWallet.address);
}

// Helper function to check if a contract is deployed for a token by the main wallet
async function hasContractDeployed(tokenAddress, deployerContractAddress) {
    try {
        if (!config.fundingPrivateKey) {
            throw new Error('PK_MAIN not configured in .env file');
        }
        
        const mainWallet = new ethers.Wallet(config.fundingPrivateKey);
        const deployerContract = new ethers.Contract(deployerContractAddress, LockyFiDeployerAbi, provider);
        
        const hasDeployed = await deployerContract.hasDeployed(mainWallet.address, tokenAddress);
        
        console.log(`Contract deployed check - Token: ${tokenAddress}, Has deployed: ${hasDeployed}`);
        
        return {
            success: true,
            hasDeployed: hasDeployed,
            tokenAddress: tokenAddress,
            ownerAddress: mainWallet.address
        };
        
    } catch (err) {
        console.error(`Error checking if contract is deployed: ${err.message}`);
        return {
            success: false,
            error: err.message,
            hasDeployed: false
        };
    }
}

async function createWalletsToTarget(targetCount) {
    const existingWallets = loadWallets();
    const currentCount = existingWallets.length;
    
    log(`Current wallet count: ${currentCount}`);
    log(`Target wallet count: ${targetCount}`);
    
    if (currentCount >= targetCount) {
        log(`✅ Already have ${currentCount} wallets (target: ${targetCount})`);
        return existingWallets;
    }
    
    const needed = targetCount - currentCount;
    log(`Creating ${needed} additional wallets...`);
    
    return await createWallets(needed);
}

async function checkWallets() {
    const wallets = loadWallets();
    
    if (wallets.length === 0) {
        log("No wallets found. Use 'create' command to generate wallets.");
        return;
    }
    
    log(`📊 Wallet Statistics:`);
    log(`Total wallets: ${wallets.length}`);
    log(`First wallet: ${wallets[0][0]}`);
    log(`Last wallet: ${wallets[wallets.length - 1][0]}`);
    const mainWallet = new ethers.Wallet(config.fundingPrivateKey)
    const mainwalletbalance = await provider.getBalance(mainWallet.address);

    console.log(`Main Wallet: ${mainWallet.address} balance is: ${ethers.utils.formatUnits(mainwalletbalance, 18)}`)
    
    // Check balances of first few wallets as sample
    log(`Checking balances of first 3 wallets...`);
    for (let i = 0; i < Math.min(3, wallets.length); i++) {
        try {
            const balance = await provider.getBalance(wallets[i][0]);
            log(`Wallet ${i}: ${wallets[i][0]} - ${ethers.utils.formatEther(balance)} ETH`);
        } catch (err) {
            errorLog(`Failed to check balance for wallet ${i}: ${err.message}`);
        }
    }
}


module.exports = {
    config,
    provider,
    contracts,
    routerAbi,
    airdropAbi,
    multicallAbi,
    turboDeployerAbi,
    volumeSwapAbi,
    ERC20_ABI,
    defaultTokens,
    LockyFiDeployerAbi,
    addTokens,
    addSingleToken,
    loadTokens,
    saveTokens,
    saveWallets,
    log,
    errorLog,
    loadWallets,
    getTokenByAddress,
    getTokensBySymbol,
    sleep,
    randomIndex,
    createWallets,
    savePrivateKey,
    analyzeTransactionGas,
    analyzeGasPrice,
    getGasEstimates,
    getContractAddress,
    createWalletsToTarget,
    checkWallets
};