# ETH_Contract_status

### INSTALLATION
```sh
$ sudo apt install build-essential
$ npm install
```

make if not exists .env file in root of project
create constant with your address to mainnet web3 provider
``` sh
WEB3_PROVIDER=https://mainnet.infura.io/v3/4d4d0f30284345bd9867a919f23c2723
```
if you want to privide ssl into back and web app - add these lines into .env
``` sh
PRIVATE_KEY_SSL = ${absolute_path_to_key}
CERT_SSL = ${absolute_path_to_cert}
```
if you want to adjust timings and qty refresh data add these ones. Time in millisecons
```sh
MS_TO_GRAB_ALL_DATA = 600000
MS_TO_GRAB_LAST_DEPOSITS = 40000
QTY_TO_GRAB_LAST_DEPOSITS = 20
```

### Start
``` sh
$ node --experimental-json-modules index.js
```

### DEVELOPERS

server.js - simple express app
index.js - start both ethGetter and express
ethGetter.js - main module to get information from web3 and tbtc