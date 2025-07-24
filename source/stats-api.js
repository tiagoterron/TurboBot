const { 
    getLiveStats, 
    getDailyStats, 
    getMonthlyStats, 
    getStatsSummary,
    exportHistoricalData 
} = require('./stats-tracker');

app.get('/api/stats/live', (req, res) => {
    try {
        const stats = getLiveStats();
        
        // Format for your frontend dashboard
        const response = {
            successful: stats.successfulTransactions,
            failed: stats.failedTransactions,
            successRate: `${stats.successRate}%`,
            gasUsed: `${parseFloat(stats.totalGasCost).toFixed(6)}`,
            fundedWallets: stats.fundedWallets,
            totalBalance: parseFloat(stats.totalBalance).toFixed(4),
            lastUpdated: stats.lastUpdated,
            totalTransactions: stats.totalTransactions,
            gasLimitExceeded: stats.gasLimitExceeded,
            operationTypes: stats.operationTypes,
            averageGasPerTx: stats.averageGasPerTx
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching live stats:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch live statistics',
            message: error.message 
        });
    }
});

/**
 * GET /api/stats/daily/:date?
 * Returns daily statistics for a specific date (or today if not specified)
 */
app.get('/api/stats/daily/:date?', (req, res) => {
    try {
        const date = req.params.date; // Format: YYYY-MM-DD
        const stats = getDailyStats(date);
        
        const response = {
            date: stats.date,
            successful: stats.successfulTransactions,
            failed: stats.failedTransactions,
            total: stats.totalTransactions,
            successRate: stats.totalTransactions > 0 ? 
                ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(2) + '%' : '0%',
            gasUsed: `${parseFloat(stats.totalGasCost).toFixed(6)}`,
            gasLimitExceeded: stats.gasLimitExceeded,
            operationTypes: stats.operationTypes,
            hourlyBreakdown: stats.hourlyBreakdown,
            averageGasPerTx: stats.averageGasPerTx,
            firstTransaction: stats.firstTransaction,
            lastTransaction: stats.lastTransaction
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching daily stats:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch daily statistics',
            message: error.message 
        });
    }
});

/**
 * GET /api/stats/monthly/:month?
 * Returns monthly statistics for a specific month (or current month if not specified)
 */
app.get('/api/stats/monthly/:month?', (req, res) => {
    try {
        const month = req.params.month; // Format: YYYY-MM
        const stats = getMonthlyStats(month);
        
        const response = {
            month: stats.month,
            successful: stats.successfulTransactions,
            failed: stats.failedTransactions,
            total: stats.totalTransactions,
            successRate: stats.totalTransactions > 0 ? 
                ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(2) + '%' : '0%',
            gasUsed: `${parseFloat(stats.totalGasCost).toFixed(6)}`,
            gasLimitExceeded: stats.gasLimitExceeded,
            operationTypes: stats.operationTypes,
            dailyBreakdown: stats.days
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching monthly stats:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch monthly statistics',
            message: error.message 
        });
    }
});

/**
 * GET /api/stats/summary
 * Returns comprehensive statistics summary for dashboard
 */
app.get('/api/stats/summary', (req, res) => {
    try {
        const summary = getStatsSummary();
        
        // Format for dashboard cards
        const response = {
            cards: {
                successful: {
                    value: summary.live.successfulTransactions,
                    label: "Successful",
                    change: summary.today.successfulTransactions,
                    changeLabel: "today"
                },
                failed: {
                    value: summary.live.failedTransactions,
                    label: "Failed",
                    change: summary.today.failedTransactions,
                    changeLabel: "today"
                },
                successRate: {
                    value: `${summary.live.successRate}%`,
                    label: "Success Rate",
                    change: summary.today.successfulTransactions > 0 ? 
                        ((summary.today.successfulTransactions / summary.today.totalTransactions) * 100).toFixed(1) + '%' : '0%',
                    changeLabel: "today"
                },
                gasUsed: {
                    value: parseFloat(summary.live.totalGasCost).toFixed(6),
                    label: "Gas Used (ETH)",
                    change: parseFloat(summary.today.totalGasCost).toFixed(6),
                    changeLabel: "today"
                },
                fundedWallets: {
                    value: summary.live.fundedWallets,
                    label: "Funded Wallets",
                    change: 0,
                    changeLabel: "active"
                },
                totalBalance: {
                    value: parseFloat(summary.live.totalBalance).toFixed(4),
                    label: "Total Balance",
                    change: 0,
                    changeLabel: "ETH"
                }
            },
            charts: {
                hourlyActivity: summary.today.hourlyBreakdown,
                operationTypes: summary.today.operationTypes,
                monthlyTrend: summary.thisMonth
            },
            lastUpdated: summary.live.lastUpdated
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching summary stats:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch statistics summary',
            message: error.message 
        });
    }
});


module.exports = {
    statsRoutes: app, // Export the router/app
    startStatsAPI,
    frontendIntegration
};