# ETH_Contract_status

## INSTALLATION
```sh
$ sudo apt install build-essential
$ npm install
```

make if not exists .env file in root of project
create constant with your address to mainnet web3 provider
WEB3_PROVIDER=https://mainnet.infura.io/v3/4d4d0f30284345bd9867a919f23c2723

Start script
``` sh
$ node --experimental-json-modules index.js
```

## DEVELOPERS

server.js - simple express app
index.js - start both ethGetter and express
ethGetter.js - main module to get information from web3 and tbtc