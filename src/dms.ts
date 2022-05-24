import path from "path";
import http from "http2";
import fs from "fs";
import { SecureServerOptions } from "http2";
import s from "node-schedule";
interface devices 
{
    PC: Date;
    S21: Date;
    Laptop: Date;
}


const device = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "devices.json"), "utf8")) as devices;

const options: SecureServerOptions = 
{
    key: fs.readFileSync('../cers/key.pem'),
    cert: fs.readFileSync('../certs/cert.pem')
}


http.createSecureServer(options, (req, res) => {

    //Check if the secret key is in the header
    if(req.headers.secretkey != "12345")
    {
        res.end("Invalid secret key");
        return;
    }

    if(req.url == "/S21") device.S21 = new Date();
    if(req.url == "/PC") device.PC = new Date();
    if(req.url == "/Laptop") device.Laptop = new Date();

    if(req.url == "/")
    {
        res.end(JSON.stringify(device));
        return;
    }


}).listen(10421);


export const getDMS = ():devices => device;



s.scheduleJob({hour: 0}, () => { 
    //Check each device and if it's older than 1 day, send a message to the group
    if(device.S21.getTime() !< new Date().getTime() - 86400000) return;
    if(device.PC.getTime() < new Date().getTime() - 86400000) return;
    if(device.Laptop.getTime() < new Date().getTime() - 86400000) return;
    console.log("Sending message to group");
    
});