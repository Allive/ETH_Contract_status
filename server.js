import express from 'express'
import ethGetter from './ethGetter.js'
import fs from 'fs'
import http from 'http'
import https from 'https'
import dotenv from 'dotenv'
dotenv.config()

try{
    var privateKey  = fs.readFileSync(process.env.PRIVATE_KEY_SSL, 'utf8');
    var certificate = fs.readFileSync(process.env.CERT_SSL, 'utf8');
}catch(e){}
var credentials = {key: privateKey, cert: certificate};
const app = express();
import sqlite3 from 'sqlite3'


const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the deposits database.');
  });

  function startServer() {
    //if(typeof credentials.key || typeof credentials.cer =='undefined'){
        var httpServer = http.createServer(app);
        httpServer.listen(9090);
    //}else{
        var httpsServer = https.createServer(credentials, app);
        httpsServer.listen(9443);
   // }
 }



function convertToFront(array){
    for(let i=0; i<array.length; i++){
        array[i].BTCamount = parseFloat(array[i].BTCamount)
        array[i].requiredConfirmations = parseFloat(array[i].requiredConfirmations)
        array[i].nowConfirmations = parseFloat(array[i].nowConfirmations)
        array[i].timestamp = parseInt(array[i].timestamp)
    }
    return array
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

        //First coolect additinal info
        db.all(`SELECT * FROM allInfo `,(err,rows)=>{
            let answerObj={}
            for(let i=0; i<rows.length; i++){
                answerObj[rows[i].key] = parseFloat(rows[i].value)
            }
            getSqlDeposits(answerObj)

        })

        function getSqlDeposits(answer){
            if(typeof req.query.qty =='undefined'){
                db.all(`SELECT * FROM deposits `,(err,rows)=>{
                    answer.deposits = convertToFront(rows)
                    res.send(answer)
                })
            }else{
                let limit = parseInt(req.query.qty)
                db.all(`SELECT * FROM deposits ORDER BY id DESC LIMIT ${limit}`,(err,rows)=>{
                    answer.deposits = convertToFront(rows)
                    res.send(answer)
                })
            }
        }
    })
}catch(e){
    console.log(e)
}




try{
    app.get('/API/tbtcGeneralInfo',  (req,res) => {

        //Coolect additinal info
        db.all(`SELECT * FROM allInfo `,(err,rows)=>{
            let answerObj={}
            for(let i=0; i<rows.length; i++){
                answerObj[rows[i].key] = parseFloat(rows[i].value)
            }
            res.send(answerObj)

        })
    })
}catch(e){
    console.log(e)
}

export default {
    startServer
}