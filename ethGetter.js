import Web3 from 'web3';
import TBTC  from '@keep-network/tbtc.js/src/TBTC.js';
import factoryAbi from '@keep-network/tbtc/artifacts/DepositFactory.json'
import EthereumHelpers from '@keep-network/tbtc.js/src/EthereumHelpers.js'
import sqlite3 from 'sqlite3'

let tbtc
let web3
let db
let tBTCfactoryContract ={}

function findThisState(configStates, nowStateInt){
    for(let state in configStates){
        if(parseInt(configStates[state]) === parseInt(nowStateInt))
            return state
    }
    return {error: true, msg:'state not found'}
}

async function getAllEventsInTBTCtoken(shiftGetting, tBTCcontract, txHashesInDB){
    //getting all DepositCloneCreated events (deposits) from factoryContract
    let events
    try{
    events = await tBTCcontract.getPastEvents('DepositCloneCreated', {
        fromBlock: 0,
        toBlock: 'latest'
    })}catch(e){return}

    //calculate shift for only needed qty deposits
    let startSearching = 0
    if(shiftGetting !== 0)
        startSearching= events.length - shiftGetting

    for(let i=startSearching;i<events.length;i++){
        if(typeof txHashesInDB[events[i].transactionHash] === 'undefined' || typeof txHashesInDB[events[i].transactionHash].depositAddress === 'undefined')
            await getDeposit(events[i].transactionHash, null)
        else
            await getDeposit(null, txHashesInDB[events[i].transactionHash].depositAddress)
    }
}


async function getDeposit(txHash=null, depositAddress = null){
    try{
        //prepare output object
        let thisDeposit = {}

        if(txHash !== null)
            thisDeposit.txHash = txHash
        else if(depositAddress !== null)
            thisDeposit.depositAddress = depositAddress
        else 
            return false

        //This is only for never seened depositAddress
        if(depositAddress === null){
            //here needed events
            var transactionInfo = await web3.eth.getTransactionReceipt(thisDeposit.txHash)

            //getting deposit's amount
            var transactionsSatoshis = await (web3.eth.getTransaction(thisDeposit.txHash))
            thisDeposit.BTCamount = parseFloat(web3.eth.abi.decodeParameter('uint64', transactionsSatoshis.input.slice(-64)))*0.00000001 


            // Mismatch web3 and EthereumHelpers versions
            if(typeof transactionInfo.events == 'undefined'){
                transactionInfo.events = transactionInfo.logs
                for(let eventTX =0; eventTX < transactionInfo.events.length; eventTX++){
                    if(typeof transactionInfo.events[eventTX].raw =='undefined')
                        transactionInfo.events[eventTX].raw={
                            topics: transactionInfo.events[eventTX].topics,
                            data: transactionInfo.events[eventTX].data,
                        }
                }
            }
            //End mismatch

            //from events of transaction getting deposit address by factoryContract abi
            thisDeposit.depositAddress = (await EthereumHelpers.readEventFromTransaction(web3,transactionInfo,tBTCfactoryContract,'DepositCloneCreated'))[0]
        }
        //try to get deposit instance
        let deposit
        try{
            deposit = await tbtc.Deposit.withAddress(thisDeposit.depositAddress)
        }catch(e){
            console.log(e)
            return
        }

        //getting state of contract instance
        thisDeposit.state = findThisState(deposit.factory.State, await deposit.getCurrentState())

        //Only for new deposits
        if(depositAddress === null){
            thisDeposit.keepAddress = deposit.keepContract._address

            //unapproved function to find x/6 confirmations passed
            try{
                thisDeposit.nowConfirmations = await deposit.fundingConfirmations
            }catch(e){

            }

            //ts creating deposit at block of transaction
            thisDeposit.timestamp = (await web3.eth.getBlock(transactionInfo.blockNumber)).timestamp

            //needed confirmations. Mainly 6
            thisDeposit.requiredConfirmations = await deposit.requiredConfirmations
        }
        //prepare deposit values to store in sqlite
        let valuesToInsert = Object.values(thisDeposit).map((element)=>{
                return `"${element}"`
        }).toString()
    
        //insert or update status of deposit
        db.run(`INSERT INTO deposits ("id",${Object.keys(thisDeposit)}) values ((SELECT IFNULL(MAX(id), 0) + 1 FROM deposits), ${valuesToInsert})
            ON CONFLICT(depositAddress) DO UPDATE SET state="${thisDeposit.state}" where depositAddress="${thisDeposit.depositAddress}"`)
        return thisDeposit
    }catch(e){console.log(e)}
}


async function getEvents(shiftSearching) {
    try{
        db.all(`SELECT depositAddress,txHash FROM deposits `, async (err,rows)=>{
            let txHashes = {}
            for(let i=0; i< rows.length;i++){
                txHashes[rows[i].txHash] = {depositAddress:rows[i].depositAddress}
            }
            await getAllEventsInTBTCtoken(shiftSearching, tBTCfactoryContract, txHashes)
        })
        
    }catch(e){console.log(e)}
}

async function connect(){
    // connect or create local sqlite db
    db = new sqlite3.Database('./database.db', (err) => {
        if (err) {
        console.error(err.message);
        }
        console.log('Connected to the chinook database.');
    });

    db.serialize(function() {
        db.run(`CREATE TABLE IF NOT EXISTS deposits (
            id INTEGER,
            depositAddress TEXT PRIMARY KEY,
            txHash TEXT,
            keepAddress TEXT,
            requiredConfirmations TEXT,
            state TEXT,
            nowConfirmations TEXT,
            timestamp TEXT,
            BTCamount TEXT                                    
            )`);
    })


    //establishing connection to mainnet eth with web3 
    web3 = await new Web3(process.env.WEB3_PROVIDER)

    //now going to tbtc mainnet
    tbtc = await TBTC.withConfig({
        web3: web3,
        bitcoinNetwork: "main",
        electrum: {
            "testnet": {
                "server": "electrumx-server.test.tbtc.network",
                "port": 50002,
                "protocol": "ssl"
            },
            "testnetWS": {
                "server": "electrumx-server.test.tbtc.network",
                "port": 50003,
                "protocol": "ws"
            }
        },
    })
    

    //factory of contracts address
    const tBTCfactoryAddress = '0x87EFFeF56C7fF13E2463b5d4dCE81bE2340FAf8b'
    //creating tbtc factory contract object
    tBTCfactoryContract = new web3.eth.Contract(factoryAbi.abi, web3.utils.toChecksumAddress(tBTCfactoryAddress));

}

async function main(){
    /*
    At first startup - goes through all events - only then - starting 2 timers
    1st - every ?60 minutes? - for actualazing all events
    2s  - every 40 seconds - for actualising last ?20 events/
    */

    //connecting to db, web3, tbtc
    await connect()
    // Read DB and find already exists deposits if < 10 - we think it firstInitialize and grab all data
    // If > 10 - then going to last 20 events only 
    db.all(`SELECT COUNT(id) from deposits`, (err,row) =>{
        let count = row[0]['COUNT(id)']
        if(count < 10){
            getEvents(0).then(()=>{
                fewLastEvents()
                setInterval( ()=>{
                    getEvents(0)
                    .then(() => {
                        console.log("All done!")
                    
                    })
                    .catch(error => {
                        console.log(error)
                    })
                }, 3600000)
            })
        }else{
            fewLastEvents()
            setInterval( ()=>{
                getEvents(0)
                .then(() => {
                    console.log("All done!")
                
                })
                .catch(error => {
                    console.log(error)
                })
            }, 3600000)
        }
    });
    
    
    //every ~30seconds grab last 20 deposits
    function fewLastEvents(){
        getEvents(20).then(() => {
            console.log("Last 20 done!")

            setTimeout(fewLastEvents,30000)
        })
    }
    
}

function startAll(){
    
    try{
        main()
    }catch(e){
        console.log(e)
        startAll()
    }
}


export default {
    startAll,
    getDeposit
}