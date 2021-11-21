import {Bot} from "grammy";
import dotenv from "dotenv";

dotenv.config({path: "../.env"});

console.log(process.env);

if(process.env.BOT_TOKEN === undefined) throw "No BotToken";
export const bot = new Bot(process.env.BOT_TOKEN);

bot.start();

bot.catch(async (err) => {
    console.error(err);
    process.kill(process.pid, 'SIGINT');
});