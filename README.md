# 🚀 TurboBot - Enhanced DeFi Automation with V3 Support & Advanced Gas Management

An open-source Node.js automation tool for creating multiple wallets, distributing ETH via airdrops, deploying VolumeSwap contracts, and executing automated token swaps on Base network. Now featuring **Uniswap V3 integration**, **advanced gas management**, **configurable timing controls**, and **intelligent transaction optimization** for maximum efficiency and cost control.

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

### 🆕 NEW: Uniswap V3 Integration

- **🎯 V3 Fee Tiers**: Support for 0.05%, 0.3%, and 1% fee tiers
- **🔄 V3 Multicall**: Efficient multi-token V3 swaps with single transaction
- **⚡ V3 Optimization**: Enhanced gas estimation and routing for V3 pools
- **🔄 ETH→WETH Handling**: Automatic ETH to WETH conversion for V3 swaps
- **💎 V3 Analytics**: Fee tier performance tracking and optimization
- **🎛️ V3 Automation**: Full V3 continuous automation support

### 🆕 ENHANCED: Advanced Gas Management & Timing Controls

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
├── script.js           # Core automation engine with V3 support
├── package.json        # Node.js dependencies
├── .env                # Configuration file (now with V3 and gas settings)
├── wallets.json        # Generated wallet storage
└── automation.log      # Execution logs
```

## 🚀 Quick Start

### 1. Install on Linux 
```bash
mkdir turbo-bot && cd turbo-bot
wget -O install.sh "https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/install.sh" && chmod +x install.sh && ./install.sh setup && ./install.sh show_help
```

### 2. Install on MacOS
```bash
mkdir turbo-bot && cd turbo-bot
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

# 🆕 V3 Configuration
DEFAULT_V3_FEE=10000              # V3 fee tier (500, 3000, 10000)

# 🆕 Enhanced Gas Management Settings
GAS_MAX=0.0000008                 # Maximum gas cost per transaction (ETH)
GAS_PRICE_GWEI=1.0               # Force specific gas price (optional)
GAS_LIMIT=300000                 # Force specific gas limit (optional)
```

### 4. Basic Usage with V3 and Enhanced Controls
```bash
# Create 1000 wallets
node script.js create 1000

# Distribute 5 ETH among all wallets with custom timing
node script.js airdrop-batch 200 5.0 3000

# Deploy VolumeSwap contract for a token
node script.js deploy 0xTokenAddress

# Execute V2 volume generation with timing controls
node script.js volumeV2 0 100 0xTokenAddress 150 3000 1000

# Execute V3 volume generation with advanced controls
node script.js volumeV3 0 100 0xV3TokenAddress 150 3000 1000
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

### 📊 Enhanced Volume Generation (V2 + V3)
```bash
# Run infinite V2 volume bot with advanced controls
node script.js volumeV2 [start] [end] [token] [delay_tx] [delay_cycles] [delay_error]

# Run infinite V3 volume bot with advanced controls
node script.js volumeV3 [start] [end] [token] [delay_tx] [delay_cycles] [delay_error]

# Parameters:
# delay_tx: Milliseconds between individual transactions (default: 150)
# delay_cycles: Milliseconds between complete cycles (default: 3000)
# delay_error: Milliseconds to wait after errors (default: 1000)

# Examples:
node script.js volumeV2                                    # V2 default settings
node script.js volumeV2 0 100 0xToken 100 2000 500       # V2 fast execution
node script.js volumeV3                                    # V3 default settings
node script.js volumeV3 0 100 0xV3Token 150 3000 1500    # V3 with custom timing
node script.js volumeV3 0 500 0xV3Token 500 10000 2000   # V3 conservative execution

# V3 Features:
# - Automatic V3 fee tier selection
# - Enhanced gas estimation for V3 pools
# - ETH→WETH conversion handling
# - V3 router optimization
# - Fee tier performance tracking
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

### 🔄 Enhanced Swap Operations (V2 + V3)
```bash
# V2 Single token swaps with timing controls
node script.js swap-batch [batch_size] [token] [delay_batches] [delay_tx]
node script.js swap [start] [end] [token_address]

# V2 Multi-token swaps with gas management
node script.js multiswap-batch [batch_size] [tokens] [delay_batches] [delay_tx]
node script.js multiswap [start] [end] [token1,token2,token3]

# V3 Single token swaps with enhanced controls
node script.js swapv3-batch [batch_size] [token] [start] [end] [delay_batches] [delay_tx]
node script.js swapv3 [start] [end] [token_address]

# V3 Multi-token swaps with fee tier optimization
node script.js multiswapV3 [start] [end] [token1,token2,token3]

# Examples:
node script.js swap-batch 50 0xToken 2000 100                    # V2 batch processing
node script.js multiswap-batch 25 "token1,token2" 3000 150       # V2 multi-token with timing
node script.js swapv3-batch 30 0xV3Token 0 300 2000 100         # V3 batch with range
node script.js multiswapV3 0 100 "v3token1,v3token2"            # V3 multi-token swap
```

### 🔄 Enhanced Continuous Automation (V2 + V3)
```bash
# V2: Create wallet, fund, swap multiple tokens, and recover ETH
node script.js create-and-swap [tokens] [cycle_delay] [funding_amount]

# V3: Create wallet, fund, single V3 swap, and recover ETH
node script.js create-and-swapv3 [token] [cycle_delay] [funding_amount]

# V3: Create wallet, fund, multi V3 swap, and recover ETH (NEW!)
node script.js create-and-multiswapv3 [tokens] [cycle_delay] [funding_amount]

# Recover ETH from a specific wallet
node script.js recoverETH [private_key] [receiver_address]

# Examples:
node script.js create-and-swap "token1,token2" 5000 0.00001        # V2 multi-token automation
node script.js create-and-swapv3 0xV3Token 3000 0.000008          # V3 single token automation
node script.js create-and-multiswapv3 "v3token1,v3token2" 3000 0.000005  # V3 multi-token automation
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
[2025-01-17T10:30:02.000Z] 💎 V3 Fee tier used: 10000 basis points
```

### **Smart Gas Optimization (V2 + V3)**
- **High Gas Periods**: Transactions automatically skipped, operations continue
- **Low Gas Periods**: Maximum throughput with detailed efficiency tracking
- **V3 Optimization**: Enhanced gas estimation for V3 pools and multicalls
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
node script.js volumeV3 0 100 0xV3Token 75 1500 750
node script.js swap-batch 100 0xToken 1000 25

# ⚖️ Balanced (Normal Conditions)  
node script.js volumeV2 0 200 0xToken 150 3000 1000
node script.js volumeV3 0 200 0xV3Token 150 3000 1000
node script.js multiswap-batch 50 "token1,token2" 2000 100

# 🛡️ Conservative (High Gas Periods)
node script.js volumeV2 0 50 0xToken 500 10000 3000
node script.js volumeV3 0 50 0xV3Token 500 10000 3000
node script.js airdrop-batch 25 1.0 10000
```

### **Dynamic Timing Adjustments**
The system automatically adjusts timing based on performance:
- **Success Rate > 80%**: Speeds up execution by 20%
- **Success Rate < 20%**: Slows down execution by 50%
- **Gas Limit Exceeded**: Automatically increases delays
- **V3 Pools**: Slightly longer delays for complex routing

## 🎯 Enhanced Token Support

### **Uniswap V2 Tokens (Enhanced)**
- **KIKI**: `0xc849418f46A25D302f55d25c40a82C99404E5245`
- **TURBO**: `0xBA5E66FB16944Da22A62Ea4FD70ad02008744460`
- **LORDY**: `0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB`
- **WORKIE**: `0x7480527815ccAE421400Da01E052b120Cc4255E9`

### **Uniswap V3 Tokens (NEW!)**
- **Ebert**: `0xf83cde146AC35E99dd61b6448f7aD9a4534133cc`
- **BasedBonk**: `0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9`

### **V3 Fee Tier Configuration**
```env
# Configure V3 fee tier in .env (basis points):
DEFAULT_V3_FEE=500      # 0.05% for stable pairs
DEFAULT_V3_FEE=3000     # 0.3% for standard pairs (recommended)
DEFAULT_V3_FEE=10000    # 1% for exotic pairs (default)
```

## 💡 Enhanced Usage Examples

### **V3-Enhanced Volume Generation Workflow**
```bash
# 1. Create wallets and fund them efficiently
node script.js create 500
node script.js airdrop-batch 100 2.0 3000    # 3s between chunks for gas optimization

# 2. Deploy VolumeSwap contract (works for both V2 and V3)
node script.js deploy 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc  # Deploy for V3 token

# 3. Fund the deployed contract with ETH and tokens
# (Send to contract address shown after deployment)

# 4. Start V3 volume generation with gas optimization
node script.js volumeV3 0 500 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc 150 3000 1000

# 5. Monitor real-time V3 gas efficiency and fee tier performance
# Bot automatically skips expensive transactions and reports V3 metrics

# 6. Withdraw funds when done (works for both V2 and V3)
node script.js withdraw-token 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc
```

### **Advanced Multi-Strategy with V2/V3 Support**
```bash
# Create exactly 2000 wallets
node script.js target 2000

# Distribute 20 ETH with conservative timing during high gas
node script.js airdrop-batch 50 20.0 10000

# V2 Multi-token swaps with gas enforcement
node script.js multiswap-batch 25 "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460,0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB" 5000 200

# V3 Multi-token swaps with fee tier optimization
node script.js multiswapV3 0 300 "0xf83cde146AC35E99dd61b6448f7aD9a4534133cc,0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9"
```

### **Continuous Automation with V3 Support**
```bash
# V2 Infinite loop: Create → Fund → Multi-swap → Recover
node script.js create-and-swap "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460,0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB" 5000 0.00001

# V3 Single token automation with custom timing
node script.js create-and-swapv3 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc 3000 0.000008

# V3 Multi-token automation (NEW!)
node script.js create-and-multiswapv3 "0xf83cde146AC35E99dd61b6448f7aD9a4534133cc,0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9" 3000 0.000005

# Emergency ETH recovery from any wallet
node script.js recoverETH your_private_key_here 0xYourMainWalletAddress
```

### **V2/V3 Mixed Strategy Examples**
```bash
# Run V2 and V3 volume bots simultaneously
GAS_MAX=0.0000005 node script.js volumeV2 0 250 0xV2Token 100 2000 500 &
GAS_MAX=0.0000008 node script.js volumeV3 250 500 0xV3Token 150 3000 1000 &

# Staggered V2/V3 automation
node script.js create-and-swap "v2token1,v2token2" 2000 0.000003 &
sleep 60 && node script.js create-and-multiswapv3 "v3token1,v3token2" 3000 0.000005 &
```

## 📊 Enhanced Performance Monitoring

### **Real-time Analytics (V2 + V3)**
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
[2025-01-17T10:35:02.000Z]    • V3 Fee tier performance: 10000 basis points
[2025-01-17T10:35:02.000Z] 🔄 Looping back to wallet 0
```

### **V3-Specific Monitoring**
- **Fee Tier Efficiency**: Tracks performance across different V3 fee tiers
- **V3 vs V2 Comparison**: Side-by-side gas usage and success rate analysis
- **ETH→WETH Conversion**: Monitors automatic conversion efficiency
- **V3 Pool Liquidity**: Validates pool liquidity before transactions
- **Multicall Efficiency**: Compares individual vs batch V3 operations

### **Gas Efficiency Tracking (Enhanced for V3)**
- **Individual Transaction Efficiency**: Shows actual vs estimated gas usage
- **V3 Gas Premium**: Tracks additional gas costs for V3 operations
- **Batch Success Rates**: Tracks successful vs skipped transactions
- **Cost Analysis**: Real-time gas cost calculations for V2 vs V3
- **Optimization Suggestions**: Automatic recommendations for timing and fee tiers

## 🔄 Enhanced Multi-Instance Operations

Run multiple instances with different V2/V3 strategies:

### **V2/V3 Gas-Optimized Multi-Instance Setup**
```bash
# Conservative V2 instance for high gas periods
GAS_MAX=0.0000005 PK_MAIN=wallet1 node script.js volumeV2 0 200 0xV2Token1 200 5000 2000

# Aggressive V3 instance for low gas periods  
GAS_MAX=0.000001 PK_MAIN=wallet2 node script.js volumeV3 200 400 0xV3Token2 100 2000 1000

# Balanced V3 continuous automation
GAS_MAX=0.0000008 PK_MAIN=wallet3 node script.js create-and-multiswapv3 "v3token1,v3token2" 3000 0.000005
```

### **PM2 with V2/V3 Gas Management**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'Conservative-V2-VolumeBot',
      script: 'script.js',
      args: 'volumeV2 0 200 0xV2Token 300 10000 3000',
      env: {
        PK_MAIN: 'wallet1_key',
        GAS_MAX: '0.0000005',
        DEFAULT_V3_FEE: '3000'
      }
    },
    {
      name: 'Aggressive-V3-VolumeBot',
      script: 'script.js',
      args: 'volumeV3 200 400 0xV3Token 100 2000 1000',
      env: {
        PK_MAIN: 'wallet2_key',
        GAS_MAX: '0.000002',
        DEFAULT_V3_FEE: '10000'
      }
    },
    {
      name: 'V3-MultiSwap-Automation',
      script: 'script.js',
      args: 'create-and-multiswapv3 "v3token1,v3token2" 3000 0.000005',
      env: {
        PK_MAIN: 'wallet3_key',
        GAS_MAX: '0.0000008',
        DEFAULT_V3_FEE: '10000'
      }
    }
  ]
};
```

## ⚙️ Enhanced Configuration Options

### **Comprehensive .env Configuration with V3**
```env
# Network Configuration
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
PK_MAIN=funding_wallet_private_key

# Default Batch Sizes
DEFAULT_WALLET_COUNT=1000    # Default wallets to create
DEFAULT_CHUNK_SIZE=500       # Wallets per airdrop transaction
DEFAULT_BATCH_SIZE=50        # Wallets per swap batch

# 🆕 V3 Configuration
DEFAULT_V3_FEE=10000        # V3 fee tier (500, 3000, 10000)

# 🆕 Enhanced Gas Management
GAS_MAX=0.0000008           # Maximum gas cost per transaction (ETH)
GAS_PRICE_GWEI=1.0          # Force specific gas price (optional)
GAS_LIMIT=300000            # Force specific gas limit (optional)

# 🆕 Default Timing Controls (optional)
DEFAULT_TX_DELAY=150        # Default delay between transactions (ms)
DEFAULT_CYCLE_DELAY=3000    # Default delay between cycles (ms)
DEFAULT_ERROR_DELAY=1000    # Default delay after errors (ms)
```

### **V3 Optimization Strategies**

**🎯 V3 Fee Tier Selection:**
```env
# Stable pairs (USDC/WETH)
DEFAULT_V3_FEE=500          # 0.05% fee tier

# Standard pairs (most tokens)
DEFAULT_V3_FEE=3000         # 0.3% fee tier (recommended)

# Exotic pairs (new/volatile tokens)
DEFAULT_V3_FEE=10000        # 1% fee tier (default)
```

**🕐 V3 Low Gas Times (0.5-2 Gwei):**
```env
GAS_MAX=0.000002            # Allow higher gas for V3 complexity
DEFAULT_TX_DELAY=75         # Faster pace for V3
DEFAULT_CYCLE_DELAY=1500    # Shorter V3 cycle delays
```

**⏰ V3 Normal Times (2-5 Gwei):**
```env
GAS_MAX=0.0000008           # Standard V3 gas limit
DEFAULT_TX_DELAY=150        # Balanced V3 timing
DEFAULT_CYCLE_DELAY=3000    # Standard V3 cycle delays
```

**🚨 V3 High Gas Times (5+ Gwei):**
```env
GAS_MAX=0.0000005           # Conservative V3 limit
DEFAULT_TX_DELAY=500        # Slower V3 pace
DEFAULT_CYCLE_DELAY=10000   # Longer V3 delays
```

## 🏭 Enhanced VolumeSwap Contract Features

The bot includes a powerful VolumeSwap contract deployment and management system with V3 support:

### **Contract Capabilities (V2 + V3)**
- **🤖 Automated Trading**: Smart buy/sell logic for both V2 and V3 pools
- **🎯 V3 Integration**: executeV3Swap() function with fee tier optimization
- **🎲 Random Amounts**: Uses randomized percentages for natural trading patterns
- **⚖️ Balance Management**: Automatically switches between buying and selling
- **🔧 Owner Controls**: Configurable buy/sell percentages and maximum buy amounts
- **💸 Fund Recovery**: Complete withdrawal system for ETH and tokens
- **⛽ Gas Optimization**: Enhanced gas cost monitoring for both V2 and V3

### **Enhanced Deployment Process (V2/V3 Compatible)**
1. **Deploy Contract**: `node script.js deploy [token_address]` (works for both V2 and V3 tokens)
2. **Fund Contract**: Send ETH and tokens to the deployed contract address
3. **Generate V2 Volume**: `node script.js volumeV2 [range] [token] [timing]`
4. **Generate V3 Volume**: `node script.js volumeV3 [range] [token] [timing]` (NEW!)
5. **Monitor Progress**: Real-time stats, gas efficiency, V3 fee tier tracking
6. **Withdraw Funds**: `node script.js withdraw-token [token_address]` (V2/V3 compatible)

### **Enhanced Volume Generation Features (V2 + V3)**
- **🔍 Balance Validation**: Checks contract has sufficient ETH/token balance
- **🔄 Infinite Loops**: Continuous operation with cycle tracking
- **📊 Smart Logic**: V2 and V3 compatible buy/sell logic
- **🎯 V3 Fee Optimization**: Automatic fee tier selection and monitoring
- **📈 Statistics**: Real-time success rates and V3 performance metrics
- **🛡️ Error Recovery**: Automatic retry and error handling for both protocols
- **⏸️ Graceful Control**: Easy stop with Ctrl+C
- **⛽ Gas Management**: V3-aware gas cost enforcement and efficiency monitoring
- **🎛️ Timing Control**: V3-optimized delays and dynamic adjustments

## 📊 Enhanced Output Examples

### **Enhanced V3 Contract Deployment**
```
[2025-01-17T10:30:00.000Z] Deploying from main wallet: 0x123...ABC
[2025-01-17T10:30:00.000Z] Token address: 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc
[2025-01-17T10:30:00.000Z] Gas cost: 0.0012 ETH (within limit: 0.002 ETH)
[2025-01-17T10:30:01.000Z] ✅ Deploy SUCCESS: 0xDEF456...
[2025-01-17T10:30:01.000Z] 📄 Deployed contract address: 0x789...GHI
[2025-01-17T10:30:01.000Z] ⛽ Gas used: 2,340,567 (efficiency: 87.3%)
[2025-01-17T10:30:01.000Z] 💰 Actual gas cost: 0.00104 ETH
[2025-01-17T10:30:01.000Z] 🎯 Contract supports both V2 and V3 operations
```

### **Enhanced V3 Volume Generation**
```
[2025-01-17T10:35:00.000Z] 🎯 Starting VolumeV3 for token: 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc
[2025-01-17T10:35:00.000Z] ⏱️  V3 Timing Configuration:
[2025-01-17T10:35:00.000Z]    • Delay between transactions: 150ms
[2025-01-17T10:35:00.000Z]    • Delay between cycles: 3000ms
[2025-01-17T10:35:00.000Z]    • Gas max limit: 0.0000008 ETH
[2025-01-17T10:35:00.000Z]    • V3 Fee tier: 10000 basis points (1%)
[2025-01-17T10:35:01.000Z] ✅ Using existing contract: 0x789...GHI
[2025-01-17T10:35:01.000Z] 🔍 Checking contract balances...
[2025-01-17T10:35:01.000Z] 💰 Contract ETH balance: 2.5 ETH
[2025-01-17T10:35:01.000Z] 🪙 Contract Ebert balance: 50,000.0 EBERT
[2025-01-17T10:35:01.000Z] ✅ Contract has both ETH and token balance - full V3 buy/sell functionality available
[2025-01-17T10:35:02.000Z] 🔄 Starting infinite V3 volume bot loop for wallets 0-100
[2025-01-17T10:35:03.000Z] 📊 Cycle 1 - Wallet 1/100 (Index: 0)
[2025-01-17T10:35:03.000Z] V3 Gas cost: 0.0000007 ETH (within limit: 0.0000008 ETH)
[2025-01-17T10:35:04.000Z] ✅ Wallet 0 V3 successful - Gas efficiency: 82.1%
[2025-01-17T10:35:04.000Z] 💎 V3 Fee tier used: 10000 basis points
[2025-01-17T10:35:04.000Z] ⏱️  Waiting 150ms before next V3 transaction...
[2025-01-17T10:35:05.000Z] 📊 Cycle 1 - Wallet 2/100 (Index: 1)
[2025-01-17T10:35:05.000Z] V3 Gas cost: 0.0000012 ETH (exceeds limit: 0.0000008 ETH)
[2025-01-17T10:35:05.000Z] 💰 Wallet 1 V3 skipped due to high gas costs
...
[2025-01-17T10:37:00.000Z] 🔄 V3 Cycle 1 completed! Starting new cycle...
[2025-01-17T10:37:00.000Z] 📈 V3 Cumulative Stats:
[2025-01-17T10:37:00.000Z]    • Total Processed: 100
[2025-01-17T10:37:00.000Z]    • Successful: 73
[2025-01-17T10:37:00.000Z]    • Failed: 18
[2025-01-17T10:37:00.000Z]    • Gas limit exceeded: 9
[2025-01-17T10:37:00.000Z]    • Success Rate: 73.00%
[2025-01-17T10:37:00.000Z]    • Average V3 gas efficiency: 81.7%
[2025-01-17T10:37:00.000Z]    • V3 Fee tier performance: Excellent
[2025-01-17T10:37:00.000Z] 🔄 Looping back to wallet 0
[2025-01-17T10:37:00.000Z] ⏱️  Waiting 3000ms before next V3 cycle...
```

### **Enhanced V3 Multi-Swap Processing**
```
[2025-01-17T10:40:00.000Z] 🔄 Processing V3 multi-swap for wallets 0-99
[2025-01-17T10:40:00.000Z] 🎯 V3 Tokens: 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc, 0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9
[2025-01-17T10:40:00.000Z] 💎 V3 Fee tier: 10000 basis points (1%)
[2025-01-17T10:40:01.000Z] ✅ Wallet 0: V3 Success - 2 tokens swapped via multicall
[2025-01-17T10:40:01.000Z]    TX: 0xabc123... (Gas efficiency: 84.2%)
[2025-01-17T10:40:01.000Z]    V3 multicall vs individual: 35% gas savings
[2025-01-17T10:40:02.000Z] 💰 Wallet 3: V3 Skipped - Gas cost 0.000001 ETH exceeds limit
[2025-01-17T10:40:03.000Z] ✅ Wallet 5: V3 Success - 2 tokens swapped (Gas efficiency: 86.1%)
[2025-01-17T10:40:04.000Z] 📈 V3 Batch completed:
[2025-01-17T10:40:04.000Z]    • V3 Successful: 18/25 (72.0%)
[2025-01-17T10:40:04.000Z]    • V3 Failed: 4
[2025-01-17T10:40:04.000Z]    • V3 Gas exceeded: 3
[2025-01-17T10:40:04.000Z]    • Average V3 gas efficiency: 83.7%
[2025-01-17T10:40:04.000Z]    • V3 Multicall efficiency: 87.2%
```

### **Enhanced Fund Withdrawal (V2/V3 Compatible)**
```
[2025-01-17T10:45:00.000Z] 🏦 Withdrawing from contract: 0x789...GHI
[2025-01-17T10:45:00.000Z] Gas cost check: 0.0000004 ETH (within limit: 0.0000008 ETH)
[2025-01-17T10:45:01.000Z] 🔍 Checking contract balances before withdrawal...
[2025-01-17T10:45:01.000Z] 💰 Contract ETH balance: 1.8 ETH
[2025-01-17T10:45:01.000Z] 🪙 Contract EBERT balance: 25,000.0 EBERT
[2025-01-17T10:45:01.000Z] 📊 Contract used for: V2 and V3 operations
[2025-01-17T10:45:02.000Z] ✅ Withdrawal SUCCESS: 0xABC123...
[2025-01-17T10:45:02.000Z] ⛽ Gas used: 145,678 (efficiency: 89.1%)
[2025-01-17T10:45:02.000Z] 💰 Actual gas cost: 0.00000035 ETH
[2025-01-17T10:45:02.000Z] 📈 ETH withdrawn: 1.8 ETH
[2025-01-17T10:45:02.000Z] 📈 EBERT withdrawn: 25,000.0 EBERT
[2025-01-17T10:45:02.000Z] 📊 Net ETH gain: 1.79999965 ETH
```

## 🔧 Enhanced Troubleshooting

### **V3-Specific Issues**

**❌ "V3 pool has insufficient liquidity"**
- Check if the V3 pool exists for your token pair
- Try different fee tiers (500, 3000, 10000)
- Verify token is available on Uniswap V3
- Monitor pool liquidity before large operations

**❌ "V3 gas cost higher than V2"**
- This is normal - V3 operations require more gas
- Adjust `GAS_MAX` for V3 operations: `GAS_MAX=0.000001`
- Use V3 multicall for better efficiency
- Consider V3 timing adjustments

**📊 V3 Low efficiency (<60%)**
- V3 pools may have complex routing
- Use larger delays: `delay_tx=200` for V3
- Check fee tier selection for your token pair
- Monitor V3 pool activity and adjust timing

### **Gas-Related Issues (V2 + V3)**

**❌ "Gas cost exceeds maximum limit"**
- This is normal behavior during high gas periods
- V3 operations typically need 20-40% more gas than V2
- Transactions are automatically skipped to save money
- Adjust `GAS_MAX` separately for V2 and V3 operations

**❌ "All V3 transactions being skipped"**
- V3 gas prices are higher than your current `GAS_MAX`
- Increase V3 gas limit: `GAS_MAX=0.000001`
- Use V3 multicall for better gas efficiency
- Consider running V3 operations during off-peak hours

**📊 V3 vs V2 Performance Comparison**
```bash
# Monitor both protocols simultaneously
node script.js volumeV2 0 100 0xV2Token 150 3000 &
node script.js volumeV3 100 200 0xV3Token 150 3000 &

# Compare gas efficiency between protocols
# V2 typically: 80-90% efficiency
# V3 typically: 70-85% efficiency (higher complexity)
```

### **Enhanced Error Recovery (V2 + V3)**
```bash
# All functions now include V3-aware error handling:
# - V3-specific retry logic with fee tier adjustments
# - V3 pool liquidity validation before operations
# - Enhanced gas estimation for V3 complexity
# - V3 multicall optimization for batch operations
```

## 🆕 New V3 Features Summary

### **🔥 V3 Integration System**
- ✅ Complete Uniswap V3 protocol support
- ✅ V3 fee tier selection and optimization (500, 3000, 10000)
- ✅ V3 multicall contract for efficient multi-token swaps
- ✅ Automatic ETH→WETH conversion for V3 operations
- ✅ V3-specific gas estimation and optimization

### **⚡ V3 Advanced Controls**
- ✅ V3-optimized timing controls and delays
- ✅ V3 vs V2 performance comparison and analytics
- ✅ V3 pool liquidity validation before operations
- ✅ V3 fee tier performance tracking and recommendations
- ✅ V3 multicall efficiency monitoring

### **📊 V3 Enhanced Monitoring**
- ✅ Real-time V3 gas cost calculations and V2 comparisons
- ✅ V3 success rate tracking with protocol-specific breakdowns
- ✅ V3 fee tier efficiency percentages and optimization
- ✅ V3 multicall vs individual swap performance analysis
- ✅ V3 pool activity and liquidity monitoring

### **🛡️ V3 Improved Reliability**
- ✅ V3-specific error handling and categorization
- ✅ V3 pool routing optimization and fallback mechanisms
- ✅ V3 liquidity validation and pool health checks
- ✅ V3 multicall transaction batching and optimization
- ✅ V3 fee tier auto-adjustment based on performance

## 🔧 Installation & Maintenance (V3 Enhanced)

### **Automated Setup with V3 Support**
```bash
# Complete setup with V3 support
./install.sh setup

# Update to latest version with V3 features
./install.sh update

# Validate script integrity including V3 components
./install.sh validate

# Check Node.js and V3 dependencies
./install.sh check-node
```

### **V3-Enhanced Maintenance Commands**
```bash
# Update to latest version with V3 support
./install.sh update

# Check wallet statistics with V3 analytics
node script.js check

# Emergency ETH recovery with V3-aware gas management
node script.js recoverETH [private_key] [main_wallet_address]

# Withdraw all funds from V2/V3 compatible contracts
node script.js withdraw-token [token_address]

# Test V3 operations with small amounts
node script.js swapv3 0 5 0xV3TokenAddress
```

## ⚠️ Enhanced Important Notes (V3 Updated)

- **🔐 Security**: Store private keys securely, never commit `.env` to version control
- **⛽ V3 Gas Management**: V3 operations typically use 20-40% more gas than V2
- **🎯 V3 Fee Tiers**: Choose appropriate fee tiers for your token pairs
- **📊 V3 Performance**: Monitor V3 vs V2 efficiency for optimization
- **🎛️ V3 Timing Control**: V3 operations may need slightly longer delays
- **⏰ Rate Limits**: Built-in intelligent delays prevent RPC rate limiting
- **💾 Backup**: Keep backups of `wallets.json` - contains all your generated wallets
- **🧪 V3 Testing**: Test V3 operations with small amounts first
- **🔄 V3 Automation**: V3 continuous automation commands run indefinitely
- **💸 V3 Recovery**: Enhanced ETH recovery includes V3-aware gas validation
- **🏭 V3 Contract Funding**: VolumeSwap contracts work with both V2 and V3 tokens
- **📊 V3 Volume Generation**: Monitor V3 pool liquidity and fee tier performance
- **🔄 V3 Infinite Loops**: V3 volume bots run continuously with enhanced monitoring
- **💰 V3 Cost Control**: V3 gas management prevents unexpected high costs
- **🎯 V3 Optimization**: Use V3 multicall for better gas efficiency
- **📈 V3 Scaling**: Start with conservative V3 settings and scale based on performance

## 🚀 Getting Started with V3 Features

1. **Install and Setup**: Use the automated installer with V3 support
2. **Configure V3 Settings**: Set appropriate `DEFAULT_V3_FEE` and `GAS_MAX` in `.env`
3. **Test V3 Operations**: Try V3 swaps with small amounts first
4. **Monitor V3 Performance**: Watch V3 gas efficiency and fee tier performance
5. **Optimize V3 Timing**: Adjust delays based on V3 network conditions
6. **Scale V3 Gradually**: Increase V3 batch sizes and instance counts as needed
7. **Compare V2 vs V3**: Use analytics to choose optimal protocol for your needs

The enhanced TurboBot now provides complete Uniswap V3 integration alongside V2 support, with intelligent cost control and performance optimization for both protocols. Perfect for maximizing opportunities across all Uniswap liquidity pools!

## 🔮 V3 Roadmap & Future Features

### **Planned V3 Features**
- **🤖 V3 AI-Powered Trading**: Machine learning for optimal fee tier selection
- **📊 V3 Advanced Analytics**: Detailed V3 vs V2 performance comparison dashboard
- **🔄 V3 Multi-Chain Support**: V3 operations across multiple EVM chains
- **🎯 V3 Concentrated Liquidity**: Integration with V3 liquidity provision
- **📱 V3 Web Dashboard**: Real-time V3 pool monitoring and control
- **🔔 V3 Notifications**: V3-specific alerts and performance notifications
- **⛽ V3 Dynamic Gas Pricing**: AI-powered V3 gas optimization strategies

### **V3 Smart Contract Enhancements**
- **🎯 V3 Fee Tier Auto-Selection**: Dynamic fee tier optimization based on volatility
- **⏰ V3 Time-Based Logic**: V3 pool activity-based trading schedules
- **📈 V3 Volume Targets**: V3-specific volume milestones and tracking
- **🔄 V3 Multi-Pool Support**: Single contract handling multiple V3 pools
- **💰 V3 Profit Tracking**: V3-specific P&L tracking with fee tier analysis
- **⛽ V3 Gas-Aware Trading**: V3 smart contract gas optimization features

### **V3 Infrastructure Improvements**
- **☁️ V3 Cloud Deployment**: V3-optimized cloud instance deployment
- **🔄 V3 Auto-Scaling**: Dynamic V3 instance scaling based on pool activity
- **🛡️ V3 Enhanced Security**: V3-specific security features and validations
- **📊 V3 Database Integration**: V3 pool data and analytics storage
- **🌐 V3 API Interface**: RESTful API for V3 operations and monitoring
- **⛽ V3 Gas Oracle Integration**: V3-specific gas price optimization

## 🤝 Contributing & Support (V3 Enhanced)

This is an **open source project** with complete V3 support - we welcome contributions! 

### **How to Contribute to V3 Features**
1. Fork the repository
2. Create a V3 feature branch
3. Implement V3 enhancements or new V3 functionality
4. Ensure V3 functions maintain existing error handling and logging patterns
5. Test new V3 features with small amounts and different fee tiers
6. Include V3 gas management and timing controls in new features
7. Document V3-specific configuration and usage patterns
8. Submit a pull request with V3 feature descriptions

### **Recent Major V3 Updates**
- **🎯 Complete V3 Integration**: Full Uniswap V3 protocol support
- **💎 V3 Fee Tier System**: Configurable fee tier selection and optimization
- **🔄 V3 Multicall Contract**: Efficient multi-token V3 swap batching
- **⛽ V3 Gas Management**: V3-specific gas estimation and optimization
- **📊 V3 Analytics System**: Comprehensive V3 vs V2 performance tracking
- **🔄 V3 Automation Support**: Complete V3 continuous automation features
- **🛡️ V3 Enhanced Reliability**: V3-specific error handling and recovery

### **Support the V3 Project**
If you find the V3 features useful, consider supporting development:

**Donation Address**: `0xEd1fed9A43B434a053159732b606bbbc7FE9498e`

Your donations help maintain and improve both V2 and V3 features for the community!

### **Getting V3 Help**
- Check the V3-enhanced troubleshooting section above
- Review the V3 command examples and gas management features
- Ensure your `.env` file includes V3 configuration (`DEFAULT_V3_FEE`)
- Test V3 operations with small amounts before scaling up
- For V3 volume generation, ensure contracts are properly funded
- Monitor V3 gas efficiency metrics and fee tier performance
- Compare V2 vs V3 performance for your specific use cases

## 📄 License

**MIT License** - This project is completely open source and free to use, modify, and distribute.

## 🔗 Links

- **GitHub Repository**: [TurboBot](https://github.com/tiagoterron/TurboBot)
- **Base Network**: [Base Chain](https://base.org/)
- **Uniswap V2**: [Uniswap V2 Protocol](https://uniswap.org/blog/uniswap-v2)
- **Uniswap V3**: [Uniswap V3 Protocol](https://uniswap.org/blog/uniswap-v3)
- **Base Gas Tracker**: [Base Gas Tracker](https://basescan.org/gastracker)
- **V3 Pool Explorer**: [Uniswap V3 Analytics](https://info.uniswap.org/)

---

**⚡ Ready to generate volume with V3 support and intelligent gas management? Start with `./install.sh setup` and experience the enhanced V2 + V3 automation features!**

*The new V3 integration alongside existing V2 support provides complete Uniswap protocol coverage with professional-grade automation and intelligent cost optimization. Monitor your V2 vs V3 performance, optimize your fee tiers, and maximize your results across all liquidity pools while minimizing costs!*