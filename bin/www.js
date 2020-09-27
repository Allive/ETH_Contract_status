
import app from '../flutterServer.js'
import fs from 'fs'
import http from 'http';
import https from 'https'
try{
    var privateKey  = fs.readFileSync('/etc/letsencrypt/live/keep-deposit.com/privkey.pem', 'utf8');
    var certificate = fs.readFileSync('/etc/letsencrypt/live/keep-deposit.com/cert.pem', 'utf8');
}catch(e){console.log(e)}
var credentials = {key: privateKey, cert: certificate};


function startServer() {
    var httpServer = http.createServer(app);
    var httpsServer = https.createServer(credentials, app);
    httpServer.listen(80);
    httpsServer.listen(443);
 }


 export default {
    startServer
}
