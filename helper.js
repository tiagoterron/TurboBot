//V 1.0.8
const { ethers, utils } = require('ethers');
const fs = require('fs');
const path = require('path');
const { start } = require('repl');
require('dotenv').config();

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


module.exports = {
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
    getGasEstimates
};