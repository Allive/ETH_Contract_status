
import ETHgetter from './ethGetter.js'
import expressServer from './server.js'
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


function startWebServer(){
    try{
        expressServer.startServer()
    }catch(e){
        console.log(e)
        startWebServer()
    }
}

startETHgetter()
startWebServer()