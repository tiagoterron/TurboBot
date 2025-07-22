#!/bin/bash

# Wallet Automation Script
# This script handles setup and delegates all operations to external script.js

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WALLET_MANAGER_JS="$SCRIPT_DIR/script.js"
PACKAGE_JSON="$SCRIPT_DIR/package.json"
SERVER_JS="$SCRIPT_DIR/server.js"
PUBLIC_DIR="$SCRIPT_DIR/public"
INDEX_HTML="$PUBLIC_DIR/index.html"
ENV_FILE="$SCRIPT_DIR/.env"
LOG_FILE="$SCRIPT_DIR/automation.log"

# External files configuration
WALLET_MANAGER_URL="https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/script.js"
PACKAGE_JSON_URL="https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/package.json"
SERVER_JS_URL="https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/server.js"
INDEX_HTML_URL="https://raw.githubusercontent.com/tiagoterron/TurboBot/refs/heads/main/public/index.html"

# Node.js configuration
NODEJS_MIN_VERSION="16"
NVM_INSTALL_URL="https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

info_log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
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

# Function to check and download server.js for Web GUI
check_server_js() {
    if [[ ! -f "$SERVER_JS" ]]; then
        log "server.js not found. Downloading from external source..."
        if ! download_file "$SERVER_JS_URL" "$SERVER_JS"; then
            log "Failed to download server.js. Creating fallback version..."
            create_server_js
        fi
    else
        log "server.js found locally"
    fi
}

# Function to check and download index.html for Web GUI
check_index_html() {
    if [[ ! -d "$PUBLIC_DIR" ]]; then
        mkdir -p "$PUBLIC_DIR"
        log "Created public directory"
    fi
    
    if [[ ! -f "$INDEX_HTML" ]]; then
        log "index.html not found. Downloading from external source..."
        if ! download_file "$INDEX_HTML_URL" "$INDEX_HTML"; then
            log "Failed to download index.html. Creating fallback version..."
            create_index_html
        fi
    else
        log "index.html found locally"
    fi
}

# Create package.json if download fails
create_package_json() {
    log "Creating updated package.json with Web GUI support..."
    cat > "$PACKAGE_JSON" << 'EOF'
{
  "name": "wallet-automation",
  "version": "1.0.0",
  "description": "Automated wallet creation and trading with Web GUI",
  "main": "script.js",
  "dependencies": {
    "dotenv": "^16.0.3",
    "ethers": "^5.7.2",
    "express": "^4.18.2",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  },
  "scripts": {
    "start": "node server.js",
    "bot": "node script.js",
    "gui": "npm start",
    "dev": "nodemon server.js",
    "create": "node script.js create",
    "airdrop": "node script.js airdrop",
    "swap": "node script.js swap",
    "check": "node script.js check"
  }
}
EOF
    log "✅ Created updated package.json with Web GUI dependencies"
}

# Create fallback server.js if download fails
create_server_js() {
    error_log "Failed to download server.js from GitHub. Cannot create Web GUI without proper server file."
    warning_log "Web GUI functionality will not be available."
    warning_log "Please check your internet connection and try again, or download server.js manually from:"
    echo "   ${SERVER_JS_URL}"
    return 1
}

# Create fallback index.html if download fails
create_index_html() {
    error_log "Failed to download index.html from GitHub. Cannot create Web GUI without proper interface file."
    warning_log "Web GUI functionality will not be available."
    warning_log "Please check your internet connection and try again, or download index.html manually from:"
    echo "   ${INDEX_HTML_URL}"
    return 1
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

# Function to get wallet address from private key (after dependencies are installed)
derive_address_after_setup() {
    local private_key=$1
    
    # Check if ethers is available (after npm install)
    if [[ -d "$SCRIPT_DIR/node_modules/ethers" ]]; then
        local temp_script=$(mktemp)
        cat > "$temp_script" << EOF
try {
    const { ethers } = require('ethers');
    const wallet = new ethers.Wallet('$private_key');
    console.log(wallet.address);
} catch (error) {
    console.log('Unable to derive address');
}
EOF
        
        local address=$(cd "$SCRIPT_DIR" && node "$temp_script" 2>/dev/null)
        rm "$temp_script"
        echo "$address"
    else
        echo "DERIVE_LATER"
    fi
}

# Function to get wallet address from private key
get_wallet_address() {
    local private_key=$1
    local temp_script=$(mktemp)
    cat > "$temp_script" << EOF
const crypto = require('crypto');

try {
    // Try using secp256k1 if available
    const secp256k1 = require('secp256k1');
    const privateKeyBuffer = Buffer.from('$private_key', 'hex');
    const publicKey = secp256k1.publicKeyCreate(privateKeyBuffer, false);
    const publicKeyHash = crypto.createHash('keccak256').update(publicKey.slice(1)).digest();
    const address = '0x' + publicKeyHash.slice(-20).toString('hex');
    console.log(address);
} catch (error) {
    // Fallback method using ethers if secp256k1 is not available
    try {
        const { ethers } = require('ethers');
        const wallet = new ethers.Wallet('$private_key');
        console.log(wallet.address);
    } catch (ethersError) {
        console.log('DERIVE_LATER');
    }
}
EOF
    
    local address=$(node "$temp_script" 2>/dev/null)
    rm "$temp_script"
    echo "$address"
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
    local rpc_url=""
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
                        rpc_url="https://base-mainnet.g.alchemy.com/v2/$alchemy_key"
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
                        rpc_url="https://base-mainnet.infura.io/v3/$infura_id"
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
                        rpc_url="$quicknode_url"
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
                            rpc_url="$custom_url"
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
    echo ""
    echo -e "${BLUE}📋 Private Key Configuration${NC}"
    echo "Choose how you want to configure your funding wallet:"
    echo "1) Import existing private key"
    echo "2) Generate new private key"
    echo ""
    
    local private_key=""
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
                        private_key=${user_private_key#0x}
                        log "✅ Private key format is valid"
                        
                        # Show wallet address
                        local wallet_address=$(get_wallet_address "$private_key")
                        if [[ -n "$wallet_address" && "$wallet_address" != "Unable to derive address" && "$wallet_address" != "DERIVE_LATER" ]]; then
                            echo ""
                            echo -e "${GREEN}📍 Wallet Address (for funding):${NC}"
                            echo -e "${BLUE}$wallet_address${NC}"
                            echo ""
                            echo -e "${YELLOW}💰 Important: Send ETH to this address for gas fees!${NC}"
                            echo ""
                        else
                            echo ""
                            echo -e "${YELLOW}📍 Wallet address will be shown after setup completion${NC}"
                            echo ""
                        fi
                        
                        break 2
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
                    
                    # Show wallet address
                    local wallet_address=$(get_wallet_address "$generated_key")
                    if [[ -n "$wallet_address" && "$wallet_address" != "Unable to derive address" && "$wallet_address" != "DERIVE_LATER" ]]; then
                        echo -e "${GREEN}📍 Wallet Address (for funding):${NC}"
                        echo -e "${BLUE}$wallet_address${NC}"
                        echo ""
                    else
                        echo -e "${YELLOW}📍 Wallet address will be shown after setup completion${NC}"
                        echo ""
                    fi
                    
                    echo -e "${RED}⚠️  IMPORTANT: Save this information securely!${NC}"
                    echo "This is the only time the private key will be displayed in plain text."
                    echo "Make sure to:"
                    echo "- Copy the private key to a secure location"
                    echo "- Send ETH to the wallet address above for gas fees"
                    echo "- Never share the private key with anyone"
                    echo ""
                    
                    read -p "Press Enter after you've saved the private key and wallet address securely..."
                    private_key="$generated_key"
                    break
                else
                    error_log "Failed to generate private key. Please try again."
                fi
                ;;
            *)
                error_log "Invalid choice. Please enter 1 or 2."
                ;;
        esac
    done
    
    # Get initial wallet count
    echo ""
    echo -e "${BLUE}👛 Initial Wallet Creation${NC}"
    echo "How many wallets would you like to create initially?"
    echo "Note: You can always create more wallets later using: node script.js create [count]"
    echo ""
    
    local wallet_count=""
    while true; do
        read -p "Enter number of wallets to create (0 to skip, default: 100): " wallet_input
        
        # Use default if empty
        if [[ -z "$wallet_input" ]]; then
            wallet_count=100
            break
        fi
        
        # Validate numeric input
        if [[ "$wallet_input" =~ ^[0-9]+$ ]]; then
            wallet_count="$wallet_input"
            if [[ $wallet_count -eq 0 ]]; then
                log "Skipping initial wallet creation"
                break
            elif [[ $wallet_count -gt 10000 ]]; then
                warning_log "Creating more than 10,000 wallets may take a very long time."
                read -p "Are you sure you want to continue? [y/N]: " confirm
                if [[ $confirm =~ ^[Yy]$ ]]; then
                    break
                else
                    continue
                fi
            else
                break
            fi
        else
            error_log "Please enter a valid number (0 or positive integer)"
        fi
    done
    
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
GAS_FEE_ETH=0.000003

# Batch Configuration
DEFAULT_WALLET_COUNT=1000
DEFAULT_CHUNK_SIZE=500
DEFAULT_BATCH_SIZE=50

# Web GUI Configuration
WEB_PORT=3000
WEB_HOST=localhost
EOF
    
    # Set secure permissions on .env file
    chmod 600 "$ENV_FILE"
    
    echo ""
    log "✅ .env file created successfully!"
    echo -e "${GREEN}Configuration Summary:${NC}"
    echo "- RPC URL: Configured ✅"
    echo "- Private Key: Configured ✅"
    echo "- File permissions: Set to 600 (owner read/write only) ✅"
    
    # Show wallet address in summary
    local wallet_address=$(derive_address_after_setup "$private_key")
    if [[ -n "$wallet_address" && "$wallet_address" != "Unable to derive address" ]]; then
        echo "- Funding Wallet Address: $wallet_address ✅"
        echo ""
        echo -e "${BLUE}💰 FUNDING INSTRUCTIONS:${NC}"
        echo -e "${YELLOW}Send ETH to: $wallet_address${NC}"
        echo "This wallet will be used to fund all created wallets for gas fees."
    else
        echo "- Wallet Address: Will be derived when running wallet operations ⏳"
    fi
    
    if [[ $wallet_count -gt 0 ]]; then
        echo "- Initial wallets to create: $wallet_count ✅"
    fi
    echo ""
    
    # Create initial wallets if requested
    if [[ $wallet_count -gt 0 ]]; then
        echo -e "${BLUE}🚀 Creating Initial Wallets${NC}"
        log "Creating $wallet_count wallets..."
        
        # Debug information
        log "Current directory: $(pwd)"
        log "Script directory: $SCRIPT_DIR"
        log "Checking if script.js exists: $(ls -la "$WALLET_MANAGER_JS" 2>/dev/null || echo 'NOT FOUND')"
        log "Checking if .env exists: $(ls -la "$ENV_FILE" 2>/dev/null || echo 'NOT FOUND')"
        
        echo ""
        
        # Change to script directory and run wallet creation
        cd "$SCRIPT_DIR"
        log "Changed to directory: $(pwd)"
        log "Running: node script.js create $wallet_count"
        
        if node script.js create "$wallet_count"; then
            echo ""
            log "✅ Successfully created $wallet_count wallets!"
            echo ""
            echo -e "${GREEN}Next steps:${NC}"
            echo "1. Check wallet statistics: node script.js check"
            echo "2. Fund wallets with airdrops: node script.js airdrop-batch [chunk_size]"
            echo "3. Execute swaps: node script.js swap-batch [batch_size]"
            echo "4. Or use full automation: node script.js full [wallets] [chunk] [batch]"
            echo "5. Start Web GUI: npm run gui"
        else
            echo ""
            error_log "Failed to create wallets. Exit code: $?"
            echo "You can try again later with:"
            echo "  cd $SCRIPT_DIR"
            echo "  node script.js create $wallet_count"
            echo ""
            echo -e "${YELLOW}Troubleshooting:${NC}"
            echo "1. Make sure your funding wallet has ETH for gas fees"
            echo "2. Check your RPC URL is working: node script.js check"
            echo "3. Verify your private key is correct"
            echo "4. Check if script.js was downloaded correctly"
            echo "5. Check if dependencies are installed: npm list"
        fi
    else
        echo -e "${YELLOW}Next steps:${NC}"
        echo "1. Make sure your funding wallet has sufficient ETH for gas fees"
        echo "2. Test the configuration by running: node script.js check"
        echo "3. Start creating wallets with: node script.js create [count]"
        echo "4. Launch Web GUI with: npm run gui"
    fi
    
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
    if [[ -f "$SERVER_JS" ]]; then
        cp "$SERVER_JS" "$SERVER_JS.backup"
    fi
    if [[ -f "$INDEX_HTML" ]]; then
        cp "$INDEX_HTML" "$INDEX_HTML.backup"
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
    
    # Update Web GUI files
    if download_file "$SERVER_JS_URL" "$SERVER_JS.new"; then
        mv "$SERVER_JS.new" "$SERVER_JS"
        log "✅ Updated server.js"
    else
        warning_log "⚠️ Failed to update server.js"
    fi
    
    if download_file "$INDEX_HTML_URL" "$INDEX_HTML.new"; then
        mv "$INDEX_HTML.new" "$INDEX_HTML"
        log "✅ Updated index.html"
    else
        warning_log "⚠️ Failed to update index.html"
    fi
    
    if [[ "$update_success" == "true" ]]; then
        log "✅ Core scripts updated successfully"
        rm -f "$WALLET_MANAGER_JS.backup" "$PACKAGE_JSON.backup"
    else
        warning_log "Some core updates failed. Backup files preserved."
    fi
    
    # Clean up Web GUI backups if updates succeeded
    if [[ -f "$SERVER_JS" && -f "$SERVER_JS.backup" ]]; then
        rm -f "$SERVER_JS.backup"
    fi
    if [[ -f "$INDEX_HTML" && -f "$INDEX_HTML.backup" ]]; then
        rm -f "$INDEX_HTML.backup"
    fi
}

# Function to validate external scripts
validate_scripts() {
    log "🔍 Validating external scripts..."
    local validation_success=true
    
    if [[ -f "$WALLET_MANAGER_JS" ]]; then
        if node -c "$WALLET_MANAGER_JS" 2>/dev/null; then
            log "✅ script.js syntax is valid"
        else
            error_log "❌ script.js has syntax errors"
            validation_success=false
        fi
    else
        error_log "❌ script.js not found"
        validation_success=false
    fi
    
    if [[ -f "$PACKAGE_JSON" ]]; then
        if node -e "JSON.parse(require('fs').readFileSync('$PACKAGE_JSON'))" 2>/dev/null; then
            log "✅ package.json is valid JSON"
        else
            error_log "❌ package.json is invalid JSON"
            validation_success=false
        fi
    else
        error_log "❌ package.json not found"
        validation_success=false
    fi
    
    # Validate Web GUI files (optional)
    if [[ -f "$SERVER_JS" ]]; then
        if node -c "$SERVER_JS" 2>/dev/null; then
            log "✅ server.js syntax is valid"
        else
            warning_log "⚠️ server.js has syntax errors (Web GUI may not work)"
        fi
    else
        warning_log "⚠️ server.js not found (Web GUI not available)"
    fi
    
    if [[ -f "$INDEX_HTML" ]]; then
        log "✅ index.html found"
    else
        warning_log "⚠️ index.html not found (Web GUI not available)"
    fi
    
    if [[ "$validation_success" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# Function to run wallet manager with arguments
run_wallet_manager() {
    cd "$SCRIPT_DIR"
    node script.js "$@"
}

# Function to start Web GUI server
start_web_gui() {
    cd "$SCRIPT_DIR"
    
    if [[ ! -f "$SERVER_JS" ]]; then
        error_log "server.js not found. Cannot start Web GUI."
        echo "Run '$0 setup' or '$0 update' to download Web GUI files."
        return 1
    fi
    
    if [[ ! -f "$INDEX_HTML" ]]; then
        error_log "index.html not found. Cannot start Web GUI."
        echo "Run '$0 setup' or '$0 update' to download Web GUI files."
        return 1
    fi
    
    log "🌐 Starting Web GUI server..."
    echo -e "${BLUE}Web GUI will be available at: http://localhost:3000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""
    
    npm run gui
}

# Function to check system status
check_system_status() {
    echo -e "${BLUE}📊 System Status Check${NC}"
    echo ""
    
    # Check Node.js
    if check_nodejs_version; then
        echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
    else
        echo -e "${RED}❌ Node.js: Not installed or too old${NC}"
    fi
    
    # Check dependencies
    if [[ -d "$SCRIPT_DIR/node_modules" ]]; then
        echo -e "${GREEN}✅ Dependencies: Installed${NC}"
    else
        echo -e "${RED}❌ Dependencies: Not installed${NC}"
    fi
    
    # Check core files
    if [[ -f "$WALLET_MANAGER_JS" ]]; then
        echo -e "${GREEN}✅ script.js: Found${NC}"
    else
        echo -e "${RED}❌ script.js: Missing${NC}"
    fi
    
    if [[ -f "$PACKAGE_JSON" ]]; then
        echo -e "${GREEN}✅ package.json: Found${NC}"
    else
        echo -e "${RED}❌ package.json: Missing${NC}"
    fi
    
    if [[ -f "$ENV_FILE" ]]; then
        echo -e "${GREEN}✅ .env file: Found${NC}"
    else
        echo -e "${RED}❌ .env file: Missing${NC}"
    fi
    
    # Check Web GUI files
    echo ""
    echo -e "${BLUE}🌐 Web GUI Status:${NC}"
    if [[ -f "$SERVER_JS" ]]; then
        echo -e "${GREEN}✅ server.js: Found${NC}"
    else
        echo -e "${YELLOW}⚠️ server.js: Missing${NC}"
    fi
    
    if [[ -f "$INDEX_HTML" ]]; then
        echo -e "${GREEN}✅ index.html: Found${NC}"
    else
        echo -e "${YELLOW}⚠️ index.html: Missing${NC}"
    fi
    
    # Check wallet statistics if script is available
    echo ""
    if [[ -f "$WALLET_MANAGER_JS" && -f "$ENV_FILE" ]]; then
        echo -e "${BLUE}📊 Wallet Statistics:${NC}"
        cd "$SCRIPT_DIR"
        if node script.js check 2>/dev/null; then
            echo ""
        else
            echo -e "${YELLOW}⚠️ Unable to retrieve wallet statistics${NC}"
            echo "This may be normal if no wallets have been created yet."
        fi
    fi
}

# Function to show quick start guide
show_quick_start() {
    echo -e "${CYAN}🚀 Quick Start Guide${NC}"
    echo ""
    echo -e "${BLUE}1. First Time Setup:${NC}"
    echo "   $0 setup"
    echo ""
    echo -e "${BLUE}2. Create Wallets:${NC}"
    echo "   node script.js create 1000"
    echo ""
    echo -e "${BLUE}3. Check Status:${NC}"
    echo "   node script.js check"
    echo ""
    echo -e "${BLUE}4. Fund Wallets (Airdrop):${NC}"
    echo "   node script.js airdrop-batch 500"
    echo ""
    echo -e "${BLUE}5. Execute Swaps:${NC}"
    echo "   node script.js swap-batch 50"
    echo ""
    echo -e "${BLUE}6. Full Automation:${NC}"
    echo "   node script.js full 5000 500 50"
    echo ""
    echo -e "${BLUE}7. Web GUI:${NC}"
    echo "   npm run gui"
    echo "   # Then visit http://localhost:3000"
    echo ""
    echo -e "${PURPLE}💡 Pro Tips:${NC}"
    echo "• Always ensure your funding wallet has sufficient ETH"
    echo "• Start with small batch sizes to test"
    echo "• Monitor gas prices and network congestion"
    echo "• Use 'node script.js check' to monitor progress"
}

# Function to clean up temporary files and logs
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
    
    # Remove backup files older than 7 days
    find "$SCRIPT_DIR" -name "*.backup*" -type f -mtime +7 -delete 2>/dev/null
    
    # Truncate log file if it's too large (>10MB)
    if [[ -f "$LOG_FILE" ]]; then
        local log_size=$(du -m "$LOG_FILE" | cut -f1)
        if [[ $log_size -gt 10 ]]; then
            echo "Log file is large (${log_size}MB). Truncating..."
            tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp"
            mv "$LOG_FILE.tmp" "$LOG_FILE"
            log "Log file truncated to last 1000 lines"
        fi
    fi
    
    # Remove temporary Node.js files
    rm -f /tmp/tmp.* 2>/dev/null
    
    log "✅ Cleanup completed"
}

# Display help
show_help() {
    echo -e "${BLUE}🔧 Wallet Automation Script (External JS Mode)${NC}"
    echo ""
    echo -e "${PURPLE}Setup Commands:${NC}"
    echo "  $0 setup                 - Initial setup (install Node.js, download files, install dependencies)"
    echo "  $0 update                - Update external scripts to latest version"
    echo "  $0 validate              - Validate external script files"
    echo "  $0 check-node            - Check Node.js installation"
    echo "  $0 status                - Show complete system status"
    echo "  $0 gui                   - Start Web GUI server"
    echo "  $0 quick-start           - Show quick start guide"
    echo "  $0 cleanup               - Clean up temporary files and logs"
    echo ""
    echo -e "${PURPLE}Wallet Operations:${NC}"
    echo "  All wallet operations are handled by the external script.js:"
    echo ""
    echo -e "${CYAN}Wallet Management:${NC}"
    echo "  node script.js create [count]                     - Create new wallets"
    echo "  node script.js target [total_count]               - Create wallets to reach target"
    echo "  node script.js check                              - Check wallet statistics"
    echo ""
    echo -e "${CYAN}Batch Operations:${NC}"
    echo "  node script.js airdrop-batch [chunk_size]         - Send airdrops in batches"
    echo "  node script.js swap-batch [batch_size]            - Execute single token swaps"
    echo "  node script.js multiswap-batch [batch_size] [tokens] - Execute multi-token swaps"
    echo "  node script.js swapv3-batch [batch_size]          - Execute V3 swaps"
    echo ""
    echo -e "${CYAN}Full Automation:${NC}"
    echo "  node script.js full [wallets] [chunk] [batch]     - Complete automation (single swaps)"
    echo "  node script.js fullmulti [wallets] [chunk] [batch] [tokens] - Complete automation (multi-swaps)"
    echo "  node script.js fullv3 [wallets] [chunk] [batch]   - Complete automation (V3 swaps)"
    echo ""
    echo -e "${CYAN}Individual Operations:${NC}"
    echo "  node script.js airdrop [start] [end]              - Send airdrops to range"
    echo "  node script.js swap [start] [end]                 - Single token swaps for range"
    echo "  node script.js multiswap [start] [end] [tokens]   - Multi-token swaps for range"
    echo "  node script.js swapv3 [start] [end]               - V3 swaps for range"
    echo ""
    echo -e "${CYAN}Web GUI:${NC}"
    echo "  npm run gui                                        - Start Web GUI server"
    echo "  npm run dev                                        - Start Web GUI in development mode"
    echo ""
    echo -e "${PURPLE}Configuration:${NC}"
    echo "  All batch sizes and wallet counts can be configured in .env file"
    echo "  Default values: 1000 wallets, 500 airdrop chunk, 50 swap batch"
    echo "  Web GUI runs on http://localhost:3000"
    echo ""
    echo -e "${PURPLE}Examples:${NC}"
    echo "  $0 setup                                           # Initial setup"
    echo "  $0 status                                          # Check system status"
    echo "  node script.js create 2000                        # Create 2000 wallets"
    echo "  node script.js airdrop-batch 200                  # Airdrop in chunks of 200"
    echo "  node script.js multiswap-batch 25 '0xABC,0xDEF'   # Multi-swap with custom tokens"
    echo "  node script.js full 5000 300 40                   # Full automation with custom settings"
    echo "  $0 gui                                             # Start Web GUI"
    echo ""
    echo -e "${PURPLE}External Files:${NC}"
    echo "  script.js:     $WALLET_MANAGER_URL"
    echo "  package.json:  $PACKAGE_JSON_URL"
    echo "  server.js:     $SERVER_JS_URL"
    echo "  index.html:    $INDEX_HTML_URL"
    echo ""
    echo -e "${PURPLE}System Requirements:${NC}"
    echo "  - Node.js v${NODEJS_MIN_VERSION}+ (will be installed automatically if missing)"
    echo "  - npm or yarn (included with Node.js)"
    echo "  - curl or wget (for downloading external files)"
    echo "  - Sufficient ETH in funding wallet for gas fees"
    echo ""
    echo -e "${RED}🔒 Security Notes:${NC}"
    echo "  - Keep your .env file secure and never share it"
    echo "  - Use a dedicated funding wallet for this script"
    echo "  - Monitor transactions and gas fees regularly"
    echo "  - Test with small amounts first"
}

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Main script execution
case ${1:-help} in
    setup)
        echo -e "${CYAN}🔧 Starting Wallet Automation Setup...${NC}"
        log "🔧 Setting up environment..."
        ensure_nodejs
        check_package_json
        check_node_script
        check_server_js
        check_index_html
        create_env_template
        install_dependencies
        validate_scripts
        
        # Show final wallet address after dependencies are installed
        if [[ -f "$ENV_FILE" ]]; then
            local final_private_key=$(grep "PK_MAIN=" "$ENV_FILE" | cut -d'=' -f2)
            if [[ -n "$final_private_key" ]]; then
                local final_address=$(derive_address_after_setup "$final_private_key")
                if [[ -n "$final_address" && "$final_address" != "Unable to derive address" && "$final_address" != "DERIVE_LATER" ]]; then
                    echo ""
                    echo -e "${GREEN}🎯 FINAL SETUP SUMMARY${NC}"
                    echo -e "${BLUE}Funding Wallet Address: $final_address${NC}"
                    echo -e "${YELLOW}👆 Send ETH to this address for gas fees!${NC}"
                    echo ""
                fi
            fi
        fi
        
        log "✅ Setup completed!"
        echo ""
        echo -e "${GREEN}🚀 Setup Complete! Next Steps:${NC}"
        echo "1. 📊 Check status: $0 status"
        echo "2. 👛 Create wallets: node script.js create [count]"
        echo "3. 🌐 Launch Web GUI: $0 gui"
        echo "4. 📖 Quick guide: $0 quick-start"
        ;;
    update)
        echo -e "${CYAN}🔄 Updating External Scripts...${NC}"
        log "🔄 Updating external scripts..."
        ensure_nodejs
        update_external_scripts
        validate_scripts
        log "✅ Update completed!"
        echo -e "${GREEN}✅ All scripts updated successfully!${NC}"
        ;;
    validate)
        echo -e "${CYAN}🔍 Validating Scripts...${NC}"
        log "🔍 Validating scripts..."
        ensure_nodejs
        if validate_scripts; then
            log "✅ All scripts are valid"
            echo -e "${GREEN}✅ All scripts validated successfully!${NC}"
        else
            error_log "❌ Script validation failed"
            echo -e "${RED}❌ Script validation failed. Run '$0 update' to fix.${NC}"
            exit 1
        fi
        ;;
    check-node)
        echo -e "${CYAN}🔍 Checking Node.js Installation...${NC}"
        log "🔍 Checking Node.js installation..."
        if check_nodejs_version; then
            log "✅ Node.js is properly installed"
            echo -e "${GREEN}✅ Node.js is properly installed and compatible${NC}"
        else
            warning_log "Node.js is not installed or version is too old"
            echo -e "${RED}❌ Node.js issue detected${NC}"
            echo "Run '$0 setup' to install Node.js automatically"
        fi
        ;;
    status)
        check_system_status
        ;;
    gui)
        echo -e "${CYAN}🌐 Starting Web GUI...${NC}"
        start_web_gui
        ;;
    quick-start)
        show_quick_start
        ;;
    cleanup)
        cleanup
        ;;
    help|*)
        show_help
        ;;
esac

log "Script execution completed"