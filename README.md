# KEEP-DEPOSIT

<p align="center">
	<a href="https://keep-deposit.com" rel="keep-deposit.com">
  	<img src="https://i.ibb.co/0GpR26h/github.png "keep-deposit.com">
	</a>
</p>

									
### PLANS
I will wait for any feedback to improve this potential platform 
The next steps in my opinion are:
1. Publish mobile app (80% done)
2. New tab for any tbtc transaction
3. Integration with metamask with "profile page" for listing maximum possible operations in your wallets
4. More open API for improving other contribution development  
5. Something else that you email me or as an issue on this repo...
___


### INFO
#### Web, Mobile APP 
* Realtime deposits view
* Fast and smooth view of deposits cards
* Copy all needed hashes for next searching
* Check transaction at etherscan.io
* Search for any of hashes that belongs to deposit
___


#### Backend API
* HTTP API
* Get storaged deposits
* Get in query deposit or transaction you want to know about
* Configure your own web3 provider
* Configure your own electrum server
* Attach https in 2 lines of config
* Get all known by backend info about token
___


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
Provide server information for connecting to one of electrumX servers (otherwise you cannot get btc Address and qty of confirmations)
```sh
ELECTRUM_SERVER= ip.address.com
ELECTRUM_PORT=5002
ELECTRUM_PROTOCOL=ssl|tcp
```

##### ssl
if you want to provide ssl into back and web app - add these lines into .env
``` sh
PRIVATE_KEY_SSL = ${absolute_path_to_key}
CERT_SSL = ${absolute_path_to_cert}
```
##### timings
if you want to adjust timings and qty refresh data add these ones. Time in milliseconds
```sh
MS_TO_GRAB_ALL_DATA = 600000
MS_TO_GRAB_LAST_DEPOSITS = 40000
QTY_TO_GRAB_LAST_DEPOSITS = 20
```
___


### START
``` sh
$ node --experimental-json-modules index.js
```
___


### TESTING
#### WEB APP
Open browser
default port for web app is 90
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
optional query argument "qty" will limit last deposits
```sh
${yours_server_address}:9090/API/depositsInfo?qty=10
```

Get all known by backend info about token
```sh
${yours_server_address}:9090/API/tbtcGeneralInfo
```
___


### DEVELOPING

```
index.js            // Start ethGetter, express backend, flutter web app
ethGetter.js        // Main module to get information from web3 and tbtc
server.js           // Simple express app for backend API
./www/bin.js        // Listens 90, 443 for flutter web app
flutterServer.js    // Provides express to path of flutter web app
/public-flutter     // Build of web app in flutter


```