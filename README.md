# KEEP-DEPOSIT

[![keep-deposit.com](https://i.ibb.co/KrRX2wv/keep-deposit.png "keep-deposit.com")](https://keep-deposit.com "keep-deposit.com")

### INSTALLATION
```sh
$ sudo apt install build-essential
$ npm install
```

make if not exists .env file in root of project
##### web3
create constant with your address to mainnet web3 provider
``` sh
WEB3_PROVIDER=https://mainnet.infura.io/v3/4d4d0f30284345bd9867a919f23c2723
```
##### electrumx
Provide server information for connecting to one of electrumX servers (besides tou cannot get btcAddress and qty of confirmations)
```sh
ELECTRUM_SERVER= ip.address.com
ELECTRUM_PORT=5002
ELECTRUM_PROTOCOL=ssl|tcp
```

##### ssl
if you want to privide ssl into back and web app - add these lines into .env
``` sh
PRIVATE_KEY_SSL = ${absolute_path_to_key}
CERT_SSL = ${absolute_path_to_cert}
```
##### timings
if you want to adjust timings and qty refresh data add these ones. Time in millisecons
```sh
MS_TO_GRAB_ALL_DATA = 600000
MS_TO_GRAB_LAST_DEPOSITS = 40000
QTY_TO_GRAB_LAST_DEPOSITS = 20
```

### START
``` sh
$ node --experimental-json-modules index.js
```

### TESTING
#### WEB APP
Open browser
default port for web app is 80
You will see cards of deposits this full info about

#### BACKEND API
For searching about known deposit address (will return only current status and tansaction hash)
```sh
${yours_server_address}:9090/API/depositDetails?depositAddress=0xdee603DeE3B638472D7AF560Ea5e076F2ba6583F
```
For searching only by transacraction hash (will return full known info about these deposit)
```sh
${yours_server_address}:9090/API/depositDetails?txn=0x5901eb10fc96eac584a14036207bd7aa1fe5f1ce426c542eaee942c0105211be
```
For list of prepared deposits information (time of delay about these list can be configured in [.env](#timings)
```sh
${yours_server_address}:9090/API/depositsInfo
```
### DEVELOPING

```
index.js            // Start ethGetter, express backend, flutter web app
ethGetter.js        // Main module to get information from web3 and tbtc
server.js           // Simple express app for backend API
./www/bin.js        // Listen 80, 443 for flutter web app
flutterServer.js    // Provides express to path of flutter web app
/public-flutter     // Builded web app in flutter
```