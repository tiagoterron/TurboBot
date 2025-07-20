# 🚀 Turbo Microtx on Basechain

An open-source Node.js automation tool for creating multiple wallets, distributing ETH via airdrops, deploying VolumeSwap contracts, and executing automated token swaps on Base network. Perfect for DeFi interactions, volume generation, testing, and large-scale wallet management.

> **📢 Open Source Project**: This project is completely open source and free to use. Feel free to fork, modify, and distribute according to your needs!

## ✨ Features

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

## 🏗️ Architecture

```
├── install.sh          # Setup and dependency management
├── script.js           # Core automation engine
├── package.json        # Node.js dependencies
├── .env                # Configuration file
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

### 3. Configure Environment
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

# Gas Settings (optional)
GAS_PRICE_GWEI=1.0
GAS_LIMIT=21000
```

### 4. Basic Usage
```bash
# Create 1000 wallets
node script.js create 1000

# Distribute 5 ETH among all wallets
node script.js airdrop-batch 200 5.0

# Deploy VolumeSwap contract for a token
node script.js deploy 0xTokenAddress

# Execute infinite volume generation
node script.js volumeV2 0 100 0xTokenAddress
```

## 📖 Command Reference

### 🎒 Wallet Management
```bash
# Create new wallets (appends to existing)
node script.js create [count]

# Create wallets to reach exact target count
node script.js target [total_count]

# Check wallet statistics and balances
node script.js check
```

### 💰 Airdrop Operations
```bash
# Batch airdrops with total ETH distribution
node script.js airdrop-batch [chunk_size] [total_eth]

# Airdrop to specific wallet range
node script.js airdrop [start] [end] [total_eth]

# Examples:
node script.js airdrop-batch 200 10.0    # 10 ETH across all wallets
node script.js airdrop 0 100 0.5         # 0.5 ETH to first 100 wallets
```

### 🏭 Contract Deployment & Management (NEW!)
```bash
# Deploy VolumeSwap contract for any token
node script.js deploy [token_address]

# Examples:
node script.js deploy 0xc849418f46A25D302f55d25c40a82C99404E5245  # Deploy for KIKI
node script.js deploy 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460  # Deploy for TURBO
```

### 📊 Infinite Volume Generation (NEW!)
```bash
# Run infinite volume bot with balance validation
node script.js volumeV2 [start] [end] [token_address]

# Examples:
node script.js volumeV2                                           # All wallets, random token
node script.js volumeV2 0 500                                     # First 500 wallets, random token
node script.js volumeV2 0 100 0xc849418f46A25D302f55d25c40a82C99404E5245  # Specific range and token

# Features:
# - Automatically finds or deploys contract for token
# - Validates contract has ETH/token balance before starting
# - Infinite loop with cycle tracking and statistics
# - Automatic error recovery and wallet management
# - Real-time progress monitoring and success rates
```

### 💸 Fund Withdrawal (NEW!)
```bash
# Withdraw from specific contract address
node script.js withdraw [contract_address] [token_address]

# Withdraw using token address (finds contract automatically)
node script.js withdraw-token [token_address]

# Examples:
node script.js withdraw 0xContractAddress123...                   # Withdraw from specific contract
node script.js withdraw-token 0xc849418f46A25D302f55d25c40a82C99404E5245  # Find and withdraw KIKI contract
```

### 🔄 Swap Operations
```bash
# Single token swaps
node script.js swap-batch [batch_size] [token_address]
node script.js swap [start] [end] [token_address]

# Multi-token swaps (multiple tokens per transaction)
node script.js multiswap-batch [batch_size] [token1,token2,token3]
node script.js multiswap [start] [end] [token1,token2,token3]

# Uniswap V3 swaps
node script.js swapv3-batch [batch_size] [token_address] [start] [end]
node script.js swapv3 [start] [end] [token_address]
```

### 🔄 Continuous Automation
```bash
# Create wallet, fund, swap multiple tokens, and recover ETH in infinite loop
node script.js create-and-swap [token1,token2,token3]

# Create wallet, fund, swap V3 tokens, and recover ETH in infinite loop
node script.js create-and-swapv3 [token_address]

# Recover ETH from a specific wallet
node script.js recoverETH [private_key] [receiver_address]
```

## 🎯 Tokens for Testing

### **Uniswap V2 Tokens**
- **KIKI**: `0xc849418f46A25D302f55d25c40a82C99404E5245`
- **TURBO**: `0xBA5E66FB16944Da22A62Ea4FD70ad02008744460`
- **LORDY**: `0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB`
- **WORKIE**: `0x7480527815ccAE421400Da01E052b120Cc4255E9`

### **Uniswap V3 Tokens**
- **Ebert**: `0xf83cde146AC35E99dd61b6448f7aD9a4534133cc`
- **BasedBonk**: `0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9`

## 💡 Usage Examples

### Basic Workflow
```bash
# 1. Create wallets
node script.js create 1000

# 2. Check created wallets
node script.js check

# 3. Distribute ETH (5 ETH total, 200 wallets per transaction)
node script.js airdrop-batch 200 5.0

# 4. Execute swaps (50 wallets per batch, random V2 token)
node script.js swap-batch 50
```

### Advanced Volume Generation Workflow (NEW!)
```bash
# 1. Create wallets and fund them
node script.js create 500
node script.js airdrop-batch 100 2.0

# 2. Deploy VolumeSwap contract for your token
node script.js deploy 0xc849418f46A25D302f55d25c40a82C99404E5245

# 3. Fund the deployed contract with ETH and tokens
# (Send ETH and tokens to the contract address shown after deployment)

# 4. Start infinite volume generation
node script.js volumeV2 0 500 0xc849418f46A25D302f55d25c40a82C99404E5245

# 5. Withdraw funds when done
node script.js withdraw-token 0xc849418f46A25D302f55d25c40a82C99404E5245
```

### Advanced Multi-Token Strategy
```bash
# Create exactly 2000 wallets
node script.js target 2000

# Distribute 20 ETH across all wallets (100 per chunk)
node script.js airdrop-batch 100 20.0

# Multi-token swaps with specific tokens
node script.js multiswap-batch 25 "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460,0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB"
```

### Continuous Automation
```bash
# Infinite loop: Create wallet → Fund → Multi-swap → Recover ETH
node script.js create-and-swap "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460,0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB"

# Infinite loop: Create wallet → Fund → V3 swap → Recover ETH
node script.js create-and-swapv3 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc

# Emergency ETH recovery from any wallet
node script.js recoverETH your_private_key_here 0xYourMainWalletAddress
```

## 🏭 VolumeSwap Contract Features

The bot includes a powerful VolumeSwap contract deployment and management system:

### **Contract Capabilities**
- **🤖 Automated Trading**: Smart buy/sell logic based on contract balances
- **🎲 Random Amounts**: Uses randomized percentages for natural trading patterns
- **⚖️ Balance Management**: Automatically switches between buying and selling
- **🔧 Owner Controls**: Configurable buy/sell percentages and maximum buy amounts
- **💸 Fund Recovery**: Complete withdrawal system for ETH and tokens

### **Deployment Process**
1. **Deploy Contract**: `node script.js deploy [token_address]`
2. **Fund Contract**: Send ETH and tokens to the deployed contract address
3. **Generate Volume**: `node script.js volumeV2 [range] [token_address]`
4. **Monitor Progress**: Real-time stats and cycle tracking
5. **Withdraw Funds**: `node script.js withdraw-token [token_address]`

### **Volume Generation Features**
- **🔍 Balance Validation**: Checks contract has sufficient ETH/token balance
- **🔄 Infinite Loops**: Continuous operation with cycle tracking
- **📊 Smart Logic**: Buys when ETH available, sells when tokens available
- **📈 Statistics**: Real-time success rates and performance metrics
- **🛡️ Error Recovery**: Automatic retry and error handling
- **⏸️ Graceful Control**: Easy stop with Ctrl+C

## ⚙️ Configuration Options

### Environment Variables (.env)
```env
# Network Configuration
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
PK_MAIN=funding_wallet_private_key

# Default Batch Sizes
DEFAULT_WALLET_COUNT=1000    # Default wallets to create
DEFAULT_CHUNK_SIZE=500       # Wallets per airdrop transaction
DEFAULT_BATCH_SIZE=50        # Wallets per swap batch

# Gas Settings (optional)
GAS_PRICE_GWEI=1.0          # Custom gas price
GAS_LIMIT=21000             # Custom gas limit
```

### Smart Features

**💰 Proportional Distribution**: Airdrops divide total ETH evenly
```bash
# 10 ETH across 1000 wallets = 0.01 ETH per wallet
node script.js airdrop-batch 200 10.0
```

**🏭 Smart Contract Management**: Automatic deployment and balance validation
```bash
# Automatically deploys if contract doesn't exist
node script.js volumeV2 0 100 0xTokenAddress
```

**🔄 Random Token Selection**: Uses random tokens when none specified
```bash
# Automatically selects random V2 tokens
node script.js swap-batch 50
```

**🔄 Continuous Automation**: Create, fund, swap, and recover in infinite loops
```bash
# Runs indefinitely with automatic error recovery
node script.js create-and-swap
```

**💸 Smart ETH Recovery**: Automatically calculates gas costs and recovers maximum ETH
```bash
# Recovers all possible ETH while reserving gas
node script.js recoverETH [private_key]
```

## 📊 Output Examples

### Contract Deployment
```
[2025-01-17T10:30:00.000Z] Deploying from main wallet: 0x123...ABC
[2025-01-17T10:30:00.000Z] Token address: 0xc849418f46A25D302f55d25c40a82C99404E5245
[2025-01-17T10:30:01.000Z] ✅ Deploy SUCCESS: 0xDEF456...
[2025-01-17T10:30:01.000Z] 📄 Deployed contract address: 0x789...GHI
[2025-01-17T10:30:01.000Z] 🚨 IMPORTANT NEXT STEPS:
[2025-01-17T10:30:01.000Z] 📤 You must now send funds (ETH/tokens) to: 0x789...GHI
[2025-01-17T10:30:01.000Z] ⚠️  Make sure to transfer tokens before running swap operations!
```

### Volume Generation
```
[2025-01-17T10:35:00.000Z] 🎯 Starting VolumeV2 for token: 0xc849418f46A25D302f55d25c40a82C99404E5245
[2025-01-17T10:35:00.000Z] ✅ Using existing contract: 0x789...GHI
[2025-01-17T10:35:01.000Z] 🔍 Checking contract balances...
[2025-01-17T10:35:01.000Z] 💰 Contract ETH balance: 2.5 ETH
[2025-01-17T10:35:01.000Z] 🪙 Contract KIKI balance: 50,000.0 KIKI
[2025-01-17T10:35:01.000Z] ✅ Contract has both ETH and token balance - full buy/sell functionality available
[2025-01-17T10:35:02.000Z] 🔄 Starting infinite volume bot loop for wallets 0-100
[2025-01-17T10:35:03.000Z] 📊 Cycle 1 - Wallet 1/100 (Index: 0)
[2025-01-17T10:35:04.000Z] ✅ Wallet 0 successful (Total success: 1)
...
[2025-01-17T10:37:00.000Z] 🔄 Cycle 1 completed! Starting new cycle...
[2025-01-17T10:37:00.000Z] 📈 Cumulative Stats:
[2025-01-17T10:37:00.000Z]    • Total Processed: 100
[2025-01-17T10:37:00.000Z]    • Successful: 95
[2025-01-17T10:37:00.000Z]    • Failed: 5
[2025-01-17T10:37:00.000Z]    • Success Rate: 95.00%
[2025-01-17T10:37:00.000Z] 🔄 Looping back to wallet 0
```

### Fund Withdrawal
```
[2025-01-17T10:40:00.000Z] 🏦 Withdrawing from contract: 0x789...GHI
[2025-01-17T10:40:01.000Z] 🔍 Checking contract balances before withdrawal...
[2025-01-17T10:40:01.000Z] 💰 Contract ETH balance: 1.8 ETH
[2025-01-17T10:40:01.000Z] 🪙 Contract KIKI balance: 25,000.0 KIKI
[2025-01-17T10:40:02.000Z] ✅ Withdrawal SUCCESS: 0xABC123...
[2025-01-17T10:40:02.000Z] 📈 ETH withdrawn: 1.8 ETH
[2025-01-17T10:40:02.000Z] 📈 KIKI withdrawn: 25,000.0 KIKI
[2025-01-17T10:40:02.000Z] 📊 Net ETH gain: 1.75 ETH
```

### Wallet Creation
```
[2025-01-17T10:30:00.000Z] Creating 1000 new wallets...
[2025-01-17T10:30:00.000Z] Found 0 existing wallets
[2025-01-17T10:30:01.000Z] Created 100/1000 new wallets
[2025-01-17T10:30:02.000Z] Created 200/1000 new wallets
...
[2025-01-17T10:30:10.000Z] ✅ Successfully created 1000 new wallets
[2025-01-17T10:30:10.000Z] 📊 Total wallets: 1000 (0 existing + 1000 new)
```

### Continuous Automation
```
[2025-01-17T10:35:00.000Z] Created new wallet: 0xABC123... 0x1234567...
[2025-01-17T10:35:00.000Z] Funding new wallet with 0.00001 ETH...
[2025-01-17T10:35:01.000Z] ✅ Funding successful
[2025-01-17T10:35:02.000Z] Swapping 10 wei for each of 2 tokens...
[2025-01-17T10:35:03.000Z] ✅ Multi-swap successful: 0xDEF456...
[2025-01-17T10:35:04.000Z] ✅ ETH sent back: 0xGHI789...
[2025-01-17T10:35:05.000Z] 🔄 Cycle completed. Starting next cycle...
```

## 🔄 Running Multiple Instances

Scale your operations by running multiple instances simultaneously with different wallets. This allows you to multiply your transaction volume and efficiency.

### Option 1: Using Inline Environment Variables (Recommended for Testing)
**Terminal 1:**
```bash
PK_MAIN=your_first_private_key_here node script.js volumeV2 0 100 0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9
```

**Terminal 2:**
```bash
PK_MAIN=your_second_private_key_here node script.js volumeV2 100 200 0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9
```

### Option 2: Using Export Commands
**Terminal 1:**
```bash
export PK_MAIN=your_first_private_key_here
node script.js volumeV2 0 250 "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460"
```

**Terminal 2:**
```bash
export PK_MAIN=your_second_private_key_here
node script.js volumeV2 250 500 "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460"
```

### Option 3: PM2 with Ecosystem Config (Recommended for Production)

**Step 1:** Install PM2 globally
```bash
npm install -g pm2
```

**Step 2:** Create `ecosystem.config.js`
```javascript
module.exports = {
  apps: [
    {
      name: 'VolumeBot-Wallet1',
      script: 'script.js',
      args: 'volumeV2 0 200 0xc849418f46A25D302f55d25c40a82C99404E5245',
      env: {
        PK_MAIN: 'your_first_private_key_here',
        RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY'
      },
      autorestart: true,
      max_restarts: 10
    },
    {
      name: 'VolumeBot-Wallet2',
      script: 'script.js',
      args: 'volumeV2 200 400 0xc849418f46A25D302f55d25c40a82C99404E5245',
      env: {
        PK_MAIN: 'your_second_private_key_here',
        RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY'
      },
      autorestart: true,
      max_restarts: 10
    },
    {
      name: 'TraditionalBot-Wallet3',
      script: 'script.js',
      args: 'create-and-swap "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460,0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB"',
      env: {
        PK_MAIN: 'your_third_private_key_here',
        RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY'
      },
      autorestart: true,
      max_restarts: 10
    }
  ]
};
```

**Step 3:** Start all instances simultaneously
```bash
pm2 start ecosystem.config.js
```

**Step 4:** Manage your instances
```bash
# Check status of all instances
pm2 status

# View logs for all instances
pm2 logs

# View logs for specific instance
pm2 logs VolumeBot-Wallet1

# Stop all instances
pm2 stop all

# Stop specific instance
pm2 stop VolumeBot-Wallet1

# Restart all instances
pm2 restart all

# Delete all instances
pm2 delete all

# Save PM2 configuration (survives reboots)
pm2 save
pm2 startup
```

### Option 4: Using Different .env Files

**Step 1:** Create multiple environment files
```bash
# .env.wallet1
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
PK_MAIN=your_first_private_key_here
DEFAULT_WALLET_COUNT=1000

# .env.wallet2
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
PK_MAIN=your_second_private_key_here
DEFAULT_WALLET_COUNT=1000

# .env.wallet3
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
PK_MAIN=your_third_private_key_here
DEFAULT_WALLET_COUNT=1000
```

**Step 2:** Run with different config files
```bash
# Terminal 1
node -r dotenv/config script.js dotenv_config_path=.env.wallet1 volumeV2 0 300 0xc849418f46A25D302f55d25c40a82C99404E5245

# Terminal 2
node -r dotenv/config script.js dotenv_config_path=.env.wallet2 volumeV2 300 600 0xc849418f46A25D302f55d25c40a82C99404E5245

# Terminal 3
node -r dotenv/config script.js dotenv_config_path=.env.wallet3 create-and-swap "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460"
```

### Option 5: PM2 with Direct Environment Variables

```bash
# Start multiple volume bot instances with different private keys
PK_MAIN=first_private_key pm2 start script.js --name VolumeBot-1 -- volumeV2 0 200 0xc849418f46A25D302f55d25c40a82C99404E5245

PK_MAIN=second_private_key pm2 start script.js --name VolumeBot-2 -- volumeV2 200 400 0xc849418f46A25D302f55d25c40a82C99404E5245

PK_MAIN=third_private_key pm2 start script.js --name TraditionalBot-3 -- create-and-swap "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460,0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB"
```

### 🚀 Multiple Instance Benefits

- **📈 Increased Volume**: Run 2-10+ instances simultaneously
- **⚡ Parallel Processing**: Each instance operates independently  
- **🔄 Different Strategies**: Mix volume generation and traditional swaps
- **💰 Separate Wallets**: Each instance uses its own funding wallet
- **🛡️ Risk Distribution**: Spread operations across multiple keys
- **📊 Better Monitoring**: Track performance per wallet/instance
- **🏭 Contract Sharing**: Multiple instances can use the same deployed contract

### ⚠️ Multiple Instance Considerations

1. **💰 Funding Requirements**: Each wallet needs sufficient ETH balance
2. **🏭 Contract Funding**: Volume bots need well-funded contracts
3. **🌊 Gas Price Impact**: More instances = higher total gas consumption
4. **⏰ RPC Rate Limits**: Monitor your RPC provider's rate limits
5. **📊 Performance Monitoring**: Use PM2 for production monitoring
6. **🔐 Security**: Store multiple private keys securely
7. **📝 Logging**: Each instance generates separate logs

### 📊 Monitoring Multiple Instances

```bash
# Real-time monitoring with PM2
pm2 monit

# Check resource usage
pm2 show VolumeBot-1

# View error logs
pm2 logs VolumeBot-1 --err

# Restart failed instances
pm2 restart VolumeBot-1

# Scale instances (if using cluster mode)
pm2 scale VolumeBot-1 +2
```

### 🎯 Recommended Setup for Different Scales

**Small Scale (2-3 instances):**
- Use Option 1 (Inline env vars) for testing
- Use Option 2 (Export) for longer sessions

**Medium Scale (4-10 instances):**
- Use Option 3 (PM2 ecosystem) for better management
- Implement proper monitoring and logging

**Large Scale (10+ instances):**
- Use Option 3 with advanced PM2 features
- Consider load balancing across multiple RPC endpoints
- Implement comprehensive monitoring and alerting

## 🔧 Installation & Maintenance

### Automated Setup
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

### Manual Setup Requirements
- **Node.js v16+** (automatically installed by setup script)
- **npm or yarn** (included with Node.js)
- **curl or wget** (for downloading external files)
- **PM2** (optional, for production multi-instance management)

## 🔧 Troubleshooting

### Common Issues

**❌ "PK_MAIN not configured"**
- Ensure your `.env` file contains your funding wallet private key
- Private key should be without `0x` prefix

**❌ "Insufficient balance"**
- Check your funding wallet has enough ETH for airdrops + gas fees
- Consider reducing airdrop amounts or batch sizes

**❌ "No wallets found"**
- Run `node script.js create [count]` first to generate wallets
- Check if `wallets.json` exists and contains valid data

**❌ "Contract has no ETH or token balance"**
- Fund the deployed contract with ETH and/or tokens before running volume bot
- Check contract address after deployment and send funds there

**❌ Gas estimation failures**
- Increase gas price in `.env`: `GAS_PRICE_GWEI=2.0`
- Reduce batch sizes to avoid network congestion

**🔄 Continuous automation stuck**
- Check RPC connection and gas prices
- Verify funding wallet has sufficient balance
- Script includes automatic error recovery and retry logic

**🏭 Volume bot not working**
- Ensure contract is deployed: `node script.js deploy [token_address]`
- Verify contract has balance before starting volume generation
- Check that the correct contract address is being used

### Maintenance Commands
```bash
# Update to latest version
./install.sh update

# Validate script integrity
./install.sh validate

# Check wallet statistics
node script.js check

# Emergency ETH recovery
node script.js recoverETH [private_key] [main_wallet_address]

# Withdraw all funds from deployed contracts
node script.js withdraw-token [token_address]
```

## ⚠️ Important Notes

- **🔐 Security**: Store private keys securely, never commit `.env` to version control
- **🌊 Gas Costs**: Monitor gas prices on Base network for optimal execution
- **⏰ Rate Limits**: Built-in delays prevent RPC rate limiting
- **💾 Backup**: Keep backups of `wallets.json` - contains all your generated wallets
- **🧪 Testing**: Test with small amounts first before large-scale operations
- **🔄 Automation**: Continuous automation commands run indefinitely - use Ctrl+C to stop
- **💸 Recovery**: Always test ETH recovery with small amounts first
- **🏭 Contract Funding**: VolumeSwap contracts need both ETH and tokens to function properly
- **📊 Volume Generation**: Monitor contract balances and withdraw funds regularly
- **🔄 Infinite Loops**: Volume bots run continuously - ensure proper monitoring and stopping procedures

## 🏭 VolumeSwap Contract Technical Details

### **Smart Contract Architecture**
The VolumeSwap contract is designed for natural volume generation with the following features:

**🤖 Intelligent Trading Logic:**
- Automatically buys tokens when ETH balance is above threshold
- Automatically sells tokens when token balance is available
- Uses randomized percentages (10% + random%) for natural patterns
- Configurable buy/sell percentages and maximum buy amounts

**🔧 Owner Controls:**
- `changeSellValue(uint256)` - Adjust sell percentage (default: 70%)
- `changeBuyValue(uint256)` - Adjust buy percentage (default: 70%)
- `setMaxBuy(uint256)` - Set maximum buy threshold (default: 0.0004 ETH)
- `setOwner(address)` - Add additional owners
- `withdraw()` - Withdraw all ETH and tokens

**⚡ Gas Optimization:**
- Efficient swap execution with minimal gas usage
- Smart routing through Uniswap V2
- Automatic slippage handling

### **Deployment Specifications**
- **Network**: Base Mainnet
- **Router**: Uniswap V2 (0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24)
- **WETH**: Base WETH (0x4200000000000000000000000000000000000006)
- **Fee Structure**: Includes protocol fee handling
- **Owner**: Deploying wallet (PK_MAIN)

### **Volume Generation Process**
1. **Contract Analysis**: Checks ETH and token balances
2. **Decision Logic**: Determines buy vs sell based on available balances
3. **Random Amount**: Calculates random percentage for natural trading
4. **Swap Execution**: Executes trade through Uniswap V2
5. **Event Emission**: Logs swap details for monitoring
6. **Cycle Repeat**: Continues infinitely until stopped

### **Balance Requirements**
- **For Buying**: Contract needs ETH balance > maxBuy threshold
- **For Selling**: Contract needs token balance > 0
- **Optimal Setup**: Fund contract with both ETH and tokens for full functionality
- **Monitoring**: Bot validates balances before starting and warns of limitations

## 🚀 Advanced Usage Patterns

### **Professional Volume Generation Setup**
```bash
# 1. Deploy multiple contracts for different tokens
node script.js deploy 0xc849418f46A25D302f55d25c40a82C99404E5245  # KIKI
node script.js deploy 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460  # TURBO
node script.js deploy 0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB  # LORDY

# 2. Fund each contract with appropriate amounts
# Send ETH and tokens to each deployed contract address

# 3. Run multiple volume bots simultaneously
PK_MAIN=wallet1_key pm2 start script.js --name KIKI-Volume -- volumeV2 0 200 0xc849418f46A25D302f55d25c40a82C99404E5245
PK_MAIN=wallet2_key pm2 start script.js --name TURBO-Volume -- volumeV2 0 200 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460
PK_MAIN=wallet3_key pm2 start script.js --name LORDY-Volume -- volumeV2 0 200 0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB

# 4. Monitor all instances
pm2 monit

# 5. Withdraw funds when needed
node script.js withdraw-token 0xc849418f46A25D302f55d25c40a82C99404E5245
node script.js withdraw-token 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460
node script.js withdraw-token 0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB
```

### **Mixed Strategy Deployment**
```bash
# Combine volume generation with traditional methods
pm2 start ecosystem.config.js

# ecosystem.config.js content:
module.exports = {
  apps: [
    {
      name: 'KIKI-VolumeBot',
      script: 'script.js',
      args: 'volumeV2 0 300 0xc849418f46A25D302f55d25c40a82C99404E5245',
      env: { PK_MAIN: 'wallet1_key' }
    },
    {
      name: 'TURBO-VolumeBot', 
      script: 'script.js',
      args: 'volumeV2 300 600 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460',
      env: { PK_MAIN: 'wallet2_key' }
    },
    {
      name: 'Traditional-MultiSwap',
      script: 'script.js', 
      args: 'create-and-swap "0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB,0x7480527815ccAE421400Da01E052b120Cc4255E9"',
      env: { PK_MAIN: 'wallet3_key' }
    },
    {
      name: 'V3-ContinuousSwap',
      script: 'script.js',
      args: 'create-and-swapv3 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc',
      env: { PK_MAIN: 'wallet4_key' }
    }
  ]
};
```

### **Scaling for High Volume**
```bash
# Large scale setup with 10+ instances across multiple tokens
# Terminal 1 - KIKI Volume (4 instances)
PK_MAIN=wallet1 pm2 start script.js --name KIKI-1 -- volumeV2 0 250 0xc849418f46A25D302f55d25c40a82C99404E5245
PK_MAIN=wallet2 pm2 start script.js --name KIKI-2 -- volumeV2 250 500 0xc849418f46A25D302f55d25c40a82C99404E5245
PK_MAIN=wallet3 pm2 start script.js --name KIKI-3 -- volumeV2 500 750 0xc849418f46A25D302f55d25c40a82C99404E5245
PK_MAIN=wallet4 pm2 start script.js --name KIKI-4 -- volumeV2 750 1000 0xc849418f46A25D302f55d25c40a82C99404E5245

# Terminal 2 - TURBO Volume (4 instances)  
PK_MAIN=wallet5 pm2 start script.js --name TURBO-1 -- volumeV2 0 250 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460
PK_MAIN=wallet6 pm2 start script.js --name TURBO-2 -- volumeV2 250 500 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460
PK_MAIN=wallet7 pm2 start script.js --name TURBO-3 -- volumeV2 500 750 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460
PK_MAIN=wallet8 pm2 start script.js --name TURBO-4 -- volumeV2 750 1000 0xBA5E66FB16944Da22A62Ea4FD70ad02008744460

# Terminal 3 - Traditional methods (2 instances)
PK_MAIN=wallet9 pm2 start script.js --name MULTI-1 -- create-and-swap "0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB,0x7480527815ccAE421400Da01E052b120Cc4255E9"
PK_MAIN=wallet10 pm2 start script.js --name V3-1 -- create-and-swapv3 0xf83cde146AC35E99dd61b6448f7aD9a4534133cc

# Monitor all 10 instances
pm2 status
```

## 📊 Performance Optimization

### **Volume Bot Optimization Tips**
1. **🏭 Contract Funding**: Keep contracts well-funded for uninterrupted operation
2. **⚖️ Balance Ratio**: Maintain 60-70% ETH, 30-40% tokens for optimal buy/sell cycles
3. **⏰ Timing**: Run during high gas periods for more realistic volume patterns
4. **🔄 Wallet Range**: Use 100-500 wallets per instance for best performance
5. **💰 Gas Management**: Monitor gas prices and adjust if needed

### **Traditional Method Optimization**
1. **🔄 Funding Amounts**: Use 0.00001-0.00005 ETH per cycle for efficiency
2. **🎯 Token Selection**: Mix popular and lesser-known tokens
3. **⏱️ Timing Delays**: 150ms between transactions, 3s between cycles
4. **💸 Recovery Rate**: Aim for 95%+ ETH recovery rate

### **Multi-Instance Coordination**
1. **📊 Load Distribution**: Spread wallet ranges evenly across instances
2. **🌊 Gas Competition**: Stagger start times to avoid gas price spikes
3. **🔄 Rotation**: Rotate between different tokens and strategies
4. **📈 Monitoring**: Use PM2 monitoring for real-time performance tracking

## 🤝 Contributing & Support

This is an **open source project** and we welcome contributions! 

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all functions maintain existing error handling and logging patterns
5. Test new features with small amounts first
6. Submit a pull request

### Recent Updates
- **🏭 VolumeSwap Contract System**: Deploy and manage volume generation contracts
- **📊 Infinite Volume Bot**: Continuous volume generation with balance validation  
- **💸 Comprehensive Withdrawal**: Full fund recovery from deployed contracts
- **🔍 Smart Balance Validation**: Pre-flight checks for contract functionality
- **📈 Enhanced Statistics**: Real-time success rates and cycle tracking
- **🛡️ Improved Error Handling**: Better recovery and retry mechanisms

### Support the Project
If you find this project useful, consider supporting development:

**Donation Address**: `0xEd1fed9A43B434a053159732b606bbbc7FE9498e`

Your donations help maintain and improve this open source tool for the community!

### Getting Help
- Check the troubleshooting section above
- Review the command examples and new volume generation features
- Ensure your `.env` file is properly configured
- Test with small amounts before scaling up
- For volume generation, ensure contracts are properly funded

## 🔮 Roadmap & Future Features

### **Planned Features**
- **🤖 AI-Powered Trading**: Machine learning for more natural volume patterns
- **📊 Advanced Analytics**: Detailed performance metrics and reporting
- **🔄 Multi-Chain Support**: Expansion to other EVM-compatible chains
- **🎯 Target-Based Volume**: Set specific volume targets and timeframes
- **📱 Web Dashboard**: Real-time monitoring and control interface
- **🔔 Notifications**: Telegram/Discord alerts for important events

### **Smart Contract Enhancements**
- **🎲 Advanced Randomization**: More sophisticated random trading patterns
- **⏰ Time-Based Logic**: Trading schedules and time-based behaviors
- **📈 Volume Targets**: Automatic stopping at volume milestones
- **🔄 Multi-Token Support**: Single contract handling multiple tokens
- **💰 Profit Tracking**: Built-in P&L tracking and optimization

### **Infrastructure Improvements**
- **☁️ Cloud Deployment**: One-click cloud instance deployment
- **🔄 Auto-Scaling**: Dynamic instance scaling based on performance
- **🛡️ Enhanced Security**: Hardware wallet support and key management
- **📊 Database Integration**: Persistent storage for analytics and history
- **🌐 API Interface**: RESTful API for programmatic control

## 📄 License

**MIT License** - This project is completely open source and free to use, modify, and distribute.

## 🔗 Links

- **GitHub Repository**: [TurboBot](https://github.com/tiagoterron/TurboBot)
- **Base Network**: [Base Chain](https://base.org/)
- **Uniswap**: [Uniswap Protocol](https://uniswap.org/)
- **VolumeSwap Contracts**: [Base Explorer](https://basescan.org/)

---

**⚡ Ready to generate volume? Start with `./install.sh setup` and deploy your first VolumeSwap contract!**

*Remember: This is open source software provided as-is. Always test with small amounts, properly fund your contracts, and use at your own risk. The new volume generation features require careful balance management for optimal performance.*