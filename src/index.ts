import {Bot, Context, BotError, InlineKeyboard, InputFile} from "grammy";

import fs from "fs";
import path from "path";
import {addMinutes, compareAsc, subMinutes} from "date-fns";
import s from "node-schedule";
import dotenv from "dotenv";
import {GroupID, VenID} from "./vars";
import {ReportError} from "./Error";
import {uwu, Pog, owo, Distract, Doubt} from "./fun";
import {allow} from "./Group";
import {Ban, Mute, Unmute, warn} from "./Admin";
import {donate} from "./stuff"
import {getArgs} from "./core";
import {Report, getList} from "./User";
dotenv.config();

if(process.env.BOT_TOKEN === undefined) throw "No BotToken";



export const bot = new Bot(process.env.BOT_TOKEN);



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
bot.command("owo", e => owo(e));
bot.command("ping", e => e.reply("pong"));

bot.command(["pog", "Pog", "poggers", "Poggers"], e => Pog(e));
bot.command("report", e => Report(e));
bot.command("warn", e => warn(e));

bot.command("donate", e => donate(e));
bot.command("uptime", e => e.reply(`The bot has been running for ${Math.floor(process.uptime() / 60)} minutes (${process.uptime()} milliseconds).`));

bot.command("uwu", e => uwu(e));

const Help = async (e: Context) => {
    if(e.chat === undefined) return;
    if(e.chat.type != "private") return;

    let text = "This is a new version of the Group-Management Bot made by @Ventox2!\n\nThis bot uses TypeScript and grammY, running on a NodeJS Engine. The Code will be avaiable on GitHub: https://github.com/VenRoot/VenBot"
    
};

const Rules = async (e: Context) => {
    const inlineKeyboard = new InlineKeyboard()
    .url("📋 Read the rules", "https://t.me/***REMOVED***").row();
    e.reply(`Please read the following help here: https://telegra.ph/***REMOVED***-Help-01-07`, {reply_to_message_id: e.message?.message_id, reply_markup: inlineKeyboard}).catch(err => ReportError(err));
};