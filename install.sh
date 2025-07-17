#!/bin/bash

# Wallet Automation Script
# This script handles setup and delegates all operations to external script.js

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WALLET_MANAGER_JS="$SCRIPT_DIR/script.js"
PACKAGE_JSON="$SCRIPT_DIR/package.json"
ENV_FILE="$SCRIPT_DIR/.env"
LOG_FILE="$SCRIPT_DIR/automation.log"

# External files configuration
WALLET_MANAGER_URL="https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/script.js"
PACKAGE_JSON_URL="https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/package.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error_log() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning_log() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Function to download file with curl or wget
download_file() {
    local url=$1
    local output_file=$2
    
    if command -v curl &> /dev/null; then
        log "Downloading $output_file using curl..."
        curl -s -L "$url" -o "$output_file"
    elif command -v wget &> /dev/null; then
        log "Downloading $output_file using wget..."
        wget -q "$url" -O "$output_file"
    else
        error_log "Neither curl nor wget found. Cannot download external files."
        return 1
    fi
    
    if [[ $? -eq 0 && -f "$output_file" ]]; then
        log "✅ Successfully downloaded $output_file"
        return 0
    else
        error_log "❌ Failed to download $output_file"
        return 1
    fi
}

# Function to check and download Node.js script
check_node_script() {
    if [[ ! -f "$WALLET_MANAGER_JS" ]]; then
        warning_log "script.js not found locally. Downloading from external source..."
        if ! download_file "$WALLET_MANAGER_URL" "$WALLET_MANAGER_JS"; then
            error_log "Failed to download script.js. Please download manually."
            exit 1
        fi
    else
        log "script.js found locally"
    fi
}

# Function to check and download package.json
check_package_json() {
    if [[ ! -f "$PACKAGE_JSON" ]]; then
        log "package.json not found. Downloading from external source..."
        if ! download_file "$PACKAGE_JSON_URL" "$PACKAGE_JSON"; then
            log "Failed to download package.json. Creating default version..."
            create_package_json
        fi
    else
        log "package.json found locally"
    fi
}

# Create package.json if download fails
create_package_json() {
    log "Creating default package.json..."
    cat > "$PACKAGE_JSON" << 'EOF'
{
  "name": "wallet-automation",
  "version": "1.0.0",
  "description": "Automated wallet creation and trading",
  "main": "script.js",
  "dependencies": {
    "ethers": "^5.7.2",
    "dotenv": "^16.0.3"
  },
  "scripts": {
    "start": "node script.js"
  }
}
EOF
    log "Created default package.json"
}

# Install dependencies
install_dependencies() {
    log "Installing Node.js dependencies..."
    cd "$SCRIPT_DIR"
    if command -v npm &> /dev/null; then
        npm install
    elif command -v yarn &> /dev/null; then
        yarn install
    else
        error_log "Neither npm nor yarn found. Please install Node.js and npm."
        exit 1
    fi
}

# Create .env file template
create_env_template() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log "Creating .env template..."
        cat > "$ENV_FILE" << 'EOF'
# RPC Configuration
RPC_URL=https://base-mainnet.g.alchemy.com/v2/e5gtkLpZV6LA2spgg2kWZP77H7k7cyYt

# Private Keys (without 0x prefix)
PK_TWO=your-funding-wallet-private-key-here

# Optional: Gas Settings
GAS_PRICE_GWEI=1
GAS_LIMIT=21000

# Batch Configuration
DEFAULT_WALLET_COUNT=1000
DEFAULT_CHUNK_SIZE=500
DEFAULT_BATCH_SIZE=50
EOF
        warning_log "Created .env template. Please fill in your actual values!"
    fi
}

# Function to update external scripts
update_external_scripts() {
    log "🔄 Updating external scripts..."
    
    # Backup existing files
    if [[ -f "$WALLET_MANAGER_JS" ]]; then
        cp "$WALLET_MANAGER_JS" "$WALLET_MANAGER_JS.backup"
    fi
    if [[ -f "$PACKAGE_JSON" ]]; then
        cp "$PACKAGE_JSON" "$PACKAGE_JSON.backup"
    fi
    
    # Download latest versions
    local update_success=true
    
    if download_file "$WALLET_MANAGER_URL" "$WALLET_MANAGER_JS.new"; then
        mv "$WALLET_MANAGER_JS.new" "$WALLET_MANAGER_JS"
        log "✅ Updated script.js"
    else
        error_log "❌ Failed to update script.js"
        update_success=false
    fi
    
    if download_file "$PACKAGE_JSON_URL" "$PACKAGE_JSON.new"; then
        mv "$PACKAGE_JSON.new" "$PACKAGE_JSON"
        log "✅ Updated package.json"
        log "🔄 Reinstalling dependencies..."
        install_dependencies
    else
        error_log "❌ Failed to update package.json"
        update_success=false
    fi
    
    if [[ "$update_success" == "true" ]]; then
        log "✅ All external scripts updated successfully"
        rm -f "$WALLET_MANAGER_JS.backup" "$PACKAGE_JSON.backup"
    else
        warning_log "Some updates failed. Backup files preserved."
    fi
}

# Function to validate external scripts
validate_scripts() {
    log "🔍 Validating external scripts..."
    
    if [[ -f "$WALLET_MANAGER_JS" ]]; then
        if node -c "$WALLET_MANAGER_JS" 2>/dev/null; then
            log "✅ script.js syntax is valid"
        else
            error_log "❌ script.js has syntax errors"
            return 1
        fi
    else
        error_log "❌ script.js not found"
        return 1
    fi
    
    if [[ -f "$PACKAGE_JSON" ]]; then
        if node -e "JSON.parse(require('fs').readFileSync('$PACKAGE_JSON'))" 2>/dev/null; then
            log "✅ package.json is valid JSON"
        else
            error_log "❌ package.json is invalid JSON"
            return 1
        fi
    else
        error_log "❌ package.json not found"
        return 1
    fi
    
    return 0
}

# Function to run wallet manager with arguments
run_wallet_manager() {
    cd "$SCRIPT_DIR"
    node script.js "$@"
}

# Display help
show_help() {
    echo -e "${BLUE}Wallet Automation Script (External JS Mode)${NC}"
    echo ""
    echo "Setup Commands:"
    echo "  $0 setup                 - Initial setup (download files, install dependencies)"
    echo "  $0 update                - Update external scripts to latest version"
    echo "  $0 validate              - Validate external script files"
    echo ""
    echo "All wallet operations are handled by the external script.js:"
    echo ""
    echo "Wallet Management:"
    echo "  node script.js create [count]                     - Create new wallets"
    echo "  node script.js target [total_count]               - Create wallets to reach target"
    echo "  node script.js check                              - Check wallet statistics"
    echo ""
    echo "Batch Operations:"
    echo "  node script.js airdrop-batch [chunk_size]         - Send airdrops in batches"
    echo "  node script.js swap-batch [batch_size]            - Execute single token swaps"
    echo "  node script.js multiswap-batch [batch_size] [tokens] - Execute multi-token swaps"
    echo "  node script.js swapv3-batch [batch_size]          - Execute V3 swaps"
    echo ""
    echo "Full Automation:"
    echo "  node script.js full [wallets] [chunk] [batch]     - Complete automation (single swaps)"
    echo "  node script.js fullmulti [wallets] [chunk] [batch] [tokens] - Complete automation (multi-swaps)"
    echo "  node script.js fullv3 [wallets] [chunk] [batch]   - Complete automation (V3 swaps)"
    echo ""
    echo "Individual Operations:"
    echo "  node script.js airdrop [start] [end]              - Send airdrops to range"
    echo "  node script.js swap [start] [end]                 - Single token swaps for range"
    echo "  node script.js multiswap [start] [end] [tokens]   - Multi-token swaps for range"
    echo "  node script.js swapv3 [start] [end]               - V3 swaps for range"
    echo ""
    echo "Configuration:"
    echo "  All batch sizes and wallet counts can be configured in .env file"
    echo "  Default values: 1000 wallets, 500 airdrop chunk, 50 swap batch"
    echo ""
    echo "Examples:"
    echo "  $0 setup                                                  # Initial setup"
    echo "  node script.js create 2000                       # Create 2000 wallets"
    echo "  node script.js airdrop-batch 200                 # Airdrop in chunks of 200"
    echo "  node script.js multiswap-batch 25 '0xABC,0xDEF'  # Multi-swap with custom tokens"
    echo "  node script.js full 5000 300 40                  # Full automation with custom settings"
    echo ""
    echo "External Files:"
    echo "  script.js: $WALLET_MANAGER_URL"
    echo "  package.json:      $PACKAGE_JSON_URL"
}

# Parse command line arguments
case ${1:-help} in
    setup)
        log "🔧 Setting up environment..."
        check_package_json
        check_node_script
        create_env_template
        install_dependencies
        validate_scripts
        log "✅ Setup completed!"
        log "📝 Please configure your .env file with your RPC URL and private keys"
        log "🚀 You can now use: node script.js [command] [args]"
        ;;
    update)
        log "🔄 Updating external scripts..."
        update_external_scripts
        validate_scripts
        log "✅ Update completed!"
        ;;
    validate)
        log "🔍 Validating scripts..."
        if validate_scripts; then
            log "✅ All scripts are valid"
        else
            error_log "❌ Script validation failed"
            exit 1
        fi
        ;;
    help|*)
        show_help
        ;;
esac

log "Script execution completed"