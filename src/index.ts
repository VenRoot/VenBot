import dotenv from "dotenv";
import path from "path";
dotenv.config({path: path.join(process.cwd(), ".env")});
if(process.env.BOT_TOKEN === undefined || process.env.BOT_TOKEN.length == 0) throw "No Bot Token";
import {Bot, Context, BotError, InlineKeyboard, InputFile} from "grammy";
import s from "node-schedule";

export let log = function(message: any, ...optionalParams: any[]) {}

if(process.env.PRODUCTION === "TRUE")
{
  log = console.log;
}

log("Starting Bot");

export const bot = new Bot(process.env.BOT_TOKEN);

import {uwu, Pog, owo, Distract, Doubt, rr} from "./fun";
import {allow, groups, Rules, Welcome} from "./Group";
import {Ban, Mute, Unmute, warn} from "./Admin";
import {donate} from "./stuff"
import {getArgs} from "./core";
import {Report, getList} from "./User";
import { ReportError } from "./Error";
import {SuckySucky} from "./fun";

bot.catch(async (err) => {
    console.error(err);
    ReportError(err.ctx);
    process.kill(process.pid, 'SIGINT');
});

//Send a message after the bot is started

bot.start({drop_pending_updates: true});

bot.on(":new_chat_members", ctx => Welcome(ctx));

//@ts-ignore
import * as pack from "../package.json";
import { GroupName, SchedeuledMsg } from "./vars";

bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show useful information" },
  { command: "rules", description: "Read the rules" },
  { command: "report", description: "Report a user (only works in group)" },
  { command: "accept", description: "Accept the rules" },
  { command: "donate", description: "Buy me a coffee :3" },
  { command: "version", description: "Get bot version" },
  { command: "doubt", description: "Send doubt meme" },
  { command: "distract", description: "Send distract meme" },
  { command: "rr", description: "You know exactly what that is" },
  { command: "owo", description: "Send a fun message" },
  { command: "pog", description: "Send pog meme" },
  { command: "uwu", description: "Surprise (only works in group)" },
  { command: "sucky", description: "Try this command in the group" },
  { command: "ping", description: "PONG" }

]);



bot.command("start", e => Welcome(e));
bot.command("help", e => Help(e));
bot.command("rules", e => Rules(e));
bot.command("report", e => Report(e));
bot.command("accept", e => allow(e, true, false));
bot.command("donate", e => donate(e));
bot.command("version", (async (ctx) => ctx.reply(`Version: ${pack.version}\nLicense: ${pack.license}`)));
bot.command("doubt", e => Doubt(e));
bot.command("distract", e => Distract(e));
bot.command("rr", e => rr(e));
bot.command("owo", e => owo(e));
bot.command(["pog", "Pog", "poggers", "Poggers"], e => Pog(e));
bot.command("uwu", e => uwu(e));
bot.command("sucky", e => SuckySucky(e));


bot.command("ban", e => Ban(e, false));
bot.command("uptime", e => e.reply(`The bot has been running for ${Math.floor(process.uptime() / 60)} minutes (${process.uptime()} milliseconds).`));
bot.command("mute", e => Mute(e));
bot.command("unmute", e => Unmute(e));
bot.command("getArgs", async e => e.reply(await getArgs(e)?.join(" | ") || "Keine Args"));
bot.command("list", e => getList(e));
bot.command("ping", e => e.reply("pong"));
bot.command("warn", e => warn(e));


//bot.command("unban", e => Unban(e));
const Help = async (e: Context) => {
    if(e.chat === undefined) return;
    if(e.chat.type != "private") return;

    let text = "This is a new version of the Group-Management Bot made by @Ventox2!\n\nThis bot uses TypeScript and grammY, running on a NodeJS Engine. The Code will be avaiable on GitHub: https://github.com/VenRoot/VenBot";
    e.reply(text);
};

//Schedule every 12 hours

process.on('uncaughtException', err => {
	console.error(err);
    ReportError(JSON.stringify(err));
  });
  
  s.scheduleJob('0 */12 * * *', () => {
    const markup = new InlineKeyboard()
    .url("Join now!", `https://t.me/${GroupName}`).row();
     bot.api.sendMessage(groups[0].id, SchedeuledMsg, {reply_markup: markup});
  });
  
  s.scheduleJob('0 */6 * * *', () =>{
    let msg = "Seeing inappropiate messages or media? Someone trolling, breaking the rules or disturbing the peace?\n\nReply to their message with /report and the admins will take care of it as soon as possible!";
    bot.api.sendMessage(groups[1].id, msg);
  });
