import express from 'express'
import ethGetter from './ethGetter.js'
const app = express();
const port = 9090;
import sqlite3 from 'sqlite3'


const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

function startServer() {
    app.listen(port, () => {
        console.log(`App listening port: ${port}`);
    });
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



try{
    app.get('/API/depositDetails', async (req,res)=>{
        if(typeof req.query.txn =='undefined')
            res.send(400)
        try{
        res.send(await ethGetter.getDeposit(req.query.txn))
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