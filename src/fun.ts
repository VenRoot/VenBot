import { Context, InputFile } from "grammy";
import path from "path";
import { ReportError } from "./Error";
import {random, UserOrName} from "./core";
const mediapath = path.join(__dirname, "..", "media");
import {bot} from "./index";
import { VenID, phrases, Phrase1, _o, Phrase2 } from "./vars.js";

export const Distract = (e: Context) => e.replyWithAnimation(new InputFile(path.join(mediapath, "distract.gif")));
export const rr = (e: Context) => e.replyWithAnimation(new InputFile(path.join(mediapath, "rr.gif")));
export const B = (e: Context) => e.reply(Phrase2, { reply_to_message_id: e.message?.message_id }).catch(e => ReportError(e));
export const Ping = (e: Context) => e.reply("Pong", { reply_to_message_id: e.message?.message_id }).catch(e => ReportError(e));
export const o = (e: Context) => e.reply(_o, { reply_to_message_id: e.message?.message_id }).catch(e => ReportError(e));
export const u = (e: Context) => { if(e.chat?.type === "supergroup") e.replyWithPhoto(new InputFile(path.join(mediapath, "Ventastic.jpg")), {reply_to_message_id: e.message?.message_id, caption: `${e.message?.from?.first_name} ${Phrase1}`}).catch(e => ReportError(e)); }
export const Pog = (e: Context) => e.replyWithPhoto(new InputFile(path.join(mediapath, "pog.png")));
export const Doubt = (e: Context) => e.replyWithPhoto(new InputFile(path.join(mediapath, "doubt.png")));

export const RandomMessage = (e: Context) =>
{
    if(e.message == undefined) return null;
    if(e.message.from == undefined) return null;
    if(e.message.chat.type != "supergroup") if(e.message.chat.type == "private" && e.message.from.id != VenID) return null;
    const self = e.message.from;
    let phrase = phrases[random(0, phrases.length-1)];
    console.log(phrase, phrases);
    let User = UserOrName(self.first_name, self.username);
    phrase = phrase.replaceAll("$U", User);
    e.reply(phrase, { reply_to_message_id: e.message?.message_id }).catch(e => ReportError(e));
};
