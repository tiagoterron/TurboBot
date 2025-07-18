module.exports = {
  apps: [{
    name: 'TurboBot',
    script: 'script.js',
    args: 'create-and-swapv3 0x2Dc1C8BE620b95cBA25D78774F716F05B159C8B9',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};