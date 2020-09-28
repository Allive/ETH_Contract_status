
import app from '../flutterServer.js'
import fs from 'fs'
import http from 'http';
import https from 'https'
try{
    var privateKey  = fs.readFileSync(process.env.PRIVATE_KEY_SSL, 'utf8');
    var certificate = fs.readFileSync(process.env.CERT_SSL, 'utf8');
}catch(e){}
var credentials = {key: privateKey, cert: certificate};


function startServer() {
    if(typeof credentials.key || typeof credentials.cer =='undefined'){
        var httpServer = http.createServer(app);
        httpServer.listen(80);
    }else{
        var httpsServer = https.createServer(credentials, app);
        httpsServer.listen(443);
    }
 }


 export default {
    startServer
}
