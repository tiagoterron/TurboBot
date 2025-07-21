# 🚀 TurboBot - Enhanced DeFi Automation with Advanced Gas Management

An open-source Node.js automation tool for creating multiple wallets, distributing ETH via airdrops, deploying VolumeSwap contracts, and executing automated token swaps on Base network. Now featuring **advanced gas management**, **configurable timing controls**, and **intelligent transaction optimization** for maximum efficiency and cost control.

> **📢 Open Source Project**: This project is completely open source and free to use. Feel free to fork, modify, and distribute according to your needs!

## ✨ Enhanced Features

- **📝 Wallet Management**: Create thousands of wallets with automatic JSON storage
- **💰 Smart Airdrops**: Distribute ETH with customizable total amounts and batch sizes
- **🏭 Contract Deployment**: Deploy VolumeSwap contracts for any token automatically
- **📊 Volume Generation**: Infinite volume bot with balance validation and monitoring
- **💸 Fund Withdrawal**: Comprehensive withdrawal system for all deployed contracts
- **🔄 Multi-Protocol Swaps**: Support for Uniswap V2, V3, and multi-token swaps
- **⚡ Batch Processing**: Efficient parallel processing with configurable batch sizes
- **🛡️ Error Handling**: Robust error handling with detailed logging
- **🎯 Target-based Creation**: Smart wallet creation to reach exact counts
- **📊 Real-time Monitoring**: Live progress tracking and transaction monitoring
- **🔄 Continuous Automation**: Create, fund, swap, and recover in automated cycles
- **💸 Automatic ETH Recovery**: Smart ETH recovery system to minimize losses

### 🆕 NEW: Advanced Gas Management & Timing Controls

- **⛽ Gas Cost Enforcement**: All functions now respect configurable gas limits
- **🎛️ Timing Controls**: Configurable delays for transactions, batches, and cycles
- **📊 Gas Efficiency Monitoring**: Real-time gas usage and efficiency reporting
- **🚫 Automatic Skipping**: Transactions exceeding gas limits are automatically skipped
- **⚖️ Dynamic Adjustments**: Smart timing adjustments based on success rates
- **💰 Cost Optimization**: Prevent expensive transactions during high gas periods
- **📈 Enhanced Analytics**: Detailed gas cost breakdowns and performance metrics

## 🏗️ Architecture

```
├── install.sh          # Setup and dependency management
├── script.js           # Core automation engine
├── package.json        # Node.js dependencies
├── .env                # Configuration file (now with gas settings)
├── wallets.json        # Generated wallet storage
└── automation.log      # Execution logs
```

## 🚀 Quick Start

### 1. Install on Linux 
```bash
wget -O install.sh "https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/install.sh" && chmod +x install.sh && ./install.sh setup && ./install.sh show_help
```

### 2. Install on MacOS
```bash
curl -o install.sh "https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/install.sh" && chmod +x install.sh && ./install.sh setup && ./install.sh help
```

### 3. Enhanced Configuration
Edit `.env` file with your settings:
```env
# RPC Configuration
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Funding wallet private key (without 0x prefix)
PK_MAIN=your_private_key_here

# Batch Configuration (optional)
DEFAULT_WALLET_COUNT=1000
DEFAULT_CHUNK_SIZE=500
DEFAULT_BATCH_SIZE=50

# 🆕 Enhanced Gas Management Settings
GAS_MAX=0.0000008              # Maximum gas cost per transaction (ETH)
GAS_PRICE_GWEI=1.0            # Force specific gas price (optional)
GAS_LIMIT=300000              # Force specific gas limit (optional)
```

### 4. Basic Usage with Enhanced Controls
```bash
# Create 1000 wallets
node script.js create 1000

# Distribute 5 ETH among all wallets with custom timing
node script.js airdrop-batch 200 5.0 3000

# Deploy VolumeSwap contract for a token
node script.js deploy 0xTokenAddress

# Execute volume generation with timing controls
node script.js volumeV2 0 100 0xTokenAddress 150 3000 1000
```

## 📖 Enhanced Command Reference

### 🎒 Wallet Management
```bash
# Create new wallets (appends to existing)
node script.js create [count]

# Create wallets to reach exact target count
node script.js target [total_count]

# Check wallet statistics and balances
node script.js check
```

### 💰 Enhanced Airdrop Operations
```bash
# Batch airdrops with gas management and timing controls
node script.js airdrop-batch [chunk_size] [total_eth] [delay_between_chunks]

# Airdrop to specific wallet range with gas enforcement
node script.js airdrop [start] [end] [total_eth]

# Examples:
node script.js airdrop-batch 200 10.0 5000    # 10 ETH, 5s between chunks
node script.js airdrop 0 100 0.5              # 0.5 ETH with automatic gas checking
```

### 🏭 Contract Deployment & Management
```bash
# Deploy VolumeSwap contract for any token
node script.js deploy [token_address]

# Examples:
node script.js deploy 0xc849418f46A25D302f55d25c40a82C99404E5245  # Deploy for KIKI
node script.js deploy 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460  # Deploy for TURBO
```

### 📊 Enhanced Volume Generation
```bash
# Run infinite volume bot with advanced controls
node script.js volumeV2 [start] [end] [token] [delay_tx] [delay_cycles] [delay_error]
node script.js volumeV3 [start] [end] [token] [delay_tx] [delay_cycles] [delay_error]

# Parameters:
# delay_tx: Milliseconds between individual transactions (default: 150)
# delay_cycles: Milliseconds between complete cycles (default: 3000)
# delay_error: Milliseconds to wait after errors (default: 1000)

# Examples:
node script.js volumeV2                                    # Default settings
node script.js volumeV2 0 100 0xToken 100 2000 500       # Fast execution
node script.js volumeV2 0 500 0xToken 500 10000 2000     # Conservative execution
node script.js volumeV3 0 200 0xToken 150 5000 1500      # V3 with custom timing

# Features:
# - Automatic gas cost enforcement
# - Skips transactions exceeding gas limits
# - Dynamic timing adjustments based on success rates
# - Real-time gas efficiency monitoring
# - Enhanced error recovery and retry logic
```

### 💸 Enhanced Fund Withdrawal
```bash
# Withdraw from specific contract address with gas management
node script.js withdraw [contract_address] [token_address]

# Withdraw using token address (finds contract automatically)
node script.js withdraw-token [token_address]

# Examples:
node script.js withdraw 0xContractAddress123...                   # Withdraw from specific contract
node script.js withdraw-token 0xc849418f46A25D302f55d25c40a82C99404E5245  # Find and withdraw KIKI contract
```

### 🔄 Enhanced Swap Operations
```bash
# Single token swaps with timing controls
node script.js swap-batch [batch_size] [token] [delay_batches] [delay_tx]
node script.js swap [start] [end] [token_address]

# Multi-token swaps with gas management
node script.js multiswap-batch [batch_size] [tokens] [delay_batches] [delay_tx]
node script.js multiswap [start] [end] [token1,token2,token3]

# Uniswap V3 swaps with enhanced controls
node script.js swapv3-batch [batch_size] [token] [start] [end] [delay_batches] [delay_tx]
node script.js swapv3 [start] [end] [token_address]

# Examples:
node script.js swap-batch 50 0xToken 2000 100           # 50 batch, 2s between batches, 100ms between tx
node script.js multiswap-batch 25 "token1,token2" 3000 150  # Multi-token with custom timing
```

### 🔄 Enhanced Continuous Automation
```bash
# Create wallet, fund, swap multiple tokens, and recover ETH with timing controls
node script.js create-and-swap [tokens] [cycle_delay] [funding_amount]

# Create wallet, fund, swap V3 tokens, and recover ETH with custom settings
node script.js create-and-swapv3 [token] [cycle_delay] [funding_amount]

# Recover ETH from a specific wallet
node script.js recoverETH [private_key] [receiver_address]

# Examples:
node script.js create-and-swap "token1,token2" 5000 0.00001    # 5s cycles, custom funding
node script.js create-and-swapv3 0xToken 3000 0.000008        # 3s cycles, custom amount
```

## ⚙️ Enhanced Gas Management System

### **Automatic Gas Enforcement**
All functions now automatically enforce gas limits to control costs:

```bash
# Set gas limit in .env file
GAS_MAX=0.0000008  # Maximum 0.0000008 ETH per transaction

# Functions automatically skip transactions exceeding this limit
# No manual intervention required - just set your comfort level
```

### **Real-time Gas Monitoring**
```bash
# Example output during operations:
[2025-01-17T10:30:00.000Z] Gas cost: 0.0000006 ETH (within limit: 0.0000008 ETH)
[2025-01-17T10:30:01.000Z] ✅ Transaction proceeding...
[2025-01-17T10:30:02.000Z] ⛽ Gas used: 198432 (estimated: 240000)
[2025-01-17T10:30:02.000Z] 📊 Gas efficiency: 82.7%
```

### **Smart Gas Optimization**
- **High Gas Periods**: Transactions automatically skipped, operations continue
- **Low Gas Periods**: Maximum throughput with detailed efficiency tracking
- **Dynamic Adjustments**: Timing automatically adjusts based on success rates
- **Cost Control**: Never exceed your specified gas budget

## 🎛️ Advanced Timing Controls

### **Timing Parameters Explained**
```bash
# All timing parameters are in milliseconds:
# delay_tx: Time between individual transactions (50-500ms recommended)
# delay_batches/delay_cycles: Time between batches or complete cycles (1000-10000ms)
# delay_error: Time to wait after errors occur (500-5000ms)
```

### **Timing Strategy Examples**
```bash
# 🚀 Aggressive (Low Gas Periods)
node script.js volumeV2 0 100 0xToken 50 1000 500
node script.js swap-batch 100 0xToken 1000 25

# ⚖️ Balanced (Normal Conditions)  
node script.js volumeV2 0 200 0xToken 150 3000 1000
node script.js multiswap-batch 50 "token1,token2" 2000 100

# 🛡️ Conservative (High Gas Periods)
node script.js volumeV2 0 50 0xToken 500 10000 3000
node script.js airdrop-batch 25 1.0 10000
```

### **Dynamic Timing Adjustments**
The system automatically adjusts timing based on performance:
- **Success Rate > 80%**: Speeds up execution by 20%
- **Success Rate < 20%**: Slows down execution by 50%
- **Gas Limit Exceeded**: Automatically increases delays

## 🎯 Enhanced Token Support

### **Uniswap V2 Tokens (Enhanced)**
- **KIKI**: `0xc849418f46A25D302f55d25c40a82C99404E5245`
- **TURBO**: `0xBA5E66FB16944Da22A62Ea4FD70ad02008744460`
- **LORDY**: `0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB`
- **WORKIE**: `0x7480527815ccAE421400Da01E052b120Cc4255E9`

### **Uniswap V3 Tokens (Enhanced)**
- **Ebert**: `0xf83cde146AC35E99dd61b6448f7aD9a4534133cc`
- **BasedBonk**: `0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9`

## 💡 Enhanced Usage Examples

### **Gas-Optimized Volume Generation Workflow**
```bash
# 1. Create wallets and fund them efficiently
node script.js create 500
node script.js airdrop-batch 100 2.0 3000    # 3s between chunks for gas optimization

# 2. Deploy VolumeSwap contract
node script.js deploy 0xc849418f46A25D302f55d25c40a82C99404E5245

# 3. Fund the deployed contract with ETH and tokens
# (Send to contract address shown after deployment)

# 4. Start gas-optimized volume generation
node script.js volumeV2 0 500 0xc849418f46A25D302f55d25c40a82C99404E5245 150 3000 1000

# 5. Monitor real-time gas efficiency and costs
# Bot automatically skips expensive transactions and reports efficiency

# 6. Withdraw funds when done
node script.js withdraw-token 0xc849418f46A25D302f55d25c40a82C99404E5245
```

### **Advanced Multi-Strategy with Gas Management**
```bash
# Create exactly 2000 wallets
node script.js target 2000

# Distribute 20 ETH with conservative timing during high gas
node script.js airdrop-batch 50 20.0 10000

# Multi-token swaps with gas enforcement
node script.js multiswap-batch 25 "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460,0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB" 5000 200
```

### **Continuous Automation with Enhanced Controls**
```bash
# Infinite loop with gas management: Create → Fund → Multi-swap → Recover
node script.js create-and-swap "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460,0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB" 5000 0.00001

# V3 automation with custom timing
node script.js create-and-swapv3 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc 3000 0.000008

# Emergency ETH recovery from any wallet
node script.js recoverETH your_private_key_here 0xYourMainWalletAddress
```

## 📊 Enhanced Performance Monitoring

### **Real-time Analytics**
```bash
# Example enhanced output:
[2025-01-17T10:35:02.000Z] 📊 Cycle 1 completed! Starting new cycle...
[2025-01-17T10:35:02.000Z] 📈 Cumulative Stats:
[2025-01-17T10:35:02.000Z]    • Total Processed: 100
[2025-01-17T10:35:02.000Z]    • Successful: 78
[2025-01-17T10:35:02.000Z]    • Failed: 15
[2025-01-17T10:35:02.000Z]    • Gas limit exceeded: 7
[2025-01-17T10:35:02.000Z]    • Success Rate: 78.00%
[2025-01-17T10:35:02.000Z]    • Average gas efficiency: 84.3%
[2025-01-17T10:35:02.000Z] 🔄 Looping back to wallet 0
```

### **Gas Efficiency Tracking**
- **Individual Transaction Efficiency**: Shows actual vs estimated gas usage
- **Batch Success Rates**: Tracks successful vs skipped transactions
- **Cost Analysis**: Real-time gas cost calculations and comparisons
- **Optimization Suggestions**: Automatic recommendations for timing adjustments

## 🔄 Enhanced Multi-Instance Operations

Run multiple instances with different gas strategies:

### **Gas-Optimized Multi-Instance Setup**
```bash
# Conservative instance for high gas periods
GAS_MAX=0.0000005 PK_MAIN=wallet1 node script.js volumeV2 0 200 0xToken1 200 5000 2000

# Aggressive instance for low gas periods  
GAS_MAX=0.000001 PK_MAIN=wallet2 node script.js volumeV2 200 400 0xToken2 100 2000 1000

# Balanced continuous automation
GAS_MAX=0.0000008 PK_MAIN=wallet3 node script.js create-and-swap "token1,token2" 3000 0.00001
```

### **PM2 with Gas Management**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'Conservative-VolumeBot',
      script: 'script.js',
      args: 'volumeV2 0 200 0xToken 300 10000 3000',
      env: {
        PK_MAIN: 'wallet1_key',
        GAS_MAX: '0.0000005'  // Very conservative
      }
    },
    {
      name: 'Aggressive-VolumeBot',
      script: 'script.js',
      args: 'volumeV2 200 400 0xToken 100 2000 1000',
      env: {
        PK_MAIN: 'wallet2_key',
        GAS_MAX: '0.000002'   // Allow higher gas for throughput
      }
    }
  ]
};
```

## ⚙️ Enhanced Configuration Options

### **Comprehensive .env Configuration**
```env
# Network Configuration
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
PK_MAIN=funding_wallet_private_key

# Default Batch Sizes
DEFAULT_WALLET_COUNT=1000    # Default wallets to create
DEFAULT_CHUNK_SIZE=500       # Wallets per airdrop transaction
DEFAULT_BATCH_SIZE=50        # Wallets per swap batch

# 🆕 Enhanced Gas Management
GAS_MAX=0.0000008           # Maximum gas cost per transaction (ETH)
GAS_PRICE_GWEI=1.0          # Force specific gas price (optional)
GAS_LIMIT=300000            # Force specific gas limit (optional)

# 🆕 Default Timing Controls (optional)
DEFAULT_TX_DELAY=150        # Default delay between transactions (ms)
DEFAULT_CYCLE_DELAY=3000    # Default delay between cycles (ms)
DEFAULT_ERROR_DELAY=1000    # Default delay after errors (ms)
```

### **Gas Optimization Strategies**

**🕐 Low Gas Times (0.5-2 Gwei):**
```env
GAS_MAX=0.000002            # Allow higher gas for maximum throughput
DEFAULT_TX_DELAY=50         # Faster transaction pace
DEFAULT_CYCLE_DELAY=1000    # Shorter cycle delays
```

**⏰ Normal Times (2-5 Gwei):**
```env
GAS_MAX=0.0000008           # Standard gas limit
DEFAULT_TX_DELAY=150        # Balanced timing
DEFAULT_CYCLE_DELAY=3000    # Standard cycle delays
```

**🚨 High Gas Times (5+ Gwei):**
```env
GAS_MAX=0.0000003           # Very conservative limit
DEFAULT_TX_DELAY=500        # Slower pace to avoid competition
DEFAULT_CYCLE_DELAY=10000   # Longer delays between cycles
```

## 🏭 Enhanced VolumeSwap Contract Features

The bot includes a powerful VolumeSwap contract deployment and management system with enhanced monitoring:

### **Contract Capabilities**
- **🤖 Automated Trading**: Smart buy/sell logic based on contract balances
- **🎲 Random Amounts**: Uses randomized percentages for natural trading patterns
- **⚖️ Balance Management**: Automatically switches between buying and selling
- **🔧 Owner Controls**: Configurable buy/sell percentages and maximum buy amounts
- **💸 Fund Recovery**: Complete withdrawal system for ETH and tokens
- **⛽ Gas Optimization**: Enhanced gas cost monitoring and efficiency tracking

### **Enhanced Deployment Process**
1. **Deploy Contract**: `node script.js deploy [token_address]` (now with gas validation)
2. **Fund Contract**: Send ETH and tokens to the deployed contract address
3. **Generate Volume**: `node script.js volumeV2 [range] [token] [timing]` (with gas management)
4. **Monitor Progress**: Real-time stats, gas efficiency, and cycle tracking
5. **Withdraw Funds**: `node script.js withdraw-token [token_address]` (gas-optimized)

### **Enhanced Volume Generation Features**
- **🔍 Balance Validation**: Checks contract has sufficient ETH/token balance
- **🔄 Infinite Loops**: Continuous operation with cycle tracking
- **📊 Smart Logic**: Buys when ETH available, sells when tokens available
- **📈 Statistics**: Real-time success rates and performance metrics
- **🛡️ Error Recovery**: Automatic retry and error handling
- **⏸️ Graceful Control**: Easy stop with Ctrl+C
- **⛽ Gas Management**: Automatic gas cost enforcement and efficiency monitoring
- **🎛️ Timing Control**: Configurable delays and dynamic adjustments

## 📊 Enhanced Output Examples

### **Enhanced Contract Deployment**
```
[2025-01-17T10:30:00.000Z] Deploying from main wallet: 0x123...ABC
[2025-01-17T10:30:00.000Z] Token address: 0xc849418f46A25D302f55d25c40a82C99404E5245
[2025-01-17T10:30:00.000Z] Gas cost: 0.0012 ETH (within limit: 0.002 ETH)
[2025-01-17T10:30:01.000Z] ✅ Deploy SUCCESS: 0xDEF456...
[2025-01-17T10:30:01.000Z] 📄 Deployed contract address: 0x789...GHI
[2025-01-17T10:30:01.000Z] ⛽ Gas used: 2,340,567 (efficiency: 87.3%)
[2025-01-17T10:30:01.000Z] 💰 Actual gas cost: 0.00104 ETH
```

### **Enhanced Volume Generation**
```
[2025-01-17T10:35:00.000Z] 🎯 Starting VolumeV2 for token: 0xc849418f46A25D302f55d25c40a82C99404E5245
[2025-01-17T10:35:00.000Z] ⏱️  Timing Configuration:
[2025-01-17T10:35:00.000Z]    • Delay between transactions: 150ms
[2025-01-17T10:35:00.000Z]    • Delay between cycles: 3000ms
[2025-01-17T10:35:00.000Z]    • Gas max limit: 0.0000008 ETH
[2025-01-17T10:35:01.000Z] ✅ Using existing contract: 0x789...GHI
[2025-01-17T10:35:01.000Z] 🔍 Checking contract balances...
[2025-01-17T10:35:01.000Z] 💰 Contract ETH balance: 2.5 ETH
[2025-01-17T10:35:01.000Z] 🪙 Contract KIKI balance: 50,000.0 KIKI
[2025-01-17T10:35:01.000Z] ✅ Contract has both ETH and token balance - full buy/sell functionality available
[2025-01-17T10:35:02.000Z] 🔄 Starting infinite volume bot loop for wallets 0-100
[2025-01-17T10:35:03.000Z] 📊 Cycle 1 - Wallet 1/100 (Index: 0)
[2025-01-17T10:35:03.000Z] Gas cost: 0.0000006 ETH (within limit: 0.0000008 ETH)
[2025-01-17T10:35:04.000Z] ✅ Wallet 0 successful - Gas efficiency: 85.2%
[2025-01-17T10:35:04.000Z] ⏱️  Waiting 150ms before next transaction...
[2025-01-17T10:35:05.000Z] 📊 Cycle 1 - Wallet 2/100 (Index: 1)
[2025-01-17T10:35:05.000Z] Gas cost: 0.0000012 ETH (exceeds limit: 0.0000008 ETH)
[2025-01-17T10:35:05.000Z] 💰 Wallet 1 skipped due to high gas costs
...
[2025-01-17T10:37:00.000Z] 🔄 Cycle 1 completed! Starting new cycle...
[2025-01-17T10:37:00.000Z] 📈 Cumulative Stats:
[2025-01-17T10:37:00.000Z]    • Total Processed: 100
[2025-01-17T10:37:00.000Z]    • Successful: 78
[2025-01-17T10:37:00.000Z]    • Failed: 15
[2025-01-17T10:37:00.000Z]    • Gas limit exceeded: 7
[2025-01-17T10:37:00.000Z]    • Success Rate: 78.00%
[2025-01-17T10:37:00.000Z]    • Average gas efficiency: 84.3%
[2025-01-17T10:37:00.000Z] 🔄 Looping back to wallet 0
[2025-01-17T10:37:00.000Z] ⏱️  Waiting 3000ms before next cycle...
```

### **Enhanced Fund Withdrawal**
```
[2025-01-17T10:40:00.000Z] 🏦 Withdrawing from contract: 0x789...GHI
[2025-01-17T10:40:00.000Z] Gas cost check: 0.0000004 ETH (within limit: 0.0000008 ETH)
[2025-01-17T10:40:01.000Z] 🔍 Checking contract balances before withdrawal...
[2025-01-17T10:40:01.000Z] 💰 Contract ETH balance: 1.8 ETH
[2025-01-17T10:40:01.000Z] 🪙 Contract KIKI balance: 25,000.0 KIKI
[2025-01-17T10:40:02.000Z] ✅ Withdrawal SUCCESS: 0xABC123...
[2025-01-17T10:40:02.000Z] ⛽ Gas used: 145,678 (efficiency: 89.1%)
[2025-01-17T10:40:02.000Z] 💰 Actual gas cost: 0.00000035 ETH
[2025-01-17T10:40:02.000Z] 📈 ETH withdrawn: 1.8 ETH
[2025-01-17T10:40:02.000Z] 📈 KIKI withdrawn: 25,000.0 KIKI
[2025-01-17T10:40:02.000Z] 📊 Net ETH gain: 1.79999965 ETH
```

### **Enhanced Batch Processing**
```
[2025-01-17T10:45:00.000Z] 🔄 Processing swap batch 1/4 (wallets 0-24)
[2025-01-17T10:45:00.000Z] ⏱️  Timing: 2000ms between batches, 100ms between transactions
[2025-01-17T10:45:00.000Z] ⛽ Gas max limit: 0.0000008 ETH
[2025-01-17T10:45:01.000Z] ✅ Wallet 0: Success - 0xabc123... (Gas efficiency: 82.7%)
[2025-01-17T10:45:01.000Z] ⏱️  Waiting 100ms before next transaction...
[2025-01-17T10:45:02.000Z] 💰 Wallet 3: Skipped - Gas cost 0.000001 ETH exceeds limit
[2025-01-17T10:45:03.000Z] ✅ Wallet 5: Success - 0xdef456... (Gas efficiency: 79.3%)
[2025-01-17T10:45:04.000Z] 📈 Batch 1 completed:
[2025-01-17T10:45:04.000Z]    • Successful: 20/25 (80.0%)
[2025-01-17T10:45:04.000Z]    • Failed: 3
[2025-01-17T10:45:04.000Z]    • Gas exceeded: 2
[2025-01-17T10:45:04.000Z]    • Average gas efficiency: 81.5%
[2025-01-17T10:45:04.000Z] ⏱️  Waiting 2000ms before next batch...
```

## 🔧 Enhanced Troubleshooting

### **Gas-Related Issues**

**❌ "Gas cost exceeds maximum limit"**
- This is normal behavior during high gas periods
- Transactions are automatically skipped to save money
- Adjust `GAS_MAX` in `.env` if you want to allow higher costs
- Monitor gas efficiency percentages for optimization

**❌ "All transactions being skipped"**
- Gas prices are too high for your current `GAS_MAX` setting
- Either wait for lower gas prices or increase `GAS_MAX`
- Use conservative timing settings during high gas periods

**📊 Low gas efficiency (<50%)**
- Increase `delay_tx` parameter to reduce network congestion
- Use smaller batch sizes during peak times
- Consider running during off-peak hours

### **Enhanced Error Recovery**
```bash
# All functions now include enhanced error handling:
# - Automatic retry with exponential backoff
# - Gas cost validation before execution
# - Graceful degradation during network issues
# - Detailed error categorization and reporting
```

### **Performance Optimization Commands**
```bash
# Check current gas efficiency
node script.js check

# Test gas limits with small batch
node script.js swap-batch 5 0xToken 1000 100

# Monitor real-time performance
pm2 monit  # If using PM2

# Emergency stop all operations
pm2 stop all  # Graceful shutdown with PM2
# Or use Ctrl+C for single instances
```

### **Common Issues with Solutions**

**❌ "PK_MAIN not configured"**
- Ensure your `.env` file contains your funding wallet private key
- Private key should be without `0x` prefix

**❌ "Insufficient balance"**
- Check your funding wallet has enough ETH for airdrops + gas fees
- Consider reducing airdrop amounts or batch sizes
- Monitor gas costs with the new gas management system

**❌ "No wallets found"**
- Run `node script.js create [count]` first to generate wallets
- Check if `wallets.json` exists and contains valid data

**❌ "Contract has no ETH or token balance"**
- Fund the deployed contract with ETH and/or tokens before running volume bot
- Check contract address after deployment and send funds there
- Use enhanced balance validation to verify funding

**❌ Gas estimation failures**
- The new gas management system handles this automatically
- Increase gas price in `.env`: `GAS_PRICE_GWEI=2.0`
- Reduce batch sizes to avoid network congestion

**🔄 Continuous automation stuck**
- Check RPC connection and gas prices
- Verify funding wallet has sufficient balance
- Script includes automatic error recovery and retry logic
- Monitor gas efficiency for optimization opportunities

**🏭 Volume bot not working**
- Ensure contract is deployed: `node script.js deploy [token_address]`
- Verify contract has balance before starting volume generation
- Check that the correct contract address is being used
- Use enhanced gas management to avoid expensive transactions

## 🆕 New Features Summary

### **🔥 Gas Management System**
- ✅ Automatic gas cost enforcement across all functions
- ✅ Real-time gas efficiency monitoring and reporting
- ✅ Intelligent transaction skipping during high gas periods
- ✅ Configurable gas limits per transaction type
- ✅ Cost optimization with detailed analytics

### **⚡ Advanced Timing Controls**
- ✅ Configurable delays for all operations
- ✅ Dynamic timing adjustments based on success rates
- ✅ Network-aware timing optimization
- ✅ Batch and cycle timing customization
- ✅ Error recovery timing controls

### **📊 Enhanced Monitoring**
- ✅ Real-time gas cost calculations and comparisons
- ✅ Success rate tracking with detailed breakdowns
- ✅ Gas efficiency percentages for optimization
- ✅ Transaction categorization (success/failed/skipped)
- ✅ Performance metrics and recommendations

### **🛡️ Improved Reliability**
- ✅ Enhanced error handling and categorization
- ✅ Automatic retry mechanisms with smart delays
- ✅ Graceful degradation during network issues
- ✅ Robust transaction validation and verification
- ✅ Comprehensive logging and debugging

## 🔧 Installation & Maintenance

### **Automated Setup**
```bash
# Complete setup with Node.js installation
./install.sh setup

# Update to latest version
./install.sh update

# Validate script integrity
./install.sh validate

# Check Node.js installation
./install.sh check-node
```

### **Manual Setup Requirements**
- **Node.js v16+** (automatically installed by setup script)
- **npm or yarn** (included with Node.js)
- **curl or wget** (for downloading external files)
- **PM2** (optional, for production multi-instance management)

### **Maintenance Commands**
```bash
# Update to latest version
./install.sh update

# Validate script integrity
./install.sh validate

# Check wallet statistics with enhanced analytics
node script.js check

# Emergency ETH recovery with gas management
node script.js recoverETH [private_key] [main_wallet_address]

# Withdraw all funds from deployed contracts (gas-optimized)
node script.js withdraw-token [token_address]
```

## ⚠️ Enhanced Important Notes

- **🔐 Security**: Store private keys securely, never commit `.env` to version control
- **⛽ Gas Management**: Monitor the new gas efficiency metrics for optimization
- **🎛️ Timing Control**: Adjust timing parameters based on network conditions
- **📊 Performance**: Use the enhanced analytics to optimize your strategies
- **⏰ Rate Limits**: Built-in intelligent delays prevent RPC rate limiting
- **💾 Backup**: Keep backups of `wallets.json` - contains all your generated wallets
- **🧪 Testing**: Test with small amounts first, especially with new gas settings
- **🔄 Automation**: Continuous automation commands run indefinitely - use Ctrl+C to stop
- **💸 Recovery**: Enhanced ETH recovery now includes gas cost validation
- **🏭 Contract Funding**: VolumeSwap contracts need both ETH and tokens to function properly
- **📊 Volume Generation**: Monitor contract balances and withdraw funds regularly
- **🔄 Infinite Loops**: Volume bots run continuously - ensure proper monitoring
- **💰 Cost Control**: The new gas management prevents unexpected high costs
- **🎯 Optimization**: Use gas efficiency metrics to fine-tune your operations
- **📈 Scaling**: Start with conservative settings and scale up based on performance

## 🚀 Getting Started with Enhanced Features

1. **Install and Setup**: Use the automated installer
2. **Configure Gas Limits**: Set appropriate `GAS_MAX` in `.env`
3. **Test with Small Amounts**: Try batch operations with small sizes first
4. **Monitor Performance**: Watch gas efficiency and success rates
5. **Optimize Timing**: Adjust delays based on network conditions
6. **Scale Gradually**: Increase batch sizes and instance counts as needed

The enhanced TurboBot now provides professional-grade automation with intelligent cost control and performance optimization. Perfect for both small-scale testing and large-scale production deployments!

## 🔮 Roadmap & Future Features

### **Planned Features**
- **🤖 AI-Powered Trading**: Machine learning for more natural volume patterns
- **📊 Advanced Analytics**: Detailed performance metrics and reporting dashboard
- **🔄 Multi-Chain Support**: Expansion to other EVM-compatible chains
- **🎯 Target-Based Volume**: Set specific volume targets and timeframes
- **📱 Web Dashboard**: Real-time monitoring and control interface
- **🔔 Notifications**: Telegram/Discord alerts for important events
- **⛽ Dynamic Gas Pricing**: AI-powered gas optimization strategies

### **Smart Contract Enhancements**
- **🎲 Advanced Randomization**: More sophisticated random trading patterns
- **⏰ Time-Based Logic**: Trading schedules and time-based behaviors
- **📈 Volume Targets**: Automatic stopping at volume milestones
- **🔄 Multi-Token Support**: Single contract handling multiple tokens
- **💰 Profit Tracking**: Built-in P&L tracking and optimization
- **⛽ Gas-Aware Trading**: Smart contract gas optimization features

### **Infrastructure Improvements**
- **☁️ Cloud Deployment**: One-click cloud instance deployment
- **🔄 Auto-Scaling**: Dynamic instance scaling based on performance
- **🛡️ Enhanced Security**: Hardware wallet support and key management
- **📊 Database Integration**: Persistent storage for analytics and history
- **🌐 API Interface**: RESTful API for programmatic control
- **⛽ Gas Oracle Integration**: Real-time gas price optimization

## 🤝 Contributing & Support

This is an **open source project** and we welcome contributions! 

### **How to Contribute**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all functions maintain existing error handling and logging patterns
5. Test new features with small amounts first
6. Include gas management and timing controls in new features
7. Submit a pull request

### **Recent Major Updates**
- **⛽ Complete Gas Management System**: Comprehensive cost control across all functions
- **🎛️ Advanced Timing Controls**: Full customization of execution timing
- **📊 Enhanced Analytics**: Real-time performance monitoring and optimization
- **🛡️ Improved Reliability**: Better error handling and recovery mechanisms
- **💰 Cost Optimization**: Intelligent transaction skipping and efficiency tracking
- **🔄 Dynamic Adjustments**: Smart timing and gas optimization based on network conditions

### **Support the Project**
If you find this project useful, consider supporting development:

**Donation Address**: `0xEd1fed9A43B434a053159732b606bbbc7FE9498e`

Your donations help maintain and improve this open source tool for the community!

### **Getting Help**
- Check the enhanced troubleshooting section above
- Review the command examples and new gas management features
- Ensure your `.env` file is properly configured with gas settings
- Test with small amounts before scaling up
- For volume generation, ensure contracts are properly funded
- Monitor gas efficiency metrics for optimization opportunities

## 📄 License

**MIT License** - This project is completely open source and free to use, modify, and distribute.

## 🔗 Links

- **GitHub Repository**: [TurboBot](https://github.com/tiagoterron/TurboBot)
- **Base Network**: [Base Chain](https://base.org/)
- **Uniswap**: [Uniswap Protocol](https://uniswap.org/)
- **Gas Tracker**: [Base Gas Tracker](https://basescan.org/gastracker)

---

**⚡ Ready to generate volume with intelligent gas management? Start with `./install.sh setup` and experience the enhanced automation features!**

*The new gas management and timing controls provide professional-grade automation with intelligent cost optimization. Perfect for any network conditions and scale of operations. Monitor your gas efficiency, optimize your timing, and maximize your results while minimizing costs!*