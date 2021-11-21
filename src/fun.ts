import { Context, InputFile } from "grammy";
import path from "path";
import { ReportError } from "./Error";
const mediapath = path.join(__dirname, "..", "media");

export const Distract = (e: Context) => e.replyWithAnimation(new InputFile(path.join(mediapath, "distract.gif")));
export const rr = (e: Context) => e.replyWithAnimation(new InputFile(path.join(mediapath, "rr.gif")));
export const Bish = (e: Context) => e.reply("U fukkin bish y u bullin me? qwq", { reply_to_message_id: e.message?.message_id }).catch(e => ReportError(e));
export const Ping = (e: Context) => e.reply("Pong", { reply_to_message_id: e.message?.message_id }).catch(e => ReportError(e));
export const owo = (e: Context) => e.reply("owo uwu owo uwu owo", { reply_to_message_id: e.message?.message_id }).catch(e => ReportError(e));
export const uwu = (e: Context) => e.replyWithPhoto(new InputFile(path.join(__dirname, "..", "media", "VenNSFW1.png")), {reply_to_message_id: e.message?.message_id, caption: `${e.message?.from?.first_name} has to suck @Ventox2 dick now :3`}).catch(e => ReportError(e));
export const Pog = (e: Context) => e.replyWithPhoto(new InputFile(path.join(mediapath, "pog.png")));
export const Doubt = (e: Context) => e.replyWithPhoto(new InputFile(path.join(mediapath, "doubt.png")));
