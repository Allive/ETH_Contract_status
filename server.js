import express from 'express'
import ethGetter from './ethGetter.js'
import fs from 'fs'
import http from 'http'
import https from 'https'
try{
    var privateKey  = fs.readFileSync('/etc/letsencrypt/live/keep-deposit.com/privkey.pem', 'utf8');
    var certificate = fs.readFileSync('/etc/letsencrypt/live/keep-deposit.com/cert.pem', 'utf8');
}catch(e){console.log(e)}
var credentials = {key: privateKey, cert: certificate};
const app = express();
import sqlite3 from 'sqlite3'


const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

function startServer() {
   var httpServer = http.createServer(app);
   var httpsServer = https.createServer(credentials, app);
   httpServer.listen(9090);
   httpsServer.listen(9443);
}



function convertToFront(array){
    for(let i=0; i<array.length; i++){
        array[i].BTCamount = parseFloat(array[i].BTCamount)
        array[i].requiredConfirmations = parseFloat(array[i].requiredConfirmations)
        array[i].nowConfirmations = parseFloat(array[i].nowConfirmations)
        array[i].timestamp = parseInt(array[i].timestamp)
    }
    return {deposits:array}
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

try{
    app.get('/API/depositDetails', async (req,res)=>{
        if(typeof req.query.txn === 'undefined' && typeof req.query.depositAddress === 'undefined' )
            res.send(400)
        try{
            if(typeof req.query.depositAddress === 'undefined')
                res.send(await ethGetter.getDeposit(req.query.txn, null))
            else
                res.send(await ethGetter.getDeposit(null, req.query.depositAddress))
        }catch(e){
            res.send(500)
        }
    })
}catch(e){console.log(e)}

try{
    app.get('/API/depositsInfo',  (req,res) => {

        if(typeof req.query.qty =='undefined'){
            db.all(`SELECT * FROM deposits `,(err,rows)=>{
                res.send(convertToFront(rows))
            })
        }else{
            let limit = parseInt(req.query.qty)
            db.all(`SELECT * FROM deposits ORDER BY id DESC LIMIT ${limit}`,(err,rows)=>{
                res.send(convertToFront(rows))
            })
        }
    })
}catch(e){
    console.log(e)
}

export default {
    startServer
}