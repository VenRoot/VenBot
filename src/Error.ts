import { Context } from "grammy";
import {bot} from "./index";
import {GroupID, VenID} from "./vars";
import fs from "fs";

bot.catch(async (err) => {
    console.error(err);
    ReportError(err.ctx);
    let x = CONF;
    x.RESTARTS = x.RESTARTS+1;
    fs.writeFileSync('./CONF.json', JSON.stringify(x));
    process.kill(process.pid, 'SIGINT');
    // const sub = spawn(`pm2 restart YiffSlut`, {detached: true, cwd: process.cwd()});
    // sub.unref();
    // process.exit();
});

process.on('uncaughtException', (err: Context) => {
  ReportError(err);
  let x = CONF;
  x.RESTARTS++;
  fs.writeFileSync('./CONF.json', JSON.stringify(x));
  // const sub = spawn(`pm2 restart YiffSlut`, {detached: true, cwd: process.cwd()});
  // sub.unref();
  process.kill(process.pid, 'SIGINT');
});


export const ReportError = (e: Context|string) =>
{
  console.warn("Error wird geworfen", e);
  bot.api.sendMessage(VenID, JSON.stringify(e));
}