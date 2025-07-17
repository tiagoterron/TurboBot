# 🚀 Turbo Microtx on Basechain

A comprehensive Node.js automation tool for creating multiple wallets, distributing ETH via airdrops, and executing token swaps on Base network. Perfect for DeFi interactions, testing, and large-scale wallet management.

## ✨ Features

- **📝 Wallet Management**: Create thousands of wallets with automatic JSON storage
- **💰 Smart Airdrops**: Distribute ETH with customizable total amounts and batch sizes
- **🔄 Multi-Protocol Swaps**: Support for Uniswap V2, V3, and multi-token swaps
- **⚡ Batch Processing**: Efficient parallel processing with configurable batch sizes
- **🛡️ Error Handling**: Robust error handling with detailed logging
- **🎯 Target-based Creation**: Smart wallet creation to reach exact counts
- **📊 Real-time Monitoring**: Live progress tracking and transaction monitoring

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

### 1. Setup
```bash
wget -O install.sh "https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/install.sh" && chmod +x install.sh && ./install.sh setup && ./install.sh show_help
```

### 2. Configure Environment
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
```

### 3. Basic Usage
```bash
# Create 1000 wallets
node script.js create 1000

# Distribute 5 ETH among all wallets
node script.js airdrop-batch 200 5.0

# Execute token swaps
node script.js swap-batch 50 0xTokenAddress
```

## 📖 Command Reference

### 🎒 Wallet Management
```bash
# Create new wallets (appends to existing)
node script.js create [count]

# Ensure exact wallet count (smart creation)
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

### 🔄 Swap Operations
```bash
# Single token swaps
node script.js swap-batch [batch_size] [token_address]
node script.js swap [start] [end] [token_address]

# Multi-token swaps (multiple tokens per transaction)
node script.js multiswap-batch [batch_size] [token1,token2,token3]
node script.js multiswap [start] [end] [token1,token2,token3]

# Uniswap V3 swaps
node script.js swapv3-batch [batch_size] [token_address]
node script.js swapv3 [start] [end] [token_address]
```

## 🎯 Tokens for testing

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

### Advanced Multi-Token Strategy
```bash
# Create exactly 2000 wallets
node script.js target 2000

# Distribute 20 ETH across all wallets (100 per chunk)
node script.js airdrop-batch 100 20.0

# Multi-token swaps with specific tokens
node script.js multiswap-batch 25 "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460,0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB"
```

### Full Automation Examples
```bash
# Quick automation: 500 wallets, fast processing
node script.js full 500 100 25

# Large scale: 5000 wallets with custom token set
node script.js fullmulti 5000 200 50 "0xTOKEN1,0xTOKEN2,0xTOKEN3"

# V3 focused automation
node script.js fullv3 1000 150 30
```

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

**🔄 Random Token Selection**: Uses random tokens when none specified
```bash
# Automatically selects random V2 tokens
node script.js swap-batch 50
```

## 📊 Output Examples

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

### Airdrop Distribution
```
[2025-01-17T10:35:00.000Z] 📊 Airdrop Distribution Summary:
[2025-01-17T10:35:00.000Z] Total ETH to distribute: 5 ETH
[2025-01-17T10:35:00.000Z] Total wallets: 1000
[2025-01-17T10:35:00.000Z] ETH per wallet: 0.005 ETH
[2025-01-17T10:35:00.000Z] Chunk size: 200 wallets per transaction

[2025-01-17T10:35:01.000Z] Processing chunk 0-200: 1.0 ETH for 200 wallets
[2025-01-17T10:35:01.000Z] 📤 Chunk 0-200 transaction sent: 0xabc123...
[2025-01-17T10:35:05.000Z] ✅ Airdrop chunk 0-200 completed: 0xabc123...
[2025-01-17T10:35:05.000Z] ⛽ Gas used: 2100000
[2025-01-17T10:35:05.000Z] 💰 ETH distributed: 1.0 ETH
```

### Swap Execution
```
[2025-01-17T10:40:00.000Z] Starting single token swap batch processing with batch size: 50
[2025-01-17T10:40:01.000Z] Processing swap batch 0-50
[2025-01-17T10:40:01.000Z] Sending microtx: 0x1234...
[2025-01-17T10:40:02.000Z] ✅ Swap 0 successful: 0xdef456...
[2025-01-17T10:40:02.000Z] Sending microtx: 0x5678...
[2025-01-17T10:40:03.000Z] ✅ Swap 1 successful: 0x789abc...
...
[2025-01-17T10:40:30.000Z] ✅ All swap batches completed: 45 successful, 5 failed
```

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

**❌ Gas estimation failures**
- Increase gas price in `.env`: `GAS_PRICE_GWEI=2.0`
- Reduce batch sizes to avoid network congestion

### Maintenance Commands
```bash
# Update to latest version
./install.sh update

# Validate script integrity
./install.sh validate

# Check wallet statistics
node script.js check
```

## ⚠️ Important Notes

- **🔐 Security**: Store private keys securely, never commit `.env` to version control
- **🌊 Gas Costs**: Monitor gas prices on Base network for optimal execution
- **⏰ Rate Limits**: Built-in delays prevent RPC rate limiting
- **💾 Backup**: Keep backups of `wallets.json` - contains all your generated wallets
- **🧪 Testing**: Test with small amounts first before large-scale operations

## 📄 License

MIT License - feel free to modify and distribute

## 🤝 Contributing

Contributions welcome! Please ensure all functions maintain the existing error handling and logging patterns.

---

**⚡ Ready to automate? Start with `./install.sh setup` and scale your DeFi operations!**