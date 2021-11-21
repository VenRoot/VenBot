import {Bot, Context, BotError, InlineKeyboard, InputFile} from "grammy";
import s from "node-schedule";
import dotenv from "dotenv";
import {Pog, Distract, Doubt} from "./fun";
import {allow, groups, Rules} from "./Group";
import {Ban, Mute, Unmute, warn} from "./Admin";
import {donate} from "./stuff"
import {getArgs} from "./core";
import {Report, getList} from "./User";
import { ReportError } from "./Error";
dotenv.config({path: "../.env"});

console.log(process.env);

if(process.env.BOT_TOKEN === undefined) throw "No BotToken";
export const bot = new Bot(process.env.BOT_TOKEN);

bot.catch(async (err) => {
    console.error(err);
    ReportError(err.ctx);
    process.kill(process.pid, 'SIGINT');
});



bot.start();

bot.command("start", e => Rules(e));
bot.command("help", e => Help(e));
bot.command("accept", e => allow(e, true, false));
bot.command("ban", e => Ban(e, false));
//bot.command("unban", e => Unban(e));

bot.command("mute", e => Mute(e));
bot.command("unmute", e => Unmute(e));

bot.command("distract", e => Distract(e));
bot.command("doubt", e => Doubt(e));

bot.command("getArgs", async e => e.reply(await getArgs(e)?.join(" | ") || "Keine Args"));

bot.command("list", e => getList(e));
bot.command("ping", e => e.reply("pong"));

bot.command(["pog", "Pog", "poggers", "Poggers"], e => Pog(e));
bot.command("report", e => Report(e));
bot.command("warn", e => warn(e));

bot.command("donate", e => donate(e));
bot.command("uptime", e => e.reply(`The bot has been running for ${Math.floor(process.uptime() / 60)} minutes (${process.uptime()} milliseconds).`));


const Help = async (e: Context) => {
    if(e.chat === undefined) return;
    if(e.chat.type != "private") return;

    let text = "This is a new version of the Group-Management Bot made by @Ventox2!\n\nThis bot uses TypeScript and grammY, running on a NodeJS Engine. The Code will be avaiable on GitHub: https://github.com/VenRoot/VenBot";
    e.reply(text);
};

//Schedule every 12 hours

process.on('uncaughtException', err => {
  ReportError(JSON.stringify(err));
});
  
s.scheduleJob('0 */6 * * *', () =>{
  let msg = "Seeing inappropiate messages or media? Someone trolling, breaking the rules or disturbing the peace?\n\nReply to their message with /report and the admins will take care of it as soon as possible!";
  bot.api.sendMessage(groups[1].id, msg);
});