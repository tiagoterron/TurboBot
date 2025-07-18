module.exports = {
  apps: [
    {
      name: 'TurboBot-Wallet1',
      script: 'script.js',
      args: 'create-and-swapv3 0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9',
      env: {
        PK_MAIN: 'your_first_private_key_here',
        RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY'
      },
      autorestart: true,
      max_restarts: 10
    },
    {
      name: 'TurboBot-Wallet2',
      script: 'script.js',
      args: 'create-and-swapv3 0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9',
      env: {
        PK_MAIN: 'your_second_private_key_here',
        RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY'
      },
      autorestart: true,
      max_restarts: 10
    },
    {
      name: 'TurboBot-Wallet3',
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