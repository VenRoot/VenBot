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

export const bot = new Bot(process.env.PRODUCTION == "TRUE" ? process.env.BOT_TOKEN! : process.env.BOT_TOKEN_BETA!);

import {u, Pog, o, Distract, Doubt, rr, RandomMessage, B} from "./fun";
import { Channels, Commands, Groups, OwnerAt, VenID } from "./vars";
import {allow, Rules, Welcome, Goodbye} from "./Group";
import {Ban, Mute, Unmute, warn} from "./Admin";
import {donate} from "./stuff"
import {getArgs} from "./core";
import {Report, Warnings} from "./User";
import { ReportError } from "./Error";

bot.catch(async (err) => {
    console.error(err);
    ReportError(err.ctx);
    process.kill(process.pid, 'SIGINT');
});

//Send a message after the bot is started

bot.start({drop_pending_updates: true, onStart: () => {
  bot.api.sendMessage(VenID, "Bot started");
}});

bot.on(":new_chat_members", ctx => Welcome(ctx));

bot.on(":left_chat_member", ctx => Goodbye(ctx));

//@ts-ignore
import * as pack from "../package.json";
import {SchedeuledMsg } from "./vars";

bot.api.setMyCommands(Commands);



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
bot.command("owo", e => o(e));
bot.command(["pog", "Pog", "poggers", "Poggers"], e => Pog(e));
bot.command("uwu", e => u(e));
bot.command("random", e => RandomMessage(e));
bot.command("why", e => B(e));


bot.command("ban", e => Ban(e, false));
bot.command("uptime", e => e.reply(`The bot has been running for ${Math.floor(process.uptime() / 60)} minutes (${process.uptime()} milliseconds).`));
bot.command("mute", e => Mute(e));
bot.command("unmute", e => Unmute(e));
bot.command("getArgs", e => e.reply(getArgs(e)?.join(" | ") || "Keine Args"));
// bot.command("list", e => getList(e));
bot.command("ping", e => e.reply("pong"));
bot.command("warn", e => warn(e));
bot.command("warnings", e => Warnings(e));


//bot.command("unban", e => Unban(e));
const Help = async (e: Context) => {
    if(e.chat === undefined) return;
    if(e.chat.type != "private") return;

    let text = `This is a new version of the Group-Management Bot made by ${OwnerAt}!\n\nThis bot uses TypeScript and grammY, running on a NodeJS Engine. The Code will be avaiable on GitHub: https://github.com/VenRoot/VenBot`;
    e.reply(text);
};

//Schedule every 12 hours

process.on('uncaughtException', err => {
	console.error(err);
    ReportError(JSON.stringify(err));
  });

  if(process.env.PRODUCTION == "TRUE")
  {
    s.scheduleJob('0 */12 * * *', () => {
      const markup = new InlineKeyboard()
      .url("Join now!", Groups[0].link).row();
       bot.api.sendMessage(Channels[0].id, SchedeuledMsg, {reply_markup: markup});
    });
    
    s.scheduleJob('0 */6 * * *', () =>{
      let msg = "Seeing inappropiate messages or media? Someone trolling, breaking the rules or disturbing the peace?\n\nReply to their message with /report and the admins will take care of it as soon as possible!";
      bot.api.sendMessage(Groups[0].id, msg);
    });
  }
  
  


