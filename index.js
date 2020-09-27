
import ETHgetter from './ethGetter.js'
import expressServer from './server.js'
import webServer from './bin/www.js'
import dotenv from 'dotenv'

dotenv.config()


function startETHgetter(){ 
    try{
        ETHgetter.startAll()
    }catch(e){
        console.log(e)
        startETHgetter()
    }
}


function startBackServer(){
    try{
        expressServer.startServer()
    }catch(e){
        console.log(e)
        startBackServer()
    }
}

function startWebServer(){
    try{
        webServer.startServer()
    }catch(e){
        console.log(e)
        startWebServer()
    }
}


startETHgetter()
startBackServer()
startWebServer()