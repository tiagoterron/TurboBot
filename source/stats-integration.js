// stats-integration.js
// Helper functions to integrate statistics tracking into existing functions

const { trackTransaction, updateWalletStats } = require('./stats-tracker');

/**
 * Wrapper for executeSwap to track statistics
 */
async function executeSwapWithStats(originalExecuteSwap, ...args) {
    const startTime = Date.now();
    
    try {
        const result = await originalExecuteSwap(...args);
        
        // Track the transaction
        await trackTransaction({
            success: result?.success || false,
            gasUsed: result?.gasUsed || "0",
            gasCost: result?.actualGasCost || result?.estimatedGasCost || "0",
            operationType: "V2_swaps",
            tokensSwapped: 1,
            walletAddress: result?.walletAddress || null,
            transactionHash: result?.txHash || result?.hash || null,
            additionalData: {
                gasLimitExceeded: result?.reason === 'gas_cost_exceeds_max',
                executionTime: Date.now() - startTime,
                walletIndex: result?.walletIndex || null,
                gasEfficiency: result?.gasEfficiency || null
            }
        });

        return result;
    } catch (error) {
        // Track failed transaction
        await trackTransaction({
            success: false,
            gasUsed: "0",
            gasCost: "0",
            operationType: "V2_swaps",
            additionalData: {
                error: error.message,
                executionTime: Date.now() - startTime
            }
        });
        
        throw error;
    }
}

/**
 * Wrapper for executeV3Swap to track statistics
 */
async function executeV3SwapWithStats(originalExecuteV3Swap, ...args) {
    const startTime = Date.now();
    
    try {
        const result = await originalExecuteV3Swap(...args);
        
        await trackTransaction({
            success: result?.success || false,
            gasUsed: result?.gasUsed || "0",
            gasCost: result?.actualGasCost || result?.estimatedGasCost || "0",
            operationType: "V3_swaps",
            tokensSwapped: 1,
            walletAddress: result?.walletAddress || null,
            transactionHash: result?.txHash || result?.hash || null,
            additionalData: {
                gasLimitExceeded: result?.reason === 'gas_cost_exceeds_max',
                executionTime: Date.now() - startTime,
                walletIndex: result?.walletIndex || null,
                gasEfficiency: result?.gasEfficiency || null,
                swapType: 'V3'
            }
        });

        return result;
    } catch (error) {
        await trackTransaction({
            success: false,
            gasUsed: "0",
            gasCost: "0",
            operationType: "V3_swaps",
            additionalData: {
                error: error.message,
                executionTime: Date.now() - startTime
            }
        });
        
        throw error;
    }
}

/**
 * Wrapper for executeMultiSwap to track statistics
 */
async function executeMultiSwapWithStats(originalExecuteMultiSwap, ...args) {
    const startTime = Date.now();
    
    try {
        const result = await originalExecuteMultiSwap(...args);
        
        await trackTransaction({
            success: result?.success || false,
            gasUsed: result?.gasUsed || "0",
            gasCost: result?.actualGasCost || result?.estimatedGasCost || "0",
            operationType: "multiswaps",
            tokensSwapped: result?.tokensSwapped || 0,
            walletAddress: result?.walletAddress || null,
            transactionHash: result?.txHash || null,
            additionalData: {
                gasLimitExceeded: result?.reason === 'gas_cost_exceeds_max',
                executionTime: Date.now() - startTime,
                walletIndex: result?.walletIndex || null,
                gasEfficiency: result?.gasEfficiency || null,
                swapType: result?.swapType || 'V2'
            }
        });

        return result;
    } catch (error) {
        await trackTransaction({
            success: false,
            gasUsed: "0",
            gasCost: "0",
            operationType: "multiswaps",
            additionalData: {
                error: error.message,
                executionTime: Date.now() - startTime
            }
        });
        
        throw error;
    }
}

/**
 * Wrapper for sendAirdropWallets to track statistics
 */
async function sendAirdropWalletsWithStats(originalSendAirdropWallets, ...args) {
    const startTime = Date.now();
    
    try {
        const result = await originalSendAirdropWallets(...args);
        
        await trackTransaction({
            success: result?.success || false,
            gasUsed: result?.gasUsed || "0",
            gasCost: result?.gasCost || "0",
            operationType: "airdrops",
            tokensSwapped: 0,
            transactionHash: result?.transactionHash || null,
            additionalData: {
                executionTime: Date.now() - startTime,
                recipients: result?.recipients || 0,
                totalAmount: result?.totalAmount || "0",
                amountPerWallet: result?.amountPerWallet || "0"
            }
        });

        return result;
    } catch (error) {
        await trackTransaction({
            success: false,
            gasUsed: "0",
            gasCost: "0",
            operationType: "airdrops",
            additionalData: {
                error: error.message,
                executionTime: Date.now() - startTime
            }
        });
        
        throw error;
    }
}

/**
 * Wrapper for deployContract to track statistics
 */
async function deployContractWithStats(originalDeployContract, ...args) {
    const startTime = Date.now();
    
    try {
        const result = await originalDeployContract(...args);
        
        await trackTransaction({
            success: result?.success || false,
            gasUsed: result?.gasUsed || "0",
            gasCost: result?.gasCost || "0",
            operationType: "deployments",
            transactionHash: result?.txHash || null,
            tokenAddress: result?.tokenAddress || args[0] || null,
            additionalData: {
                executionTime: Date.now() - startTime,
                deployedContract: result?.deployedContract || null,
                owner: result?.owner || null
            }
        });

        return result;
    } catch (error) {
        await trackTransaction({
            success: false,
            gasUsed: "0",
            gasCost: "0",
            operationType: "deployments",
            additionalData: {
                error: error.message,
                executionTime: Date.now() - startTime,
                tokenAddress: args[0] || null
            }
        });
        
        throw error;
    }
}

/**
 * Wrapper for volumeBotV2/V3 to track statistics
 */
async function volumeBotWithStats(originalVolumeBot, operationType, ...args) {
    const startTime = Date.now();
    
    try {
        const result = await originalVolumeBot(...args);
        
        await trackTransaction({
            success: result?.success || false,
            gasUsed: result?.gasUsed || "0",
            gasCost: result?.actualGasCost || result?.estimatedGasCost || "0",
            operationType: "volume_operations",
            tokensSwapped: 1,
            walletAddress: result?.walletAddress || null,
            transactionHash: result?.txHash || null,
            additionalData: {
                gasLimitExceeded: result?.reason === 'gas_cost_exceeds_max',
                executionTime: Date.now() - startTime,
                volumeType: operationType,
                walletIndex: result?.walletIndex || null,
                gasEfficiency: result?.gasEfficiency || null
            }
        });

        return result;
    } catch (error) {
        await trackTransaction({
            success: false,
            gasUsed: "0",
            gasCost: "0",
            operationType: "volume_operations",
            additionalData: {
                error: error.message,
                executionTime: Date.now() - startTime,
                volumeType: operationType
            }
        });
        
        throw error;
    }
}

/**
 * Wrapper for withdrawFromContract to track statistics
 */
async function withdrawFromContractWithStats(originalWithdrawFromContract, ...args) {
    const startTime = Date.now();
    
    try {
        const result = await originalWithdrawFromContract(...args);
        
        await trackTransaction({
            success: result?.success || false,
            gasUsed: result?.gasUsed || "0",
            gasCost: result?.gasCost || "0",
            operationType: "withdrawals",
            transactionHash: result?.txHash || null,
            additionalData: {
                executionTime: Date.now() - startTime,
                ethWithdrawn: result?.ethWithdrawn || "0",
                tokensWithdrawn: result?.tokensWithdrawn || "0",
                tokenSymbol: result?.tokenSymbol || null,
                netETHGain: result?.netETHGain || "0"
            }
        });

        return result;
    } catch (error) {
        await trackTransaction({
            success: false,
            gasUsed: "0",
            gasCost: "0",
            operationType: "withdrawals",
            additionalData: {
                error: error.message,
                executionTime: Date.now() - startTime
            }
        });
        
        throw error;
    }
}

/**
 * Track batch operation statistics
 */
async function trackBatchOperation(operationType, batchResults) {
    try {
        const {
            totalProcessed,
            successfulSwaps,
            failedSwaps,
            gasLimitExceeded,
            totalTokensSwapped,
            batchesProcessed,
            successRate
        } = batchResults;

        // Track overall batch summary
        await trackTransaction({
            success: successfulSwaps > 0,
            gasUsed: "0", // Batch operations don't have individual gas usage
            gasCost: "0", // Individual transactions are tracked separately
            operationType: `${operationType}_batch`,
            tokensSwapped: totalTokensSwapped || 0,
            additionalData: {
                batchSummary: true,
                totalProcessed,
                successfulSwaps,
                failedSwaps,
                gasLimitExceeded,
                batchesProcessed,
                successRate,
                operationType
            }
        });

        console.log(`📊 Batch operation tracked: ${operationType} - ${successfulSwaps}/${totalProcessed} successful`);
        return true;
    } catch (error) {
        console.error('Error tracking batch operation:', error.message);
        return false;
    }
}

/**
 * Update wallet funding statistics after wallet operations
 */
async function updateWalletStatsAfterOperation(wallets) {
    try {
        if (!wallets || !Array.isArray(wallets)) {
            return false;
        }

        // Count funded wallets (assuming wallets with private keys are funded)
        const fundedCount = wallets.filter(wallet => wallet && wallet.length >= 2).length;
        
        // For total balance, we'd need to check each wallet's balance
        // This is a placeholder - you might want to implement actual balance checking
        const totalBalance = "0"; // This would require async balance checking
        
        await updateWalletStats(fundedCount, totalBalance);
        return true;
    } catch (error) {
        console.error('Error updating wallet stats:', error.message);
        return false;
    }
}

/**
 * Enhanced logging function that includes statistics
 */
function logWithStats(message, additionalData = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    
    if (Object.keys(additionalData).length > 0) {
        console.log('📊 Additional data:', JSON.stringify(additionalData, null, 2));
    }
}

/**
 * Batch wrapper function to track multiple operations
 */
async function executeBatchWithStats(operationType, batchFunction, ...args) {
    const startTime = Date.now();
    
    try {
        console.log(`🚀 Starting ${operationType} batch operation...`);
        
        const result = await batchFunction(...args);
        
        // Track the batch operation
        await trackBatchOperation(operationType, result);
        
        const executionTime = Date.now() - startTime;
        console.log(`✅ ${operationType} batch completed in ${executionTime}ms`);
        
        return result;
    } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`❌ ${operationType} batch failed after ${executionTime}ms:`, error.message);
        
        // Track failed batch operation
        await trackTransaction({
            success: false,
            gasUsed: "0",
            gasCost: "0",
            operationType: `${operationType}_batch`,
            additionalData: {
                error: error.message,
                executionTime,
                batchFailed: true
            }
        });
        
        throw error;
    }
}

/**
 * Create a comprehensive stats wrapper for any function
 */
function createStatsWrapper(originalFunction, operationType, options = {}) {
    return async function(...args) {
        const startTime = Date.now();
        const functionName = originalFunction.name || 'unknown';
        
        try {
            const result = await originalFunction.apply(this, args);
            
            // Extract stats from result based on operation type
            const statsData = {
                success: result?.success !== false,
                gasUsed: result?.gasUsed || result?.gasLimit || "0",
                gasCost: result?.actualGasCost || result?.estimatedGasCost || result?.gasCost || "0",
                operationType,
                tokensSwapped: result?.tokensSwapped || (operationType.includes('swap') ? 1 : 0),
                walletAddress: result?.walletAddress || result?.newWalletAddress || null,
                transactionHash: result?.txHash || result?.transactionHash || result?.hash || null,
                tokenAddress: result?.tokenAddress || args[1] || null,
                additionalData: {
                    functionName,
                    executionTime: Date.now() - startTime,
                    gasLimitExceeded: result?.reason === 'gas_cost_exceeds_max',
                    walletIndex: result?.walletIndex || null,
                    gasEfficiency: result?.gasEfficiency || null,
                    ...options.additionalData
                }
            };

            await trackTransaction(statsData);
            return result;
            
        } catch (error) {
            await trackTransaction({
                success: false,
                gasUsed: "0",
                gasCost: "0",
                operationType,
                additionalData: {
                    functionName,
                    error: error.message,
                    executionTime: Date.now() - startTime,
                    ...options.additionalData
                }
            });
            
            throw error;
        }
    };
}

/**
 * Easy integration function to wrap existing functions
 */
function integrateStats(functions) {
    const wrappedFunctions = {};
    
    for (const [name, config] of Object.entries(functions)) {
        const { originalFunction, operationType, options = {} } = config;
        wrappedFunctions[name] = createStatsWrapper(originalFunction, operationType, options);
    }
    
    return wrappedFunctions;
}

module.exports = {
    executeSwapWithStats,
    executeV3SwapWithStats,
    executeMultiSwapWithStats,
    sendAirdropWalletsWithStats,
    deployContractWithStats,
    volumeBotWithStats,
    withdrawFromContractWithStats,
    trackBatchOperation,
    updateWalletStatsAfterOperation,
    logWithStats,
    executeBatchWithStats,
    createStatsWrapper,
    integrateStats
};