import { Context, InputFile } from "grammy";
import path from "path";
import { ReportError } from "./Error";
import {getList, random, UserOrName} from "./core";
const mediapath = path.join(__dirname, "..", "data", "media");
import {bot} from "./index";
import { VenID, phrases, Phrase1, _o, Phrase2, ships } from "./vars.js";
import { tinyUser } from "./interface";

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


export const Ship = async(e: Context) =>
{
    const chat = await e.getChat();
    if(chat.type != "supergroup") return null;
    const users = (getList("user") as tinyUser[]).filter(u => u.groupid == chat.id);
    if(!users) return;

    //Select a random entry
    let idx = random(0, users.length-1);
    let idy = random(0, users.length-1, [idx]);
    let idz = random(0, users.length-1, [idx, idy]);

    // let [idx, idy, idz] = [random(0, users.length-1), random(0, users.length-1), random(0, users.length-1)];

    const [user1, user2, user3] = [users[idx], users[idy], users[idz]];

    //get the name from the id
    const [member1, member2, member3] = await Promise.all([bot.api.getChatMember(chat.id, user1.userid), bot.api.getChatMember(chat.id, user2.userid), bot.api.getChatMember(chat.id, user3.userid)]);
    const [name1, name2, name3] = [UserOrName(member1.user.first_name, member1.user.username), UserOrName(member2.user.first_name, member2.user.username), UserOrName(member3.user.first_name, member3.user.username)];
    let phrase = ships[random(0, phrases.length-1)];
    phrase = phrase.replaceAll("$U1", name1);
    phrase = phrase.replaceAll("$U2", name2);
    phrase = phrase.replaceAll("$U3", name3);
    e.reply(phrase, { reply_to_message_id: e.message?.message_id }).catch(e => ReportError(e));
}