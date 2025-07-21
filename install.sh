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

# Node.js configuration
NODEJS_MIN_VERSION="16"
NVM_INSTALL_URL="https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh"

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

# Function to get system information
get_system_info() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Function to check Node.js version
check_nodejs_version() {
    if command -v node &> /dev/null; then
        local current_version=$(node --version | sed 's/v//' | cut -d. -f1)
        if [[ $current_version -ge $NODEJS_MIN_VERSION ]]; then
            log "✅ Node.js version $(node --version) is installed and compatible"
            return 0
        else
            warning_log "Node.js version $(node --version) is too old. Minimum required: v${NODEJS_MIN_VERSION}"
            return 1
        fi
    else
        warning_log "Node.js is not installed"
        return 1
    fi
}

# Function to install Node.js via package manager (Linux/macOS)
install_nodejs_package_manager() {
    local system=$(get_system_info)
    
    case $system in
        linux)
            if command -v apt-get &> /dev/null; then
                log "📦 Installing Node.js via apt-get..."
                sudo apt-get update
                sudo apt-get install -y nodejs npm
            elif command -v yum &> /dev/null; then
                log "📦 Installing Node.js via yum..."
                sudo yum install -y nodejs npm
            elif command -v dnf &> /dev/null; then
                log "📦 Installing Node.js via dnf..."
                sudo dnf install -y nodejs npm
            elif command -v pacman &> /dev/null; then
                log "📦 Installing Node.js via pacman..."
                sudo pacman -S nodejs npm
            elif command -v zypper &> /dev/null; then
                log "📦 Installing Node.js via zypper..."
                sudo zypper install -y nodejs npm
            else
                error_log "No supported package manager found for Linux"
                return 1
            fi
            ;;
        macos)
            if command -v brew &> /dev/null; then
                log "📦 Installing Node.js via Homebrew..."
                brew install node
            else
                error_log "Homebrew not found. Please install Homebrew first or install Node.js manually"
                return 1
            fi
            ;;
        *)
            error_log "Unsupported system for automatic Node.js installation"
            return 1
            ;;
    esac
}

# Function to install Node.js via NVM
install_nodejs_nvm() {
    log "📦 Installing Node.js via NVM..."
    
    # Download and install NVM
    if command -v curl &> /dev/null; then
        curl -o- "$NVM_INSTALL_URL" | bash
    elif command -v wget &> /dev/null; then
        wget -qO- "$NVM_INSTALL_URL" | bash
    else
        error_log "Neither curl nor wget found. Cannot install NVM."
        return 1
    fi
    
    # Source NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    # Install latest LTS Node.js
    if command -v nvm &> /dev/null; then
        log "Installing latest LTS Node.js via NVM..."
        nvm install --lts
        nvm use --lts
        nvm alias default lts/*
        log "✅ Node.js installed via NVM"
        return 0
    else
        error_log "NVM installation failed"
        return 1
    fi
}

# Function to install Node.js with user choice
install_nodejs() {
    local system=$(get_system_info)
    
    log "🔧 Node.js installation required..."
    echo ""
    echo "Choose installation method:"
    echo "1) Package Manager (recommended for most users)"
    echo "2) NVM (Node Version Manager - recommended for developers)"
    echo "3) Manual installation (visit nodejs.org)"
    echo "4) Skip installation"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            if install_nodejs_package_manager; then
                log "✅ Node.js installed via package manager"
            else
                error_log "Package manager installation failed"
                return 1
            fi
            ;;
        2)
            if install_nodejs_nvm; then
                log "✅ Node.js installed via NVM"
            else
                error_log "NVM installation failed"
                return 1
            fi
            ;;
        3)
            echo ""
            log "📝 Manual installation instructions:"
            echo "1. Visit https://nodejs.org"
            echo "2. Download the LTS version for your system"
            echo "3. Install the downloaded package"
            echo "4. Restart your terminal and run this script again"
            echo ""
            exit 0
            ;;
        4)
            warning_log "Skipping Node.js installation. Script may not work properly."
            return 1
            ;;
        *)
            error_log "Invalid choice. Please run the script again."
            return 1
            ;;
    esac
    
    # Verify installation
    if check_nodejs_version; then
        log "✅ Node.js installation verified"
        return 0
    else
        error_log "Node.js installation verification failed"
        return 1
    fi
}

# Function to ensure Node.js is available
ensure_nodejs() {
    if ! check_nodejs_version; then
        log "🔧 Node.js setup required..."
        
        # Auto-install attempt
        echo ""
        echo "Node.js is required for this script to work."
        echo "Would you like to install it automatically? (y/n)"
        read -p "Install Node.js? [y/N]: " install_choice
        
        if [[ $install_choice =~ ^[Yy]$ ]]; then
            if ! install_nodejs; then
                error_log "Node.js installation failed. Please install manually."
                exit 1
            fi
        else
            error_log "Node.js is required. Please install it manually and run the script again."
            echo ""
            echo "Installation options:"
            echo "1. Visit https://nodejs.org and download the LTS version"
            echo "2. Use your system's package manager:"
            echo "   - Ubuntu/Debian: sudo apt-get install nodejs npm"
            echo "   - CentOS/RHEL: sudo yum install nodejs npm"
            echo "   - macOS: brew install node"
            echo "3. Use NVM: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
            echo ""
            exit 1
        fi
    fi
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
        error_log "Neither npm nor yarn found. This shouldn't happen after Node.js installation."
        exit 1
    fi
}

# Function to validate private key format
validate_private_key() {
    local key=$1
    # Remove 0x prefix if present
    key=${key#0x}
    
    # Check if it's 64 hex characters
    if [[ ${#key} -eq 64 ]] && [[ $key =~ ^[0-9a-fA-F]+$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to generate a new private key using Node.js
generate_private_key() {
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
const crypto = require('crypto');
const privateKey = crypto.randomBytes(32).toString('hex');
console.log(privateKey);
EOF
    
    local generated_key=$(node "$temp_script")
    rm "$temp_script"
    echo "$generated_key"
}

# Function to get private key configuration
configure_private_key() {
    echo ""
    echo -e "${BLUE}📋 Private Key Configuration${NC}"
    echo "Choose how you want to configure your funding wallet:"
    echo "1) Import existing private key"
    echo "2) Generate new private key"
    echo ""
    
    while true; do
        read -p "Enter your choice (1-2): " pk_choice
        
        case $pk_choice in
            1)
                echo ""
                log "🔑 Importing existing private key..."
                echo -e "${YELLOW}⚠️  WARNING: Make sure you're in a secure environment!${NC}"
                echo "Your private key will be stored in the .env file."
                echo ""
                
                while true; do
                    read -s -p "Enter your private key (without 0x prefix): " user_private_key
                    echo ""
                    
                    if [[ -z "$user_private_key" ]]; then
                        error_log "Private key cannot be empty. Please try again."
                        continue
                    fi
                    
                    if validate_private_key "$user_private_key"; then
                        # Remove 0x prefix if present
                        user_private_key=${user_private_key#0x}
                        log "✅ Private key format is valid"
                        echo "$user_private_key"
                        return 0
                    else
                        error_log "Invalid private key format. Must be 64 hexadecimal characters."
                        echo "Please try again or choose option 2 to generate a new key."
                        echo ""
                    fi
                done
                ;;
            2)
                log "🎲 Generating new private key..."
                local generated_key=$(generate_private_key)
                
                if [[ -n "$generated_key" ]] && validate_private_key "$generated_key"; then
                    echo ""
                    echo -e "${GREEN}✅ Generated new private key:${NC}"
                    echo -e "${YELLOW}$generated_key${NC}"
                    echo ""
                    echo -e "${RED}⚠️  IMPORTANT: Save this private key securely!${NC}"
                    echo "This is the only time it will be displayed in plain text."
                    echo "Make sure to:"
                    echo "- Copy it to a secure location"
                    echo "- Fund this wallet with ETH for gas fees"
                    echo "- Never share this key with anyone"
                    echo ""
                    
                    read -p "Press Enter after you've saved the private key securely..."
                    echo "$generated_key"
                    return 0
                else
                    error_log "Failed to generate private key. Please try again."
                fi
                ;;
            *)
                error_log "Invalid choice. Please enter 1 or 2."
                ;;
        esac
    done
}

# Function to get RPC URL configuration
configure_rpc_url() {
    echo ""
    echo -e "${BLUE}🌐 RPC URL Configuration${NC}"
    echo "Choose your RPC provider:"
    echo "1) Alchemy (recommended)"
    echo "2) Infura" 
    echo "3) QuickNode"
    echo "4) Other/Custom"
    echo ""
    
    # Force output flush
    exec 1>&1
    
    while true; do
        read -p "Enter your choice (1-4): " rpc_choice
        
        case $rpc_choice in
            1)
                echo ""
                log "🔗 Configuring Alchemy RPC..."
                echo "Please provide your Alchemy API key."
                echo "You can get one free at: https://www.alchemy.com"
                echo ""
                
                while true; do
                    read -p "Enter your Alchemy API key: " alchemy_key
                    if [[ -n "$alchemy_key" ]]; then
                        local rpc_url="https://base-mainnet.g.alchemy.com/v2/$alchemy_key"
                        log "✅ Alchemy RPC configured"
                        echo "$rpc_url"
                        return 0
                    else
                        error_log "API key cannot be empty. Please try again."
                    fi
                done
                ;;
            2)
                echo ""
                log "🔗 Configuring Infura RPC..."
                echo "Please provide your Infura project ID."
                echo "You can get one free at: https://infura.io"
                echo ""
                
                while true; do
                    read -p "Enter your Infura project ID: " infura_id
                    if [[ -n "$infura_id" ]]; then
                        local rpc_url="https://base-mainnet.infura.io/v3/$infura_id"
                        log "✅ Infura RPC configured"
                        echo "$rpc_url"
                        return 0
                    else
                        error_log "Project ID cannot be empty. Please try again."
                    fi
                done
                ;;
            3)
                echo ""
                log "🔗 Configuring QuickNode RPC..."
                echo "Please provide your QuickNode endpoint URL."
                echo "You can get one at: https://quicknode.com"
                echo ""
                
                while true; do
                    read -p "Enter your QuickNode URL: " quicknode_url
                    if [[ -n "$quicknode_url" ]]; then
                        log "✅ QuickNode RPC configured"
                        echo "$quicknode_url"
                        return 0
                    else
                        error_log "URL cannot be empty. Please try again."
                    fi
                done
                ;;
            4)
                echo ""
                log "🔗 Configuring custom RPC..."
                echo "Please provide your custom RPC URL."
                echo ""
                
                while true; do
                    read -p "Enter your RPC URL: " custom_url
                    if [[ -n "$custom_url" ]]; then
                        # Basic URL validation
                        if [[ $custom_url =~ ^https?:// ]]; then
                            log "✅ Custom RPC configured"
                            echo "$custom_url"
                            return 0
                        else
                            error_log "Invalid URL format. Must start with http:// or https://"
                        fi
                    else
                        error_log "URL cannot be empty. Please try again."
                    fi
                done
                ;;
            *)
                error_log "Invalid choice. Please enter 1-4."
                ;;
        esac
    done
}

# Enhanced function to create .env file with user input
create_env_template() {
    if [[ -f "$ENV_FILE" ]]; then
        echo ""
        echo -e "${YELLOW}⚠️  .env file already exists.${NC}"
        read -p "Do you want to overwrite it? [y/N]: " overwrite_choice
        
        if [[ ! $overwrite_choice =~ ^[Yy]$ ]]; then
            log "Keeping existing .env file"
            return 0
        fi
        
        # Backup existing .env file
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        log "Backed up existing .env file"
    fi
    
    log "🔧 Configuring environment variables..."
    
    # Get RPC URL with explicit output
    echo ""
    echo -e "${BLUE}🌐 RPC URL Configuration${NC}"
    echo "Choose your RPC provider:"
    echo "1) Alchemy (recommended)"
    echo "2) Infura"
    echo "3) QuickNode" 
    echo "4) Other/Custom"
    echo ""
    
    local rpc_choice
    while true; do
        read -p "Enter your choice (1-4): " rpc_choice
        
        case $rpc_choice in
            1)
                echo ""
                log "🔗 Configuring Alchemy RPC..."
                echo "Please provide your Alchemy API key."
                echo "You can get one free at: https://www.alchemy.com"
                echo ""
                
                while true; do
                    read -p "Enter your Alchemy API key: " alchemy_key
                    if [[ -n "$alchemy_key" ]]; then
                        local rpc_url="https://base-mainnet.g.alchemy.com/v2/$alchemy_key"
                        log "✅ Alchemy RPC configured"
                        break 2
                    else
                        error_log "API key cannot be empty. Please try again."
                    fi
                done
                ;;
            2)
                echo ""
                log "🔗 Configuring Infura RPC..."
                echo "Please provide your Infura project ID."
                echo "You can get one free at: https://infura.io"
                echo ""
                
                while true; do
                    read -p "Enter your Infura project ID: " infura_id
                    if [[ -n "$infura_id" ]]; then
                        local rpc_url="https://base-mainnet.infura.io/v3/$infura_id"
                        log "✅ Infura RPC configured"
                        break 2
                    else
                        error_log "Project ID cannot be empty. Please try again."
                    fi
                done
                ;;
            3)
                echo ""
                log "🔗 Configuring QuickNode RPC..."
                echo "Please provide your QuickNode endpoint URL."
                echo "You can get one at: https://quicknode.com"
                echo ""
                
                while true; do
                    read -p "Enter your QuickNode URL: " quicknode_url
                    if [[ -n "$quicknode_url" ]]; then
                        local rpc_url="$quicknode_url"
                        log "✅ QuickNode RPC configured"
                        break 2
                    else
                        error_log "URL cannot be empty. Please try again."
                    fi
                done
                ;;
            4)
                echo ""
                log "🔗 Configuring custom RPC..."
                echo "Please provide your custom RPC URL."
                echo ""
                
                while true; do
                    read -p "Enter your RPC URL: " custom_url
                    if [[ -n "$custom_url" ]]; then
                        # Basic URL validation
                        if [[ $custom_url =~ ^https?:// ]]; then
                            local rpc_url="$custom_url"
                            log "✅ Custom RPC configured"
                            break 2
                        else
                            error_log "Invalid URL format. Must start with http:// or https://"
                        fi
                    else
                        error_log "URL cannot be empty. Please try again."
                    fi
                done
                ;;
            *)
                error_log "Invalid choice. Please enter 1-4."
                ;;
        esac
    done
    
    # Get private key
    local private_key=$(configure_private_key)
    
    # Create the .env file
    log "📝 Creating .env file..."
    cat > "$ENV_FILE" << EOF
# RPC Configuration
RPC_URL=$rpc_url

# Private Keys (without 0x prefix)
PK_MAIN=$private_key

# Optional: Gas Settings
GAS_PRICE_GWEI=1
GAS_LIMIT=21000

# Batch Configuration
DEFAULT_WALLET_COUNT=1000
DEFAULT_CHUNK_SIZE=500
DEFAULT_BATCH_SIZE=50
EOF
    
    # Set secure permissions on .env file
    chmod 600 "$ENV_FILE"
    
    echo ""
    log "✅ .env file created successfully!"
    echo -e "${GREEN}Configuration Summary:${NC}"
    echo "- RPC URL: Configured ✅"
    echo "- Private Key: Configured ✅"
    echo "- File permissions: Set to 600 (owner read/write only) ✅"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Make sure your funding wallet has sufficient ETH for gas fees"
    echo "2. Test the configuration by running: node script.js check"
    echo "3. Start creating wallets with: node script.js create [count]"
    echo ""
    
    # Security warning
    echo -e "${RED}🔒 Security Reminder:${NC}"
    echo "- Keep your .env file secure and never share it"
    echo "- The .env file contains sensitive information"
    echo "- Consider using a dedicated funding wallet for this script"
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
    echo "  $0 setup                 - Initial setup (install Node.js, download files, install dependencies)"
    echo "  $0 update                - Update external scripts to latest version"
    echo "  $0 validate              - Validate external script files"
    echo "  $0 check-node            - Check Node.js installation"
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
    echo ""
    echo "System Requirements:"
    echo "  - Node.js v${NODEJS_MIN_VERSION}+ (will be installed automatically if missing)"
    echo "  - npm or yarn (included with Node.js)"
    echo "  - curl or wget (for downloading external files)"
}

# Parse command line arguments
case ${1:-help} in
    setup)
        log "🔧 Setting up environment..."
        ensure_nodejs
        check_package_json
        check_node_script
        create_env_template
        install_dependencies
        validate_scripts
        log "✅ Setup completed!"
        log "🚀 You can now use: node script.js [command] [args]"
        ;;
    update)
        log "🔄 Updating external scripts..."
        ensure_nodejs
        update_external_scripts
        validate_scripts
        log "✅ Update completed!"
        ;;
    validate)
        log "🔍 Validating scripts..."
        ensure_nodejs
        if validate_scripts; then
            log "✅ All scripts are valid"
        else
            error_log "❌ Script validation failed"
            exit 1
        fi
        ;;
    check-node)
        log "🔍 Checking Node.js installation..."
        if check_nodejs_version; then
            log "✅ Node.js is properly installed"
        else
            warning_log "Node.js is not installed or version is too old"
            log "Run '$0 setup' to install Node.js automatically"
        fi
        ;;
    help|*)
        show_help
        ;;
esac

log "Script execution completed"