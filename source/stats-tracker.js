const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Statistics file paths
const STATS_DIR = path.join(__dirname, 'stats');
const DAILY_STATS_FILE = path.join(STATS_DIR, 'daily_stats.json');
const LIVE_STATS_FILE = path.join(STATS_DIR, 'live_stats.json');
const MONTHLY_STATS_FILE = path.join(STATS_DIR, 'monthly_stats.json');

// Ensure stats directory exists
if (!fs.existsSync(STATS_DIR)) {
    fs.mkdirSync(STATS_DIR, { recursive: true });
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth() {
    return new Date().toISOString().substring(0, 7);
}

/**
 * Load existing stats from file or return default structure
 */
function loadStats(filePath, defaultStructure) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn(`Warning: Could not load stats from ${filePath}:`, error.message);
    }
    return defaultStructure;
}

/**
 * Save stats to file with error handling
 */
function saveStats(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error saving stats to ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Initialize default daily stats structure
 */
function getDefaultDailyStats() {
    return {
        lastUpdated: new Date().toISOString(),
        dates: {}
    };
}

/**
 * Initialize default live stats structure
 */
function getDefaultLiveStats() {
    return {
        lastUpdated: new Date().toISOString(),
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        gasLimitExceeded: 0,
        successRate: 0,
        totalGasUsed: "0",
        totalGasCost: "0",
        fundedWallets: 0,
        totalBalance: "0",
        averageGasPerTx: "0",
        totalTokensSwapped: 0,
        operationTypes: {
            V2_swaps: 0,
            V3_swaps: 0,
            multiswaps: 0,
            airdrops: 0,
            volume_operations: 0,
            deployments: 0,
            withdrawals: 0
        },
        dailyBreakdown: {
            today: getCurrentDate(),
            todayStats: {
                transactions: 0,
                gasUsed: "0",
                gasCost: "0",
                successful: 0,
                failed: 0
            }
        }
    };
}

/**
 * Initialize default monthly stats structure
 */
function getDefaultMonthlyStats() {
    return {
        lastUpdated: new Date().toISOString(),
        months: {}
    };
}

/**
 * Get default day stats structure
 */
function getDefaultDayStats() {
    return {
        date: getCurrentDate(),
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        gasLimitExceeded: 0,
        totalGasUsed: "0",
        totalGasCost: "0",
        averageGasPerTx: "0",
        operationTypes: {
            V2_swaps: 0,
            V3_swaps: 0,
            multiswaps: 0,
            airdrops: 0,
            volume_operations: 0,
            deployments: 0,
            withdrawals: 0
        },
        hourlyBreakdown: {},
        firstTransaction: null,
        lastTransaction: null
    };
}

/**
 * Main function to track transaction statistics
 * @param {Object} transactionData - Transaction data to track
 * @param {boolean} success - Whether the transaction was successful
 * @param {string} gasUsed - Gas used in the transaction (as string to handle BigNumber)
 * @param {string} gasCost - Gas cost in ETH (as string to handle BigNumber)
 * @param {string} operationType - Type of operation (V2_swaps, V3_swaps, etc.)
 * @param {number} tokensSwapped - Number of tokens swapped (optional)
 * @param {Object} additionalData - Additional data to track (optional)
 */
async function trackTransaction({
    success = true,
    gasUsed = "0",
    gasCost = "0",
    operationType = "unknown",
    tokensSwapped = 0,
    walletAddress = null,
    tokenAddress = null,
    transactionHash = null,
    additionalData = {}
}) {
    try {
        const now = new Date();
        const currentDate = getCurrentDate();
        const currentMonth = getCurrentMonth();
        const currentHour = now.getHours();
        const timestamp = now.toISOString();

        // Load existing stats
        const dailyStats = loadStats(DAILY_STATS_FILE, getDefaultDailyStats());
        const liveStats = loadStats(LIVE_STATS_FILE, getDefaultLiveStats());
        const monthlyStats = loadStats(MONTHLY_STATS_FILE, getDefaultMonthlyStats());

        // Ensure current date exists in daily stats
        if (!dailyStats.dates[currentDate]) {
            dailyStats.dates[currentDate] = getDefaultDayStats();
        }

        // Ensure current month exists in monthly stats
        if (!monthlyStats.months[currentMonth]) {
            monthlyStats.months[currentMonth] = {
                month: currentMonth,
                totalTransactions: 0,
                successfulTransactions: 0,
                failedTransactions: 0,
                gasLimitExceeded: 0,
                totalGasUsed: "0",
                totalGasCost: "0",
                operationTypes: {
                    V2_swaps: 0,
                    V3_swaps: 0,
                    multiswaps: 0,
                    airdrops: 0,
                    volume_operations: 0,
                    deployments: 0,
                    withdrawals: 0
                },
                days: {}
            };
        }

        // Convert gas values to BigNumber for accurate arithmetic
        const gasUsedBN = ethers.BigNumber.from(gasUsed || "0");
        const gasCostBN = ethers.utils.parseUnits(gasCost || "0", 18);

        // Update daily stats
        const dayStats = dailyStats.dates[currentDate];
        dayStats.totalTransactions += 1;
        
        if (success) {
            dayStats.successfulTransactions += 1;
            liveStats.successfulTransactions += 1;
            monthlyStats.months[currentMonth].successfulTransactions += 1;
        } else {
            dayStats.failedTransactions += 1;
            liveStats.failedTransactions += 1;
            monthlyStats.months[currentMonth].failedTransactions += 1;
            
            // Check if failure was due to gas limit
            if (additionalData.gasLimitExceeded) {
                dayStats.gasLimitExceeded += 1;
                liveStats.gasLimitExceeded += 1;
                monthlyStats.months[currentMonth].gasLimitExceeded += 1;
            }
        }

        // Update gas statistics
        const currentDayGasUsed = ethers.BigNumber.from(dayStats.totalGasUsed || "0");
        const currentDayGasCost = ethers.utils.parseUnits(dayStats.totalGasCost || "0", 18);
        
        dayStats.totalGasUsed = currentDayGasUsed.add(gasUsedBN).toString();
        dayStats.totalGasCost = ethers.utils.formatEther(currentDayGasCost.add(gasCostBN));

        // Calculate average gas per transaction for the day
        if (dayStats.totalTransactions > 0) {
            const avgGas = ethers.BigNumber.from(dayStats.totalGasUsed).div(dayStats.totalTransactions);
            dayStats.averageGasPerTx = avgGas.toString();
        }

        // Update operation type counters
        if (dayStats.operationTypes[operationType] !== undefined) {
            dayStats.operationTypes[operationType] += 1;
        } else {
            dayStats.operationTypes[operationType] = 1;
        }

        // Update hourly breakdown
        if (!dayStats.hourlyBreakdown[currentHour]) {
            dayStats.hourlyBreakdown[currentHour] = {
                hour: currentHour,
                transactions: 0,
                successful: 0,
                failed: 0,
                gasUsed: "0",
                gasCost: "0"
            };
        }

        const hourStats = dayStats.hourlyBreakdown[currentHour];
        hourStats.transactions += 1;
        if (success) {
            hourStats.successful += 1;
        } else {
            hourStats.failed += 1;
        }

        const currentHourGasUsed = ethers.BigNumber.from(hourStats.gasUsed || "0");
        const currentHourGasCost = ethers.utils.parseUnits(hourStats.gasCost || "0", 18);
        
        hourStats.gasUsed = currentHourGasUsed.add(gasUsedBN).toString();
        hourStats.gasCost = ethers.utils.formatEther(currentHourGasCost.add(gasCostBN));

        // Update first/last transaction timestamps
        if (!dayStats.firstTransaction) {
            dayStats.firstTransaction = timestamp;
        }
        dayStats.lastTransaction = timestamp;

        // Update live stats
        liveStats.totalTransactions += 1;
        
        const currentLiveGasUsed = ethers.BigNumber.from(liveStats.totalGasUsed || "0");
        const currentLiveGasCost = ethers.utils.parseUnits(liveStats.totalGasCost || "0", 18);
        
        liveStats.totalGasUsed = currentLiveGasUsed.add(gasUsedBN).toString();
        liveStats.totalGasCost = ethers.utils.formatEther(currentLiveGasCost.add(gasCostBN));

        // Calculate live success rate
        if (liveStats.totalTransactions > 0) {
            liveStats.successRate = ((liveStats.successfulTransactions / liveStats.totalTransactions) * 100).toFixed(2);
        }

        // Calculate average gas per transaction (live)
        if (liveStats.totalTransactions > 0) {
            const avgGasLive = ethers.BigNumber.from(liveStats.totalGasUsed).div(liveStats.totalTransactions);
            liveStats.averageGasPerTx = avgGasLive.toString();
        }

        // Update operation types in live stats
        if (liveStats.operationTypes[operationType] !== undefined) {
            liveStats.operationTypes[operationType] += 1;
        }

        // Update tokens swapped
        liveStats.totalTokensSwapped += tokensSwapped || 0;

        // Update daily breakdown in live stats
        if (liveStats.dailyBreakdown.today !== currentDate) {
            // New day, reset today stats
            liveStats.dailyBreakdown.today = currentDate;
            liveStats.dailyBreakdown.todayStats = {
                transactions: 0,
                gasUsed: "0",
                gasCost: "0",
                successful: 0,
                failed: 0
            };
        }

        const todayStats = liveStats.dailyBreakdown.todayStats;
        todayStats.transactions += 1;
        if (success) {
            todayStats.successful += 1;
        } else {
            todayStats.failed += 1;
        }

        const currentTodayGasUsed = ethers.BigNumber.from(todayStats.gasUsed || "0");
        const currentTodayGasCost = ethers.utils.parseUnits(todayStats.gasCost || "0", 18);
        
        todayStats.gasUsed = currentTodayGasUsed.add(gasUsedBN).toString();
        todayStats.gasCost = ethers.utils.formatEther(currentTodayGasCost.add(gasCostBN));

        // Update monthly stats
        monthlyStats.months[currentMonth].totalTransactions += 1;
        
        const currentMonthGasUsed = ethers.BigNumber.from(monthlyStats.months[currentMonth].totalGasUsed || "0");
        const currentMonthGasCost = ethers.utils.parseUnits(monthlyStats.months[currentMonth].totalGasCost || "0", 18);
        
        monthlyStats.months[currentMonth].totalGasUsed = currentMonthGasUsed.add(gasUsedBN).toString();
        monthlyStats.months[currentMonth].totalGasCost = ethers.utils.formatEther(currentMonthGasCost.add(gasCostBN));

        if (monthlyStats.months[currentMonth].operationTypes[operationType] !== undefined) {
            monthlyStats.months[currentMonth].operationTypes[operationType] += 1;
        }

        // Add daily entry to monthly stats
        if (!monthlyStats.months[currentMonth].days[currentDate]) {
            monthlyStats.months[currentMonth].days[currentDate] = {
                transactions: 0,
                gasUsed: "0",
                gasCost: "0"
            };
        }

        const monthDayStats = monthlyStats.months[currentMonth].days[currentDate];
        monthDayStats.transactions += 1;
        
        const monthDayGasUsed = ethers.BigNumber.from(monthDayStats.gasUsed || "0");
        const monthDayGasCost = ethers.utils.parseUnits(monthDayStats.gasCost || "0", 18);
        
        monthDayStats.gasUsed = monthDayGasUsed.add(gasUsedBN).toString();
        monthDayStats.gasCost = ethers.utils.formatEther(monthDayGasCost.add(gasCostBN));

        // Update timestamps
        dailyStats.lastUpdated = timestamp;
        liveStats.lastUpdated = timestamp;
        monthlyStats.lastUpdated = timestamp;

        // Save all stats files
        const dailySaved = saveStats(DAILY_STATS_FILE, dailyStats);
        const liveSaved = saveStats(LIVE_STATS_FILE, liveStats);
        const monthlySaved = saveStats(MONTHLY_STATS_FILE, monthlyStats);

        if (dailySaved && liveSaved && monthlySaved) {
            console.log(`📊 Stats updated: ${success ? '✅' : '❌'} ${operationType} | Gas: ${gasCost} ETH | Total today: ${todayStats.transactions}`);
            return true;
        } else {
            console.error('❌ Failed to save some stats files');
            return false;
        }

    } catch (error) {
        console.error('Error tracking transaction stats:', error.message);
        return false;
    }
}

/**
 * Update wallet funding statistics
 * @param {number} walletCount - Number of wallets funded
 * @param {string} totalBalance - Total balance in ETH
 */
async function updateWalletStats(walletCount, totalBalance = "0") {
    try {
        const liveStats = loadStats(LIVE_STATS_FILE, getDefaultLiveStats());
        
        liveStats.fundedWallets = walletCount;
        liveStats.totalBalance = totalBalance;
        liveStats.lastUpdated = new Date().toISOString();

        return saveStats(LIVE_STATS_FILE, liveStats);
    } catch (error) {
        console.error('Error updating wallet stats:', error.message);
        return false;
    }
}

/**
 * Get current live statistics
 * @returns {Object} Current live statistics
 */
function getLiveStats() {
    return loadStats(LIVE_STATS_FILE, getDefaultLiveStats());
}

/**
 * Get daily statistics
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns {Object} Daily statistics
 */
function getDailyStats(date = null) {
    const targetDate = date || getCurrentDate();
    const dailyStats = loadStats(DAILY_STATS_FILE, getDefaultDailyStats());
    
    return dailyStats.dates[targetDate] || getDefaultDayStats();
}

/**
 * Get monthly statistics
 * @param {string} month - Month in YYYY-MM format (optional, defaults to current month)
 * @returns {Object} Monthly statistics
 */
function getMonthlyStats(month = null) {
    const targetMonth = month || getCurrentMonth();
    const monthlyStats = loadStats(MONTHLY_STATS_FILE, getDefaultMonthlyStats());
    
    return monthlyStats.months[targetMonth] || {
        month: targetMonth,
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        gasLimitExceeded: 0,
        totalGasUsed: "0",
        totalGasCost: "0",
        operationTypes: {},
        days: {}
    };
}

/**
 * Get statistics summary for dashboard
 * @returns {Object} Statistics summary
 */
function getStatsSummary() {
    const liveStats = getLiveStats();
    const todayStats = getDailyStats();
    const thisMonthStats = getMonthlyStats();

    return {
        live: {
            totalTransactions: liveStats.totalTransactions,
            successfulTransactions: liveStats.successfulTransactions,
            failedTransactions: liveStats.failedTransactions,
            successRate: liveStats.successRate,
            totalGasCost: liveStats.totalGasCost,
            fundedWallets: liveStats.fundedWallets,
            totalBalance: liveStats.totalBalance,
            lastUpdated: liveStats.lastUpdated
        },
        today: {
            totalTransactions: todayStats.totalTransactions,
            successfulTransactions: todayStats.successfulTransactions,
            failedTransactions: todayStats.failedTransactions,
            totalGasCost: todayStats.totalGasCost,
            operationTypes: todayStats.operationTypes,
            hourlyBreakdown: todayStats.hourlyBreakdown
        },
        thisMonth: {
            totalTransactions: thisMonthStats.totalTransactions,
            successfulTransactions: thisMonthStats.successfulTransactions,
            failedTransactions: thisMonthStats.failedTransactions,
            totalGasCost: thisMonthStats.totalGasCost,
            operationTypes: thisMonthStats.operationTypes
        }
    };
}

/**
 * Reset statistics (use with caution)
 * @param {string} type - Type of stats to reset ('daily', 'live', 'monthly', 'all')
 */
function resetStats(type = 'all') {
    try {
        let resetCount = 0;

        if (type === 'daily' || type === 'all') {
            if (saveStats(DAILY_STATS_FILE, getDefaultDailyStats())) {
                resetCount++;
                console.log('✅ Daily stats reset');
            }
        }

        if (type === 'live' || type === 'all') {
            if (saveStats(LIVE_STATS_FILE, getDefaultLiveStats())) {
                resetCount++;
                console.log('✅ Live stats reset');
            }
        }

        if (type === 'monthly' || type === 'all') {
            if (saveStats(MONTHLY_STATS_FILE, getDefaultMonthlyStats())) {
                resetCount++;
                console.log('✅ Monthly stats reset');
            }
        }

        return resetCount > 0;
    } catch (error) {
        console.error('Error resetting stats:', error.message);
        return false;
    }
}

/**
 * Export historical data for analysis
 * @param {number} days - Number of days to export (optional, defaults to 30)
 * @returns {Object} Historical data
 */
function exportHistoricalData(days = 30) {
    try {
        const dailyStats = loadStats(DAILY_STATS_FILE, getDefaultDailyStats());
        const monthlyStats = loadStats(MONTHLY_STATS_FILE, getDefaultMonthlyStats());
        const liveStats = loadStats(LIVE_STATS_FILE, getDefaultLiveStats());

        // Get last N days
        const historicalDays = {};
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (dailyStats.dates[dateStr]) {
                historicalDays[dateStr] = dailyStats.dates[dateStr];
            }
        }

        return {
            exportDate: new Date().toISOString(),
            daysExported: days,
            historicalDays,
            monthlyStats: monthlyStats.months,
            currentLiveStats: liveStats
        };
    } catch (error) {
        console.error('Error exporting historical data:', error.message);
        return null;
    }
}

// Export functions
module.exports = {
    trackTransaction,
    updateWalletStats,
    getLiveStats,
    getDailyStats,
    getMonthlyStats,
    getStatsSummary,
    resetStats,
    exportHistoricalData,
    getCurrentDate,
    getCurrentMonth
};