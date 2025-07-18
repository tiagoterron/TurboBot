const { ethers, utils } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Configuration from environment variables
const config = {
    rpcUrl: process.env.RPC_URL || "https://base-mainnet.g.alchemy.com/v2/your-api-key",
    fundingPrivateKey: process.env.PK_MAIN,
    defaultWalletCount: parseInt(process.env.DEFAULT_WALLET_COUNT) || 1000,
    defaultChunkSize: parseInt(process.env.DEFAULT_CHUNK_SIZE) || 500,
    defaultBatchSize: parseInt(process.env.DEFAULT_BATCH_SIZE) || 50,
    gasSettings: {
        gasPrice: process.env.GAS_PRICE_GWEI ? ethers.utils.parseUnits(process.env.GAS_PRICE_GWEI, 9) : null,
        gasLimit: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : null
    }
};

// Provider and contract configurations
const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

const contracts = {
    uniswapRouter: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
    airdropContract: "0x2084eE02Ad0df72DfA3cAFc7f90d23D5663c3880",
    multicallSwap: "0x0D99F3072fDbEDFFFf920f166F3B5d7e2bE32Ba0",
    v3SwapContract: "0xe9d7E6669C39350DD6664fd6fB66fCE4D871D374"
};

const routerAbi = [
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
];

const airdropAbi = [
    "function sendAirdropETH(address[] calldata recipients) external payable"
];

const multicallAbi = [
    "function executeMultiSwap(tuple(address tokenAddress, uint256 ethAmount, address recipient, address router, uint256 minAmountOut)[] swapDetails) external payable",
    "function swapPredefinedTokens(uint256 ethAmountToken1, uint256 ethAmountToken2, uint256 minAmountOutToken1, uint256 minAmountOutToken2, address recipient, address router) external payable",
    "function swapEqualAmounts(uint256 ethAmountEach, uint256 minAmountOutToken1, uint256 minAmountOutToken2, address recipient, address router) external payable"
];

// Default token addresses
const defaultTokens = {
    "V2": [
    "0xc849418f46A25D302f55d25c40a82C99404E5245", // KIKI
    "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460", // TURBO
    "0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB", // LORDY
    "0x7480527815ccAE421400Da01E052b120Cc4255E9"  // WORKIE
    ],
    "V3": [
    "0xf83cde146AC35E99dd61b6448f7aD9a4534133cc", // Ebert
    "0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9", // BasedBonk
    ]
}

// Utility functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function errorLog(message) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
}

function randomIndex(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return randomIndex;
  }

function random(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

async function getGasEstimates(tx, options) {
    const provider = options.provider.provider || options.provider;
    const baseGasPrice = await provider.getGasPrice();
    
    let gasLimit;
    try {
        gasLimit = await provider.estimateGas(tx);
        gasLimit = gasLimit.mul(100).div(100); // 50% buffer
    } catch (error) {
        gasLimit = 21000; // Fallback for simple transfers
    }
    
    const gasPrice = baseGasPrice.mul(100).div(100); // 20% boost
    const gasWei = gasPrice.mul(gasLimit);
    
    return { gasLimit, gasPrice, gasWei };
}

// File operations
function loadWallets() {
    try {
        if (fs.existsSync('./wallets.json')) {
            const data = fs.readFileSync('./wallets.json', 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        errorLog('Error loading wallets: ' + err.message);
    }
    return [];
}

function saveWallets(wallets) {
    try {
        fs.writeFileSync('./wallets.json', JSON.stringify(wallets, null, 2));
        log(`Saved ${wallets.length} wallets to wallets.json`);
    } catch (err) {
        errorLog('Error saving wallets: ' + err.message);
    }
}

function savePrivateKey(wallet) {
    try {
        let wallets = [];
        
        // Read existing wallets if file exists
        if (fs.existsSync('./wallets.json')) {
            const data = fs.readFileSync('./wallets.json', 'utf8');
            wallets = JSON.parse(data);
        }
    
        
        // Add new wallet
        wallets.push(wallet);
        
        // Save back to file
        fs.writeFileSync('./wallets.json', JSON.stringify(wallets, null, 2));
        
        console.log(`Saved wallet ${wallets.length}: ${wallet[0]}`);
        
    } catch (err) {
        console.error('Error saving wallet:', err.message);
    }
}

// Wallet management functions
async function createWallets(count) {
    log(`Creating ${count} new wallets...`);
    
    const existingWallets = loadWallets();
    log(`Found ${existingWallets.length} existing wallets`);
    
    const newWallets = [];
    
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        newWallets.push([wallet.address, wallet.privateKey]);
        
        if ((i + 1) % 100 === 0) {
            log(`Created ${i + 1}/${count} new wallets`);
        }
    }
    
    const allWallets = [...existingWallets, ...newWallets];
    saveWallets(allWallets);
    
    log(`✅ Successfully created ${count} new wallets`);
    log(`📊 Total wallets: ${allWallets.length} (${existingWallets.length} existing + ${newWallets.length} new)`);
    
    return allWallets;
}

async function createWalletsToTarget(targetCount) {
    const existingWallets = loadWallets();
    const currentCount = existingWallets.length;
    
    log(`Current wallet count: ${currentCount}`);
    log(`Target wallet count: ${targetCount}`);
    
    if (currentCount >= targetCount) {
        log(`✅ Already have ${currentCount} wallets (target: ${targetCount})`);
        return existingWallets;
    }
    
    const needed = targetCount - currentCount;
    log(`Creating ${needed} additional wallets...`);
    
    return await createWallets(needed);
}

async function checkWallets() {
    const wallets = loadWallets();
    
    if (wallets.length === 0) {
        log("No wallets found. Use 'create' command to generate wallets.");
        return;
    }
    
    log(`📊 Wallet Statistics:`);
    log(`Total wallets: ${wallets.length}`);
    log(`First wallet: ${wallets[0][0]}`);
    log(`Last wallet: ${wallets[wallets.length - 1][0]}`);
    const mainWallet = new ethers.Wallet(config.fundingPrivateKey)
    const mainwalletbalance = await provider.getBalance(mainWallet.address);

    console.log(`Main Wallet: ${mainWallet.address} balance is: ${ethers.utils.formatUnits(mainwalletbalance, 18)}`)
    
    // Check balances of first few wallets as sample
    log(`Checking balances of first 3 wallets...`);
    for (let i = 0; i < Math.min(3, wallets.length); i++) {
        try {
            const balance = await provider.getBalance(wallets[i][0]);
            log(`Wallet ${i}: ${wallets[i][0]} - ${ethers.utils.formatEther(balance)} ETH`);
        } catch (err) {
            errorLog(`Failed to check balance for wallet ${i}: ${err.message}`);
        }
    }
}

// Individual operation functions
async function sendAirdropWallets(start, end, wallets, totalEthAmount = null) {
    try {
        if (!config.fundingPrivateKey) {
            throw new Error('PK_MAIN not configured in .env file');
        }
        
        const signer = new ethers.Wallet(config.fundingPrivateKey, provider);
        const recipients = wallets.slice(start, end).map(wallet => wallet[0]);
        
        let amountPerWallet;
        let totalValue;
        
        if (totalEthAmount) {
            // Distribute the total amount among all recipients in this batch
            totalValue = ethers.utils.parseUnits(totalEthAmount.toString(), 18);
            amountPerWallet = totalValue.div(recipients.length);
            log(`Distributing ${totalEthAmount} ETH among ${recipients.length} wallets (${ethers.utils.formatEther(amountPerWallet)} ETH each)`);
        } else {
            // Use default amount per wallet
            const defaultAmount = "0.0015";
            amountPerWallet = ethers.utils.parseUnits(defaultAmount, 18);
            totalValue = amountPerWallet.mul(recipients.length);
            log(`Sending default ${defaultAmount} ETH to each of ${recipients.length} wallets`);
        }
        
        log(`Sending airdrop to wallets ${start} - ${end}`);
        log(`Total amount: ${ethers.utils.formatEther(totalValue)} ETH`);
        log(`Amount per wallet: ${ethers.utils.formatEther(amountPerWallet)} ETH`);
        
        const balance = await provider.getBalance(signer.address);
        log(`Funding Wallet address: ${signer.address}`);
        log(`Funding wallet balance: ${ethers.utils.formatEther(balance)} ETH`);
        
        // Check if we have enough balance
        if (balance.lt(totalValue)) {
            throw new Error(`Insufficient balance. Need ${ethers.utils.formatEther(totalValue)} ETH but have ${ethers.utils.formatEther(balance)} ETH`);
        }
        
        // Setup airdrop contract
        const abi = ["function sendAirdropETH(address[] calldata recipients) external payable"];
        const airdrop = new ethers.Contract("0x2084eE02Ad0df72DfA3cAFc7f90d23D5663c3880", abi, signer);
        
        // Prepare transaction data
        const tx = {
            to: airdrop.address,
            data: airdrop.interface.encodeFunctionData("sendAirdropETH", [recipients]),
            value: totalValue
        };
        
        // Get transaction parameters
        const nonce = await signer.getTransactionCount("pending");
        const gasPrice = await provider.getGasPrice();
        const gasLimit = await provider.estimateGas({
            ...tx,
            from: signer.address
        });
        
        log(`Transaction nonce: ${nonce}`);
        log(`Gas price: ${ethers.utils.formatUnits(gasPrice, 9)} Gwei`);
        log(`Estimated gas limit: ${gasLimit.toString()}`);
        log(`Gas cost: ${ethers.utils.formatEther(gasPrice.mul(gasLimit))} ETH`);
        
        // Send transaction
        const transaction = await signer.sendTransaction({
            ...tx,
            gasLimit: gasLimit.mul(100).div(100), // 200% of estimated gas
            gasPrice: gasPrice.mul(100).div(100), // 200% of current gas price
            nonce,
        });
        
        log(`📤 Transaction sent: ${transaction.hash}`);
        log(`⏳ Waiting for confirmation...`);
        
        // Wait for transaction confirmation
        const receipt = await transaction.wait();
        
        if (receipt.status === 1) {
            log(`✅ Airdrop completed: ${receipt.transactionHash}`);
            log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            log(`💰 Total ETH distributed: ${ethers.utils.formatEther(totalValue)} ETH`);
        } else {
            throw new Error(`Transaction failed: ${receipt.transactionHash}`);
        }
        
        // Wait 2 seconds before returning (as in your example)
        await sleep(2000);
        
        return {
            success: true,
            transactionHash: receipt.transactionHash,
            gasUsed: receipt.gasUsed.toString(),
            totalAmount: ethers.utils.formatEther(totalValue),
            amountPerWallet: ethers.utils.formatEther(amountPerWallet),
            recipients: recipients.length
        };
        
    } catch (err) {
        errorLog(`Airdrop failed for range ${start}-${end}: ${err.message}`);
        throw err;
    }
}

async function executeSwap(index, wallets, tokenAddress) {
    try {
        if (index >= wallets.length) return null;

        
        const signer = new ethers.Wallet(wallets[index][1], provider);
        const routerContract = new ethers.Contract(contracts.uniswapRouter, routerAbi, signer);
        
        console.log(`Sending microtx: ${signer.address}`);
        
        const amount = ethers.utils.parseUnits("10", "wei");
        const path = [
            "0x4200000000000000000000000000000000000006", // WETH
            tokenAddress
        ];
        const to = "0xF49ddac4B0A0A7412f2Ec7E4Eacbc3133c135D25";
        const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 20;
        
        const tx = {
            to: routerContract.address,
            data: routerContract.interface.encodeFunctionData("swapExactETHForTokens", [
                0,
                path,
                to,
                deadline
            ]),
            value: amount
        };
        
        const nonce = await signer.getTransactionCount("pending");
        const gasPrice = await provider.getGasPrice();
        const gasLimit = await provider.estimateGas({
            ...tx,
            from: signer.address,
        });
        
        const increasedGasPrice = gasPrice.mul(100).div(100);
        const increasedGasLimit = gasLimit.mul(120).div(100);
        
        const transaction = await signer.sendTransaction({
            ...tx,
            gasLimit: increasedGasLimit,
            gasPrice: increasedGasPrice,
            nonce,
        });

        log(`✅ Swap ${index} successful: ${transaction.hash}`);
        
        return transaction.hash;
        
    } catch (err) {
        if (err.message.includes('insufficient funds')) {
            console.log(`No funds in wallet ${index}`);
        }
        throw err;
    }
}

async function executeMultiSwap(index, wallets, tokens = null) {
    try {
        if (index >= wallets.length) return null;

        const signer = new ethers.Wallet(wallets[index][1], provider);
        
        console.log(`Wallet ${index}: ${signer.address}`);
        
        // Your MulticallSwap contract
        const multicallAddress = "0x0D99F3072fDbEDFFFf920f166F3B5d7e2bE32Ba0";
        const multicallABI = [
            "function executeMultiSwap(tuple(address tokenAddress, uint256 ethAmount, address recipient, address router, uint256 minAmountOut)[] swapDetails) external payable"
        ];

        const multicallContract = new ethers.Contract(multicallAddress, multicallABI, signer);

        // Router address - Base network router
        const routerAddress = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";
        
        // Define the token addresses you want to swap
        const tokensToSwap = tokens || [
            // "0xc849418f46A25D302f55d25c40a82C99404E5245", //KIKI
            "0xBA5E66FB16944Da22A62Ea4FD70ad02008744460", //TURBO
            // "0xe388A9a5bFD958106ADeB79df10084a8b1D9a5aB", //LORDY
            // "0x7480527815ccAE421400Da01E052b120Cc4255E9"  //WORKIE
        ];

        const numberOfTokens = tokensToSwap.length;
        console.log(`Number of tokens to swap: ${numberOfTokens}`);
        
        // Calculate available balance for swapping (reserve gas)
        const currentBalance = await provider.getBalance(signer.address);
        console.log(`Current wallet balance: ${ethers.utils.formatUnits(currentBalance, 18)} ETH`);
        
        // Reserve ETH for gas costs (estimate high to be safe)
        const gasReserve = ethers.utils.parseUnits("0.000002", 18);
        const availableForSwap = currentBalance.sub(gasReserve);
        
        if (availableForSwap.lte(0)) {
            throw new Error(`Insufficient balance for swap after gas reserve. Balance: ${ethers.utils.formatUnits(currentBalance, 18)} ETH, Gas reserve: ${ethers.utils.formatUnits(gasReserve, 18)} ETH`);
        }
        
        // Use 10 wei per token
        let amountPerToken = ethers.BigNumber.from("10");
        let totalSwapAmount = amountPerToken.mul(numberOfTokens);
        
        console.log(`Available for swap: ${ethers.utils.formatUnits(availableForSwap, 18)} ETH`);
        console.log(`Amount per token: ${amountPerToken.toString()} wei (${ethers.utils.formatUnits(amountPerToken, 18)} ETH)`);
        console.log(`Total swap amount: ${totalSwapAmount.toString()} wei (${ethers.utils.formatUnits(totalSwapAmount, 18)} ETH)`);
        
        // Create swap details for all tokens
        let swapDetails = tokensToSwap.map(tokenAddress => ({
            tokenAddress: tokenAddress,
            ethAmount: amountPerToken,
            recipient: signer.address,
            router: routerAddress,
            minAmountOut: 0
        }));

        console.log(`Swapping ${amountPerToken.toString()} wei for each of ${numberOfTokens} tokens...`);
        
        // Get gas price and estimate more conservatively
        const currentGasPrice = await provider.getGasPrice();
        console.log(`Current gas price: ${ethers.utils.formatUnits(currentGasPrice, 9)} Gwei`);
        
        // Use conservative gas price
        const adjustedGasPrice = currentGasPrice.mul(100).div(100);
        
        // Use a more reasonable gas limit
        let estimatedGasLimit;
        try {
            estimatedGasLimit = await multicallContract.estimateGas.executeMultiSwap(swapDetails, {
                value: totalSwapAmount,
                from: signer.address
            });
            console.log(`Estimated gas limit: ${estimatedGasLimit.toString()}`);
        } catch (gasError) {
            console.log("Gas estimation failed, using conservative fallback");
            estimatedGasLimit = ethers.BigNumber.from("300000");
        }
        
        // Add small buffer to gas limit
        const gasLimitWithBuffer = estimatedGasLimit.mul(110).div(100);
        
        // Calculate total transaction cost
        const totalGasCost = adjustedGasPrice.mul(gasLimitWithBuffer);
        const totalTxCost = totalSwapAmount.add(totalGasCost);
        
        console.log(`Gas limit with buffer: ${gasLimitWithBuffer.toString()}`);
        console.log(`Adjusted gas price: ${ethers.utils.formatUnits(adjustedGasPrice, 9)} Gwei`);
        console.log(`Total gas cost: ${ethers.utils.formatUnits(totalGasCost, 18)} ETH`);
        console.log(`Total tx cost: ${ethers.utils.formatUnits(totalTxCost, 18)} ETH`);
        console.log(`Wallet balance: ${ethers.utils.formatUnits(currentBalance, 18)} ETH`);
        
        // Verify we have enough balance
        if (currentBalance.lt(totalTxCost)) {
            throw new Error(`Insufficient funds. Need ${ethers.utils.formatUnits(totalTxCost, 18)} ETH but have ${ethers.utils.formatUnits(currentBalance, 18)} ETH`);
        }
        
        // Get nonce for swap transaction
        const swapNonce = await signer.getTransactionCount("pending");
        
        // Execute the multi-swap transaction
        const swapTransaction = await multicallContract.executeMultiSwap(swapDetails, {
            value: totalSwapAmount,
            gasLimit: gasLimitWithBuffer,
            gasPrice: adjustedGasPrice,
            nonce: swapNonce
        });
        
        console.log(`Swap transaction sent: ${swapTransaction.hash}`);
        
        // Wait for the swap transaction to be mined
        const swapReceipt = await swapTransaction.wait();
        
        if (swapReceipt && swapReceipt.status === 1) {
            console.log(`✅ Multi-swap successful: ${swapReceipt.transactionHash}`);
            return { success: true, txHash: swapReceipt.transactionHash };
        } else {
            console.log(`❌ Multi-swap failed: ${swapReceipt?.transactionHash || swapTransaction.hash}`);
            return { success: false, txHash: swapReceipt?.transactionHash || swapTransaction.hash };
        }
        
    } catch (error) {
        if (err.message.includes('insufficient funds')) {
            console.log(`No funds in wallet ${index}`);
            return { success: false, reason: 'insufficient_funds' };
        } else if (err.message.includes('nonce too low')) {
            console.log(`Nonce issue in wallet ${index}`);
            return { success: false, reason: 'nonce_error' };
        }
        
        // Only throw unexpected errors
        console.error(`Unexpected error in wallet ${index}:`, err.message);
        throw err;
    }
}

async function executeV3Swap(index, wallets, tokenAddress) {
   try {

        if (index >= wallets.length) return null;
        
        const signer = new ethers.Wallet(wallets[index][1], provider);
        
        console.log(`Index: ${index} ${signer.address}`);
        
        const amount = ethers.utils.parseUnits("10", "wei");
        const weth = "0x4200000000000000000000000000000000000006";
        const contractAddress = '0xe9d7E6669C39350DD6664fd6fB66fCE4D871D374'
        const token = tokenAddress || random(defaultTokens["V3"]);
        const fee = 10000;
        
        // Build exact transaction data
        const functionSelector = "0xd014efef";
        const encodedParams = ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint24", "address"],
            [weth, token, fee, signer.address]
        );
        
        const txData = functionSelector + encodedParams.slice(2);
        
        const tx = {
            to: contractAddress,
            data: txData,
            value: amount,
            gasLimit: ethers.BigNumber.from("200000"),
            gasPrice: (await provider.getGasPrice()).mul(100).div(100),
            nonce: await signer.getTransactionCount("pending")
        };
        
        const transaction = await signer.sendTransaction(tx);
        console.log(`✅ Success! Hash: ${transaction.hash}`);
        return transaction;
        
    } catch (err) {
        if (err.message.includes('insufficient funds')) {
            console.log(`No funds in wallet ${index}`);
            return { success: false, reason: 'insufficient_funds' };
        } else if (err.message.includes('nonce too low')) {
            console.log(`Nonce issue in wallet ${index}`);
            return { success: false, reason: 'nonce_error' };
        }
        
        // Only throw unexpected errors
        console.error(`Unexpected error in wallet ${index}:`, err.message);
        throw err;
    }
}

// Batch operation functions
async function airdropBatch(chunkSize = config.defaultChunkSize, totalEthAmount = null) {
    log(`Starting airdrop batch processing with chunk size: ${chunkSize}`);
    
    const wallets = loadWallets();
    if (wallets.length === 0) {
        throw new Error('No wallets found. Create wallets first.');
    }
    
    log(`Found ${wallets.length} wallets for airdrop`);
    
    let amountPerWallet;
    let totalDistribution;
    
    if (totalEthAmount) {
        // Calculate amount per wallet for the entire batch
        totalDistribution = ethers.utils.parseUnits(totalEthAmount.toString(), 18);
        amountPerWallet = totalDistribution.div(wallets.length);
        
        log(`📊 Airdrop Distribution Summary:`);
        log(`Total ETH to distribute: ${totalEthAmount} ETH`);
        log(`Total wallets: ${wallets.length}`);
        log(`ETH per wallet: ${ethers.utils.formatEther(amountPerWallet)} ETH`);
        log(`Chunk size: ${chunkSize} wallets per transaction`);
        
        // Verify we have enough balance
        const signer = new ethers.Wallet(config.fundingPrivateKey, provider);
        const balance = await provider.getBalance(signer.address);
        if (balance.lt(totalDistribution)) {
            throw new Error(`Insufficient balance. Need ${totalEthAmount} ETH but have ${ethers.utils.formatEther(balance)} ETH`);
        }
    } else {
        log(`Using default amount per wallet (0.0015 ETH each)`);
    }
    
    // Setup contract once for all chunks
    const signer = new ethers.Wallet(config.fundingPrivateKey, provider);
    const abi = ["function sendAirdropETH(address[] calldata recipients) external payable"];
    const airdrop = new ethers.Contract("0x2084eE02Ad0df72DfA3cAFc7f90d23D5663c3880", abi, signer);
    
    let totalSuccessful = 0;
    let totalFailed = 0;
    const completedChunks = [];
    
    for (let start = 0; start < wallets.length; start += chunkSize) {
        const end = Math.min(start + chunkSize, wallets.length);
        const recipientsInChunk = end - start;
        const recipients = wallets.slice(start, end).map(wallet => wallet[0]);
        
        try {
            let chunkValue;
            
            if (totalEthAmount) {
                // Calculate the portion of total ETH for this chunk
                chunkValue = amountPerWallet.mul(recipientsInChunk);
                const chunkAmountEth = ethers.utils.formatEther(chunkValue);
                log(`Processing chunk ${start}-${end}: ${chunkAmountEth} ETH for ${recipientsInChunk} wallets`);
            } else {
                // Use default amount per wallet
                const defaultAmount = ethers.utils.parseUnits("0.0015", 18);
                chunkValue = defaultAmount.mul(recipientsInChunk);
                log(`Processing chunk ${start}-${end}: ${ethers.utils.formatEther(chunkValue)} ETH for ${recipientsInChunk} wallets (0.0015 ETH each)`);
            }
            
            // Prepare transaction data
            const tx = {
                to: airdrop.address,
                data: airdrop.interface.encodeFunctionData("sendAirdropETH", [recipients]),
                value: chunkValue
            };
            
            // Get transaction parameters
            const nonce = await signer.getTransactionCount("pending");
            const gasPrice = await provider.getGasPrice();
            const gasLimit = await provider.estimateGas({
                ...tx,
                from: signer.address
            });
            
            log(`Chunk ${start}-${end} - Nonce: ${nonce}, Gas: ${ethers.utils.formatUnits(gasPrice, 9)} Gwei`);
            
            // Send transaction
            const transaction = await signer.sendTransaction({
                ...tx,
                gasLimit: gasLimit.mul(100).div(100), // 200% of estimated gas
                gasPrice: gasPrice.mul(100).div(100), // 200% of current gas price
                nonce,
            });
            
            log(`📤 Chunk ${start}-${end} transaction sent: ${transaction.hash}`);
            log(`⏳ Waiting for confirmation...`);
            
            // Wait for transaction confirmation
            const receipt = await transaction.wait();
            
            if (receipt.status === 1) {
                log(`✅ Airdrop chunk ${start}-${end} completed: ${receipt.transactionHash}`);
                log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
                log(`💰 ETH distributed: ${ethers.utils.formatEther(chunkValue)} ETH`);
                
                totalSuccessful += recipientsInChunk;
                completedChunks.push({
                    range: `${start}-${end}`,
                    txHash: receipt.transactionHash,
                    recipients: recipientsInChunk,
                    amount: ethers.utils.formatEther(chunkValue)
                });
            } else {
                throw new Error(`Transaction failed: ${receipt.transactionHash}`);
            }
            
            // Wait between chunks (except for the last one)
            if (end < wallets.length) {
                log(`Waiting 3 seconds before next chunk...`);
                await sleep(3000);
            }
            
        } catch (err) {
            errorLog(`❌ Airdrop chunk ${start}-${end} failed: ${err.message}`);
            totalFailed += recipientsInChunk;
            
            // Continue with next chunk even if this one fails
            if (end < wallets.length) {
                log(`Continuing with next chunk after 3 second delay...`);
                await sleep(3000);
            }
        }
    }
    
    // Final summary
    log(`\n📊 Final Airdrop Summary:`);
    log(`✅ Successful wallets: ${totalSuccessful}/${wallets.length}`);
    log(`❌ Failed wallets: ${totalFailed}/${wallets.length}`);
    log(`📦 Completed chunks: ${completedChunks.length}`);
    
    if (totalEthAmount) {
        const actualDistributed = (totalSuccessful / wallets.length) * totalEthAmount;
        log(`💰 Total ETH distributed: ${actualDistributed.toFixed(6)} ETH out of ${totalEthAmount} ETH planned`);
    }
    
    // Log completed transaction hashes
    if (completedChunks.length > 0) {
        log(`\n🔗 Transaction Hashes:`);
        completedChunks.forEach(chunk => {
            log(`  Chunk ${chunk.range}: ${chunk.txHash} (${chunk.recipients} wallets, ${chunk.amount} ETH)`);
        });
    }
    
    if (totalFailed > 0) {
        log(`\n⚠️  Warning: ${totalFailed} wallets did not receive airdrops due to failed transactions.`);
    }
    
    if (totalEthAmount) {
        log(`✅ Airdrop batch completed - Distributed to ${totalSuccessful} wallets`);
    } else {
        log("✅ All airdrop batches completed");
    }
    
    return {
        success: totalFailed === 0,
        totalWallets: wallets.length,
        successfulWallets: totalSuccessful,
        failedWallets: totalFailed,
        completedChunks: completedChunks,
        chunkSize: chunkSize
    };
}
async function swapBatch(batchSize = config.defaultBatchSize, tokenAddress) {
    log(`Starting single token swap batch processing with batch size: ${batchSize}`);
    
    const wallets = loadWallets();
    if (wallets.length === 0) {
        throw new Error('No wallets found. Create wallets first.');
    }
    
    let successfulSwaps = 0;
    let failedSwaps = 0;
    
    for (let start = 0; start < wallets.length; start += batchSize) {
        const end = Math.min(start + batchSize, wallets.length);
        log(`Processing swap batch ${start}-${end}`);
        
        const batchPromises = [];
        for (let i = start; i < end; i++) {
            batchPromises.push(
                executeSwap(i, wallets, tokenAddress)
                    .then(() => successfulSwaps++)
                    .catch(() => failedSwaps++)
            );
        }
        
        await Promise.all(batchPromises);
        log(`Batch ${start}-${end} completed`);
        
        if (end < wallets.length) {
            await sleep(1000);
        }
    }
    
    log(`✅ All swap batches completed: ${successfulSwaps} successful, ${failedSwaps} failed`);
}

async function multiSwapBatch(batchSize = config.defaultBatchSize, tokens = defaultTokens["v2"]) {
    log(`Starting multi-token swap batch processing with batch size: ${batchSize}`);
    
    const wallets = loadWallets();
    if (wallets.length === 0) {
        throw new Error('No wallets found. Create wallets first.');
    }
    
    const tokensToUse = tokens || defaultTokens["V2"];
    log(`Using tokens: ${tokensToUse.join(', ')}`);
    
    let successfulSwaps = 0;
    let failedSwaps = 0;
    
    for (let start = 0; start < wallets.length; start += batchSize) {
        const end = Math.min(start + batchSize, wallets.length);
        log(`Processing multi-swap batch ${start}-${end}`);
        
        const batchPromises = [];
        for (let i = start; i < end; i++) {
            batchPromises.push(
                executeMultiSwap(i, wallets, tokensToUse)
                    .then(result => {
                        if (result && result.success !== false) {
                            successfulSwaps++;
                        } else {
                            failedSwaps++;
                        }
                    })
                    .catch(() => failedSwaps++)
            );
        }
        
        await Promise.all(batchPromises);
        log(`Multi-swap batch ${start}-${end} completed`);
        
        if (end < wallets.length) {
            await sleep(2000);
        }
    }
    
    log(`✅ All multi-swap batches completed: ${successfulSwaps} successful, ${failedSwaps} failed`);
}

async function v3SwapBatch(batchSize = config.defaultBatchSize, tokenAddress, startAt, endsAt) {
    log(`Starting V3 swap batch processing with batch size: ${batchSize}`);

    
    const wallets = loadWallets();
    if (wallets.length === 0) {
        throw new Error('No wallets found. Create wallets first.');
    }

    
    let successfulSwaps = 0;
    let failedSwaps = 0;
    
    for (let start = startAt; start < endsAt; start += batchSize) {
        const end = Math.min(start + batchSize, wallets.length);
        log(`Processing V3 swap batch ${start}-${end}`);
        
        const batchPromises = [];
        for (let i = start; i < end; i++) {
            batchPromises.push(
                executeV3Swap(i, wallets, tokenAddress)
                    .then(() => successfulSwaps++)
                    .catch(() => failedSwaps++)
            );
        }
        
        await Promise.all(batchPromises);
        log(`V3 swap batch ${start}-${end} completed`);
        
        if (end < wallets.length) {
            await sleep(2000);
        }
    }
    
    log(`✅ All V3 swap batches completed: ${successfulSwaps} successful, ${failedSwaps} failed`);
}

async function createWalletAndMultiSmall(multiTokens) {
    let connectedNewWallet = null;
    let mainSigner = null;
    const newWallet = ethers.Wallet.createRandom();
    var fundingAmount = "0.00001"
    var pk = config.fundingPrivateKey

    try {

        mainSigner = new ethers.Wallet(config.fundingPrivateKey, provider);
        console.log("Main wallet:", mainSigner.address, pk);

        console.log(`Funding: `, fundingAmount)

        // Step 1: Create a random new wallet
        
        connectedNewWallet = newWallet.connect(provider);
        
        console.log(`Created new wallet: ${newWallet.address} ${newWallet.privateKey}`);

        savePrivateKey([
            newWallet.address,
            newWallet.privateKey
        ])
        

        // Step 2: Fund the new wallet from main signer
        const fundingAmountWei = ethers.utils.parseUnits(fundingAmount, 18);

        
        // Check main signer balance
        const mainBalance = await provider.getBalance(mainSigner.address);
        if (mainBalance.lt(fundingAmountWei)) {
            throw new Error(`Insufficient balance in main wallet. Need ${fundingAmount} ETH, have ${ethers.utils.formatUnits(mainBalance, 18)} ETH`);
        }
        
        console.log(`Funding new wallet with ${fundingAmount} ETH...`);
        
        // Prepare funding transaction
        const fundingTx = {
            to: newWallet.address,
            value: fundingAmountWei
        };
        
        // Get gas estimates with fallback
        let fundingGasLimit, fundingGasPrice;
        try {
            // Try to use getGasEstimates if it exists
            if (typeof getGasEstimates === 'function') {
                const gasEstimates = await getGasEstimates(fundingTx, { provider: mainSigner });
                fundingGasLimit = gasEstimates.gasLimit;
                fundingGasPrice = gasEstimates.gasPrice;
            } else {
                throw new Error("getGasEstimates not available");
            }
        } catch (gasError) {
            console.log("Using fallback gas estimation for funding");
            const baseGasPrice = await provider.getGasPrice();
            fundingGasPrice = baseGasPrice.mul(120).div(100); // 20% boost
            fundingGasLimit = 21000;
        }
        
        // Get nonce with fallback
        let fundingNonce;
        try {
            if (typeof getNonce === 'function') {
                fundingNonce = await getNonce(mainSigner, { provider });
            } else {
                fundingNonce = await mainSigner.getTransactionCount("pending");
            }
        } catch (nonceError) {
            fundingNonce = await mainSigner.getTransactionCount("pending");
        }
        
        console.log(`Funding gas price: ${ethers.utils.formatUnits(fundingGasPrice, 9)} Gwei`);
        
        // Send funding transaction
        const fundingTransaction = await mainSigner.sendTransaction({
            ...fundingTx,
            gasLimit: fundingGasLimit,
            gasPrice: fundingGasPrice,
            nonce: fundingNonce
        });
        
        console.log(`Funding transaction sent: ${fundingTransaction.hash}`);
        await fundingTransaction.wait();
        console.log(`✅ Funding successful`);
        
        // Verify funding
        const newWalletBalance = await provider.getBalance(connectedNewWallet.address);
        console.log(`New wallet balance: ${ethers.utils.formatUnits(newWalletBalance, 18)} ETH`);
        
        // Step 3: Execute swap using the new wallet with your custom contract
        console.log(`Executing swap from new wallet...`);


        // Initialize your custom contract with the NEW WALLET
        const multicallContract = new ethers.Contract("0x0D99F3072fDbEDFFFf920f166F3B5d7e2bE32Ba0", multicallAbi, connectedNewWallet);

        
        // Define the token addresses you want to swap - ADD MORE TOKENS HERE
        const tokensToSwap = multiTokens || defaultTokens["V2"]
        
        const numberOfTokens = tokensToSwap.length;
        console.log(`Number of tokens to swap: ${numberOfTokens}`);
        
        // Calculate available balance for swapping (reserve gas)
        let currentBalance = await provider.getBalance(connectedNewWallet.address);
        console.log(`Current wallet balance: ${ethers.utils.formatUnits(currentBalance, 18)} ETH`);

        await new Promise(async (resolve, reject) => {
            let indexETH = 0;
            try{

            
            while(currentBalance.eq(0) && indexETH < 100){
                console.log('Waiting for ETH balance to update...');
                await sleep(1000);
                currentBalance = await provider.getBalance(connectedNewWallet.address);
                indexETH++;
            }
            
            if(currentBalance.gt(0)){
                console.log('Balance loaded, sending tokens back...');
                 resolve()
            }

        }catch(err){
            console.warn('Error', err?.message);
                await sendETHBack(connectedNewWallet.privateKey, mainSigner.address)
        }

        })

        // Reserve ETH for gas costs (estimate high to be safe)
        const gasReserve = ethers.utils.parseUnits("0.000004", 18);
        const availableForSwap = currentBalance.sub(gasReserve);
        
        if (availableForSwap.lte(0)) {
            throw new Error(`Insufficient balance for swap after gas reserve. Balance: ${ethers.utils.formatUnits(currentBalance, 18)} ETH, Gas reserve: ${ethers.utils.formatUnits(gasReserve, 18)} ETH`);
        }
        
        // Split available amount equally between all tokens - USE 1 WEI PER TOKEN
        let amountPerToken = ethers.BigNumber.from("10"); // 1 wei per token
        let totalSwapAmount = amountPerToken.mul(numberOfTokens);
        
        console.log(`Available for swap: ${ethers.utils.formatUnits(availableForSwap, 18)} ETH`);
        console.log(`Amount per token: ${amountPerToken.toString()} wei (${ethers.utils.formatUnits(amountPerToken, 18)} ETH)`);
        console.log(`Total swap amount: ${totalSwapAmount.toString()} wei (${ethers.utils.formatUnits(totalSwapAmount, 18)} ETH)`);
        
        // Create swap details for all tokens
        let swapDetails = tokensToSwap.map(tokenAddress => ({
            tokenAddress: tokenAddress,
            ethAmount: amountPerToken,
            recipient: connectedNewWallet.address,
            router: contracts.uniswapRouter,
            minAmountOut: 0
        }));

        console.log(`Swapping ${amountPerToken.toString()} wei for each of ${numberOfTokens} tokens...`);
        
        // Get gas price and estimate more conservatively
        const currentGasPrice = await provider.getGasPrice();
        console.log(`Current gas price: ${ethers.utils.formatUnits(currentGasPrice, 9)} Gwei`);
        
        // Use a more conservative gas price (only 10% increase)
        const adjustedGasPrice = currentGasPrice.mul(100).div(100);
        
        // Use a more reasonable gas limit
        let estimatedGasLimit;
        try {
            estimatedGasLimit = await multicallContract.estimateGas.executeMultiSwap(swapDetails, {
                value: totalSwapAmount,
                from: connectedNewWallet.address
            });
            console.log(`Estimated gas limit: ${estimatedGasLimit.toString()}`);
        } catch (gasError) {
            console.log("Gas estimation failed, using conservative fallback");
            estimatedGasLimit = ethers.BigNumber.from("300000");
        }
        
        // Add 20% buffer to gas limit
        const gasLimitWithBuffer = estimatedGasLimit.mul(100).div(100);
        
        // Calculate total transaction cost
        const totalGasCost = adjustedGasPrice.mul(gasLimitWithBuffer);
        const totalTxCost = totalSwapAmount.add(totalGasCost);
        
        console.log(`Gas limit with buffer: ${gasLimitWithBuffer.toString()}`);
        console.log(`Adjusted gas price: ${ethers.utils.formatUnits(adjustedGasPrice, 9)} Gwei`);
        console.log(`Total gas cost: ${ethers.utils.formatUnits(totalGasCost, 18)} ETH`);
        console.log(`Total tx cost: ${ethers.utils.formatUnits(totalTxCost, 18)} ETH`);
        console.log(`Wallet balance: ${ethers.utils.formatUnits(currentBalance, 18)} ETH`);
        
        // Verify we have enough balance (should always be fine with 1 wei per token)
        if (currentBalance.lt(totalTxCost)) {
            // Even with 1 wei per token, check if we have enough for gas
            if (currentBalance.lt(totalGasCost.add(totalSwapAmount))) {
                throw new Error(`Insufficient funds. Need ${ethers.utils.formatUnits(totalTxCost, 18)} ETH but have ${ethers.utils.formatUnits(currentBalance, 18)} ETH`);
            }
            
            console.log(`Warning: Very tight on funds but should work with 1 wei per token`);
        }
        
        // Get nonce for swap transaction
        const swapNonce = await connectedNewWallet.getTransactionCount("pending");
        
        // Execute the multi-swap transaction
        const swapTransaction = await multicallContract.executeMultiSwap(swapDetails, {
            value: totalSwapAmount,
            gasLimit: gasLimitWithBuffer,
            gasPrice: adjustedGasPrice,
            nonce: swapNonce
        });
        
        console.log(`Swap transaction sent: ${swapTransaction.hash}`);
        
        // Wait for the swap transaction to be mined
        const swapReceipt = await swapTransaction.wait();
        
        if (swapReceipt && swapReceipt.status === 1) {
            console.log(`✅ Multi-swap successful: ${swapReceipt.transactionHash}`);
        } else {
            console.log(`❌ Multi-swap failed: ${swapReceipt?.transactionHash || swapTransaction.hash}`);
        }
        
        // Step 4: Send remaining ETH back to main wallet
        console.log(`Transferring remaining ETH back to main wallet...`);
        
        // Add sleep function
        
        
        // Wait for balance to update
        await sleep(1000);
        
        // Send ETH back to main wallet
        await sendETHBack(newWallet.privateKey, mainSigner.address, ethers.utils.parseUnits(fundingAmount, 18));
        
        // Final balances
        const finalMainBalance = await provider.getBalance(mainSigner.address);
        const finalNewWalletBalance = await provider.getBalance(connectedNewWallet.address);
        
        console.log(`Final main wallet balance: ${ethers.utils.formatUnits(finalMainBalance, 18)} ETH`);
        console.log(`Final new wallet balance: ${ethers.utils.formatUnits(finalNewWalletBalance, 18)} ETH`);
        
        const result = {
            success: swapReceipt && swapReceipt.status === 1,
            newWalletAddress: newWallet.address,
            newWalletPrivateKey: newWallet.privateKey,
            swapTxHash: swapReceipt?.transactionHash || swapTransaction.hash,
            fundingTxHash: fundingTransaction.hash
        };
        
        console.log('Result:', result);
        console.log(`🔄 Cycle completed. Starting next cycle...`);
        
        // Add small delay before next cycle
        await sleep(2000);
        
        // Recursively call the function to continue the loop
        return createWalletAndMultiSmall(multiTokens);
        
    } catch (err) {
        console.error(`Error in createWalletAndMultiSmall:`, err.message);
        console.log(`🔄 Error occurred. Attempting to recover ETH...`);
        
        // Try to send ETH back to main wallet even if there was an error
        if (provider && mainSigner) {
            try {
                await sendETHBack(newWallet.privateKey, mainSigner.address);
                console.log(`✅ ETH successfully recovered after error`);
            } catch (recoveryError) {
                console.error(`❌ Failed to recover ETH after error:`, recoveryError.message);
            }
        }
        
        console.log(`🔄 Retrying...`);
        
        // Add sleep function
        // const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await sleep(5000);
        
        // Continue the loop even if there was an error
        return createWalletAndMultiSmall(multiTokens);
    }
}

async function createWalletAndMultiv3(tokenAddress) {
    
        var fundingAmount = "0.000005"
        var pk = config.fundingPrivateKey
        const mainSigner = new ethers.Wallet(pk, provider);

        console.log("Main wallet:", mainSigner.address, pk);

        console.log(`Funding: `, fundingAmount)
        
        // Step 1: Create a random new wallet
        const newWallet = ethers.Wallet.createRandom();
        const connectedNewWallet = newWallet.connect(provider);

        try {
        console.log(`Created new wallet: ${newWallet.address} ${newWallet.privateKey}`);

        savePrivateKey([
            newWallet.address,
            newWallet.privateKey
        ])
        
        // Step 2: Fund the new wallet from main signer
        const fundingAmountWei = ethers.utils.parseUnits(fundingAmount, 18);
        
        // Check main signer balance
        const mainBalance = await provider.getBalance(mainSigner.address);
        if (mainBalance.lt(fundingAmountWei)) {
            throw new Error(`Insufficient balance in main wallet. Need ${fundingAmount} ETH, have ${ethers.utils.formatUnits(mainBalance, 18)} ETH`);
        }
        
        console.log(`Funding new wallet with ${fundingAmount} ETH...`);
        
        // Prepare funding transaction
        const fundingTx = {
            to: newWallet.address,
            value: fundingAmountWei
        };
        
        // Get gas estimates with fallback
        let fundingGasLimit, fundingGasPrice;
        try {
            // Try to use getGasEstimates if it exists
            if (typeof getGasEstimates === 'function') {
                const gasEstimates = await getGasEstimates(fundingTx, { provider: mainSigner });
                fundingGasLimit = gasEstimates.gasLimit;
                fundingGasPrice = gasEstimates.gasPrice;
            } else {
                throw new Error("getGasEstimates not available");
            }
        } catch (gasError) {
            console.log("Using fallback gas estimation for funding");
            const baseGasPrice = await provider.getGasPrice();
            fundingGasPrice = baseGasPrice.mul(100).div(100); // 20% boost
            fundingGasLimit = 21000;
        }
        
        // Get nonce with fallback
        let fundingNonce;
        try {
            if (typeof getNonce === 'function') {
                fundingNonce = await getNonce(mainSigner, { provider });
            } else {
                fundingNonce = await mainSigner.getTransactionCount("pending");
            }
        } catch (nonceError) {
            fundingNonce = await mainSigner.getTransactionCount("pending");
        }
        
        console.log(`Funding gas price: ${ethers.utils.formatUnits(fundingGasPrice, 9)} Gwei`);
        
        // Send funding transaction
        const fundingTransaction = await mainSigner.sendTransaction({
            ...fundingTx,
            gasLimit: fundingGasLimit,
            gasPrice: fundingGasPrice,
            nonce: fundingNonce
        });
        
        console.log(`Funding transaction sent: ${fundingTransaction.hash}`);
        await fundingTransaction.wait();
        console.log(`✅ Funding successful`);
        
        // Verify funding
        let newWalletBalance = await provider.getBalance(connectedNewWallet.address);
        console.log(`New wallet balance: ${ethers.utils.formatUnits(newWalletBalance, 18)} ETH`);



        await new Promise(async (resolve, reject) => {
            let indexETH = 0;
            try{

            
            while(newWalletBalance.eq(0) && indexETH < 100){
                console.log('Waiting for ETH balance to update...');
                await sleep(1000);
                newWalletBalance = await provider.getBalance(connectedNewWallet.address);
                indexETH++;
            }
            
            if(newWalletBalance.gt(0)){
                console.log('Balance loaded, sending tokens back...');
                 resolve()
            }

        }catch(err){
            console.warn('Error', err?.message);
                await sendETHBack(connectedNewWallet.privateKey, mainSigner.address)
        }

        })
        
        // Step 3: Execute SwapV3 using the new wallet
        console.log(`Executing SwapV3 from new wallet...`);
        
        // SwapV3 parameters
        const contractAddress = '0xe9d7E6669C39350DD6664fd6fB66fCE4D871D374';
        const amount = ethers.utils.parseUnits("10", "wei");
        const weth = "0x4200000000000000000000000000000000000006";
        const token = tokenAddress;
        const fee = 10000;
        
        // Build exact transaction data for SwapV3
        const functionSelector = "0xd014efef";
        const encodedParams = ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint24", "address"],
            [weth, token, fee, connectedNewWallet.address]
        );
        
        const txData = functionSelector + encodedParams.slice(2);
        
        // Get current gas price
        const currentGasPrice = await provider.getGasPrice();
        console.log(`Current gas price: ${ethers.utils.formatUnits(currentGasPrice, 9)} Gwei`);
        
        // Get nonce for swap transaction
        const swapNonce = await connectedNewWallet.getTransactionCount("pending");
        
        // Prepare swap transaction
        const swapTx = {
            to: contractAddress,
            data: txData,
            value: amount,
            gasLimit: ethers.BigNumber.from("200000"),
            gasPrice: currentGasPrice.mul(100).div(100), // Use current gas price
            nonce: swapNonce
        };
        
        console.log(`Swap amount: ${amount.toString()} wei (${ethers.utils.formatUnits(amount, 18)} ETH)`);
        console.log(`Contract address: ${contractAddress}`);
        console.log(`WETH: ${weth}`);
        console.log(`Token: ${token}`);
        console.log(`Fee: ${fee}`);
        console.log(`Recipient: ${connectedNewWallet.address}`);
        
        // Execute the swap transaction
        let swapTransaction;
        let swapSuccess = false;
        
        try {
            swapTransaction = await connectedNewWallet.sendTransaction(swapTx);
            console.log(`Swap transaction sent: ${swapTransaction.hash}`);
            
            // Wait for the swap transaction to be mined
            const swapReceipt = await swapTransaction.wait();
            
            if (swapReceipt && swapReceipt.status === 1) {
                console.log(`✅ SwapV3 successful: ${swapReceipt.transactionHash}`);
                swapSuccess = true;
            } else {
                console.log(`❌ SwapV3 failed: ${swapReceipt?.transactionHash || swapTransaction.hash}`);
            }
        } catch (swapError) {
            console.log(`❌ SwapV3 error: ${swapError.message.substring(0, 50)}`);
        }
        
        // Step 4: Send remaining ETH back to main wallet
        console.log(`Transferring remaining ETH back to main wallet...`);
        
        await sleep(1000);
        
        // Send ETH back to main wallet
        await sendETHBack(newWallet.privateKey, mainSigner.address, ethers.utils.parseUnits(fundingAmount, 18));
        
        // Final balances
        const finalMainBalance = await provider.getBalance(mainSigner.address);
        const finalNewWalletBalance = await provider.getBalance(connectedNewWallet.address);
        
        console.log(`Final main wallet balance: ${ethers.utils.formatUnits(finalMainBalance, 18)} ETH`);
        console.log(`Final new wallet balance: ${ethers.utils.formatUnits(finalNewWalletBalance, 18)} ETH`);
        
        const result = {
            success: swapSuccess,
            newWalletAddress: newWallet.address,
            newWalletPrivateKey: newWallet.privateKey,
            swapTxHash: swapTransaction?.hash || '',
            fundingTxHash: fundingTransaction.hash
        };
        
        console.log('Result:', result);
        console.log(`🔄 Cycle completed. Starting next cycle in 3 seconds...`);
        
        // Add small delay before next cycle
        await sleep(3000);
        
        // Recursively call the function to continue the loop
        return createWalletAndMultiv3(tokenAddress);
        
    } catch (err) {
         console.error(`Error in createWalletAndMultiSmall:`, err.message);
        console.log(`🔄 Error occurred. Attempting to recover ETH...`);
        
        // Try to send ETH back to main wallet even if there was an error
        if (provider && mainSigner) {
            try {
                await sendETHBack(newWallet.privateKey, mainSigner.address);
                console.log(`✅ ETH successfully recovered after error`);
            } catch (recoveryError) {
                console.error(`❌ Failed to recover ETH after error:`, recoveryError.message);
            }
        }
        
        console.log(`🔄 Retrying...`);
        
        // Add sleep function
        // const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await sleep(5000);
        
        // Continue the loop even if there was an error
        return createWalletAndMultiv3(tokenAddress);
    }
}


async function sendETHBack(privateKey, receiver, minValue = ethers.utils.parseUnits("1", 18)) {
    // const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
        const connectedNewWallet = new ethers.Wallet(privateKey, provider);
        
        let balance = await provider.getBalance(connectedNewWallet.address);
        console.log(`Balance ETH: ${ethers.utils.formatUnits(balance, 18)}`);

        await new Promise(async (resolve, reject) => {
            let indexETH = 0;
            
            while (indexETH < 10) {
                balance = await provider.getBalance(connectedNewWallet.address);
                
                // Check if balance meets our criteria
                if (balance.gt(0) && balance.lt(minValue)) {
                    console.log(`✅ Balance updated: ${ethers.utils.formatUnits(balance, 18)} ETH`);
                    resolve();
                    return;
                }
                
                console.log(`Waiting for ETH balance to update... (${ethers.utils.formatUnits(balance, 18)} ETH) - attempt ${indexETH + 1}/10`);
                await sleep(1000);
                indexETH++;
            }
            
            // If we exit the loop, check one final time
            balance = await provider.getBalance(connectedNewWallet.address);
            if (balance.gt(0) && balance.lt(minValue)) {
                console.log(`✅ Balance finally updated: ${ethers.utils.formatUnits(balance, 18)} ETH`);
                resolve();
            } else {
                console.log(`❌ Timeout waiting for balance. Current: ${ethers.utils.formatUnits(balance, 18)} ETH, Required: ${ethers.utils.formatUnits(minValue, 18)} ETH`);
                reject(new Error(`Balance did not reach minimum value after 10 attempts`));
            }
        });
        
        // Calculate gas for return transaction
        const returnGasPrice = await provider.getGasPrice();
        const baseGasLimit = 30000; // Standard ETH transfer
        
        // Add 20% buffer to gas limit
        const returnGasLimit = ethers.BigNumber.from(baseGasLimit).mul(200).div(100);
        const gasCost = returnGasPrice.mul(returnGasLimit);
        
        // Add extra buffer for safety (additional 10% of gas cost)
        const extraBuffer = gasCost.mul(10).div(100);
        const totalGasCost = gasCost.add(extraBuffer);
        
        // Calculate amount to send (balance - total gas cost)
        const valueToSend = balance.sub(totalGasCost);
        
        // Check if we have enough balance after gas
        if (valueToSend.lte(0)) {
            console.log(`Insufficient balance after gas. Balance: ${ethers.utils.formatUnits(balance, 18)} ETH, Gas needed: ${ethers.utils.formatUnits(totalGasCost, 18)} ETH`);
            return;
        }
        
        // Double check that we have enough for the actual transaction
        const actualTxCost = gasCost.add(valueToSend);
        if (balance.lt(actualTxCost)) {
            console.log(`Final check failed. Balance: ${ethers.utils.formatUnits(balance, 18)} ETH, TX cost: ${ethers.utils.formatUnits(actualTxCost, 18)} ETH`);
            return;
        }
        
        console.log(`Total balance: ${ethers.utils.formatUnits(balance, 18)} ETH`);
        console.log(`Gas cost: ${ethers.utils.formatUnits(gasCost, 18)} ETH`);
        console.log(`Extra buffer: ${ethers.utils.formatUnits(extraBuffer, 18)} ETH`);
        console.log(`Total gas cost: ${ethers.utils.formatUnits(totalGasCost, 18)} ETH`);
        console.log(`Sending back: ${ethers.utils.formatUnits(valueToSend, 18)} ETH`);
        
        // Get nonce for return transaction
        const returnNonce = await connectedNewWallet.getTransactionCount("pending");

        
        // Send ETH back
        const returnTransaction = await connectedNewWallet.sendTransaction({
            to: receiver,
            value: valueToSend,
            gasLimit: returnGasLimit,
            gasPrice: returnGasPrice,
            nonce: returnNonce
        });
        
        await returnTransaction.wait();
        console.log(`✅ ETH sent back: ${returnTransaction.hash}`);
        
    } catch (error) {
        console.error("Error sending ETH back:", error.message);
        throw error;
    }
}

// Full automation functions
async function fullAutomation(walletCount = config.defaultWalletCount, chunkSize = config.defaultChunkSize, batchSize = config.defaultBatchSize) {
    log(`🚀 Starting full automation (single token swaps)`);
    log(`Configuration: ${walletCount} wallets, ${chunkSize} airdrop chunks, ${batchSize} swap batches`);
    
    try {
        // Step 1: Ensure target wallet count
        log(`📝 Step 1: Creating/checking wallets...`);
        await createWalletsToTarget(walletCount);
        await sleep(5000);
        
        // Step 2: Send airdrops
        log(`💰 Step 2: Sending airdrops...`);
        await airdropBatch(chunkSize);
        await sleep(10000);
        
        // Step 3: Execute swaps
        log(`🔄 Step 3: Executing single token swaps...`);
        await swapBatch(batchSize);
        
        log(`🎉 Full automation completed successfully!`);
        
    } catch (err) {
        errorLog(`Full automation failed: ${err.message}`);
        throw err;
    }
}

async function fullMultiAutomation(walletCount = config.defaultWalletCount, chunkSize = config.defaultChunkSize, batchSize = config.defaultBatchSize, tokens = null) {
    log(`🚀 Starting full multi-token automation`);
    log(`Configuration: ${walletCount} wallets, ${chunkSize} airdrop chunks, ${batchSize} swap batches`);
    
    const tokensToUse = tokens || defaultTokens["V2"];
    log(`Using tokens: ${tokensToUse.join(', ')}`);
    
    try {
        // Step 1: Ensure target wallet count
        log(`📝 Step 1: Creating/checking wallets...`);
        await createWalletsToTarget(walletCount);
        await sleep(5000);
        
        // Step 2: Send airdrops
        log(`💰 Step 2: Sending airdrops...`);
        await airdropBatch(chunkSize);
        await sleep(10000);
        
        // Step 3: Execute multi-token swaps
        log(`🔄 Step 3: Executing multi-token swaps...`);
        await multiSwapBatch(batchSize, tokensToUse);
        
        log(`🎉 Full multi-token automation completed successfully!`);
        
    } catch (err) {
        errorLog(`Full multi-token automation failed: ${err.message}`);
        throw err;
    }
}

async function fullV3Automation(walletCount = config.defaultWalletCount, chunkSize = config.defaultChunkSize, batchSize = config.defaultBatchSize) {
    log(`🚀 Starting full V3 automation`);
    log(`Configuration: ${walletCount} wallets, ${chunkSize} airdrop chunks, ${batchSize} swap batches`);
    
    try {
        // Step 1: Ensure target wallet count
        log(`📝 Step 1: Creating/checking wallets...`);
        await createWalletsToTarget(walletCount);
        await sleep(5000);
        
        // Step 2: Send airdrops
        log(`💰 Step 2: Sending airdrops...`);
        await airdropBatch(chunkSize);
        await sleep(10000);
        
        // Step 3: Execute V3 swaps
        log(`🔄 Step 3: Executing V3 swaps...`);
        await v3SwapBatch(batchSize);
        
        log(`🎉 Full V3 automation completed successfully!`);
        
    } catch (err) {
        errorLog(`Full V3 automation failed: ${err.message}`);
        throw err;
    }
}

// Help function
function showHelp() {
    console.log(`
Wallet Manager - Comprehensive Automation Tool

WALLET MANAGEMENT:
  create [count]                     - Create new wallets (default: ${config.defaultWalletCount})
  target [total_count]               - Create wallets to reach target count
  check                              - Check wallet statistics and balances


BATCH OPERATIONS:
  airdrop-batch [chunk_size] [total_eth]     - Send airdrops in batches (default: ${config.defaultChunkSize})
  swap-batch [batch_size]  [tokenAddress]                   - Execute single token swaps (default: ${config.defaultBatchSize})
  multiswap-batch [batch_size] [tokens]      - Execute multi-token swaps
  swapv3-batch [batch_size] [tokenAddress]                 - Execute V3 swaps

INDIVIDUAL OPERATIONS:
  airdrop [start] [end] [total_eth]          - Send airdrops to wallet range
  swap [start] [end] [tokenAddress]                       - Single token swap for wallet range
  multiswap [start] [end] [tokens]           - Multi-token swap for wallet range
  swapv3 [start] [end]                       - V3 swap for wallet range

TOKEN FORMAT:
  Comma-separated addresses: token1,token2,token3
  Example: 0xABC...,0xDEF...,0x123...

DEFAULT TOKENS V2:
  KIKI:   ${defaultTokens["V2"][0]}
  TURBO:  ${defaultTokens["V2"][1]}
  LORDY:  ${defaultTokens["V2"][2]}
  WORKIE: ${defaultTokens["V2"][3]}

EXAMPLES:
  node wallet_manager.js create 2000
  node wallet_manager.js target 5000
  node wallet_manager.js airdrop-batch 200 5.0              # Distribute 5 ETH among all wallets, 200 per chunk
  node wallet_manager.js airdrop 0 100 0.5                  # Distribute 0.5 ETH among wallets 0-100
  node wallet_manager.js airdrop-batch 500                  # Use default 0.0015 ETH per wallet
  node wallet_manager.js multiswap-batch 25 "${defaultTokens["V2"].slice(0, 2).join(',')}"

CONFIGURATION:
  All default values can be set in .env file:
  DEFAULT_WALLET_COUNT=${config.defaultWalletCount}
  DEFAULT_CHUNK_SIZE=${config.defaultChunkSize}
  DEFAULT_BATCH_SIZE=${config.defaultBatchSize}
`);
}

// Main execution function
async function main() {
    const command = process.argv[2];
    const args = process.argv.slice(3);
    
    if (!command || command === 'help' || command === '--help' || command === '-h') {
        showHelp();
        return;
    }
    
    try {
        
        switch (command) {
            // Wallet management
            case 'create':
                await createWallets(parseInt(args[0]) || config.defaultWalletCount);
                break;
                
            case 'target':
                await createWalletsToTarget(parseInt(args[0]) || config.defaultWalletCount);
                break;
                
            case 'check':
                await checkWallets();
                break;
                
            // Batch operations
            case 'airdrop-batch':
                var totalEthForBatch = args[1] ? parseFloat(args[1]) : null;
                await airdropBatch(parseInt(args[0]) || config.defaultChunkSize, totalEthForBatch);
                break;
                
            case 'swap-batch':
                var tokenAddress = args[1] || random(defaultTokens['V2']);
                await swapBatch(parseInt(args[0]) || config.defaultBatchSize, tokenAddress);
                break;
                
            case 'multiswap-batch':
                var tokens = args[1] ? args[1].split(',') : defaultTokens['V2'];
                await multiSwapBatch(parseInt(args[0]) || config.defaultBatchSize, tokens);
                break;
                
            case 'swapv3-batch':
                var walletsV3 = loadWallets();
                var tokenAddress = args[1] || random(defaultTokens['V3'])
                var startsAt = Number(args[2]) || 0
                var endsAt = Number(args[3]) || walletsV3.length
                await v3SwapBatch(parseInt(args[0]) || config.defaultBatchSize, tokenAddress, startsAt, endsAt);
                break;
                
            // Individual operations
            case 'airdrop':
                const wallets = loadWallets();
                if (wallets.length === 0) throw new Error('No wallets found');
                var start = parseInt(args[0]) || 0;
                var end = parseInt(args[1]) || wallets.length;
                const totalEthForRange = args[2] ? parseFloat(args[2]) : null;
                await sendAirdropWallets(start, end, wallets, totalEthForRange);
                break;
                
            case 'swap':
                const walletsForSwap = loadWallets();
                if (walletsForSwap.length === 0) throw new Error('No wallets found');
                var start = parseInt(args[0]) || 0;
                var end = parseInt(args[1]) || walletsForSwap.length;
                var tokenAddress = args[2] || random(defaultTokens["V2"]);
                
                let successCount = 0;
                let failCount = 0;
                
                for (let i = start; i < Math.min(end, walletsForSwap.length); i++) {
                    try {
                        executeSwap(i, walletsForSwap, tokenAddress);
                        successCount++;
                    } catch (err) {
                        failCount++;
                    }
                    await sleep(50);
                }
                
                log(`Swap range completed: ${successCount} successful, ${failCount} failed`);
                break;
                
            case 'multiswap':
                const walletsForMulti = loadWallets();
                if (walletsForMulti.length === 0) throw new Error('No wallets found');
                const multiTokens = args[2] ? args[2].split(',') : defaultTokens["V2"];
                const multiStart = parseInt(args[0]) || 0;
                const multiEnd = parseInt(args[1]) || walletsForMulti.length;


                
                let multiSuccessCount = 0;
                let multiFailCount = 0;
                
                for (let i = multiStart; i < Math.min(multiEnd, walletsForMulti.length); i++) {
                    try {
                        const result = executeMultiSwap(i, walletsForMulti, multiTokens);
                        if (result && result.success !== false) {
                            multiSuccessCount++;
                        } else {
                            multiFailCount++;
                        }
                    } catch (err) {
                        multiFailCount++;
                    }
                    await sleep(100);
                }
                
                log(`Multi-swap range completed: ${multiSuccessCount} successful, ${multiFailCount} failed`);
                break;

                case 'create-and-swap':
                    var tokensAddr = args[0] ? args[0].split(',') : defaultTokens["V2"];

      
                        try {
                            createWalletAndMultiSmall(tokensAddr);
                        } catch (err) {
                            console.log(err)
                        }
                    break;
                case 'create-and-swapv3':
                    var tokensAddr = args[0] || random(defaultTokens["V3"]);

    
                        try {
                            createWalletAndMultiv3(tokensAddr);
                        } catch (err) {
                            console.log(err)
                        }
                    break;

            case 'recoverETH':
                var mainWallet = new ethers.Wallet(config.fundingPrivateKey)
                var pk = args[0];
                var receiver = args[1] || mainWallet.address

    
                    try {
                        sendETHBack(pk, receiver);
                    } catch (err) {
                        console.log(err)
                    }
                break;
                
            case 'swapv3':
                const walletsForV3 = loadWallets();
                if (walletsForV3.length === 0) throw new Error('No wallets found');
                const v3Start = parseInt(args[0]) || 0;
                const v3End = parseInt(args[1]) || walletsForV3.length;
                const v3Token = args[2] || random(defaultTokens["V3"]);

                let v3SuccessCount = 0;
                let v3FailCount = 0;
                
                for (let i = v3Start; i < Math.min(v3End, walletsForV3.length); i++) {
                    try {
                        executeV3Swap(i, walletsForV3, v3Token);
                        v3SuccessCount++;
                    } catch (err) {
                        v3FailCount++;
                    }
                    await sleep(75);
                }
                
                log(`V3 swap range completed: ${v3SuccessCount} successful, ${v3FailCount} failed`);
                break;
                
            default:
                errorLog(`Unknown command: ${command}`);
                showHelp();
                process.exit(1);
        }
    } catch (err) {
        errorLog(`Command failed: ${err.message}`);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main().catch(err => {
        errorLog(`Fatal error: ${err.message}`);
        process.exit(1);
    });
}

module.exports = {
    createWallets,
    createWalletsToTarget,
    checkWallets,
    airdropBatch,
    swapBatch,
    multiSwapBatch,
    v3SwapBatch,
    fullAutomation,
    fullMultiAutomation,
    fullV3Automation,
    loadWallets,
    saveWallets
};