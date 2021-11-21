import { Context, InlineKeyboard } from "grammy";
import {InlineKeyboardButton} from "@grammyjs/types"
import {GroupID, VenID} from "./vars";
import {bot} from "./index";
import fs from "fs";
import mysql from "mysql2";
import { ReportError } from "./Error";
import { users } from "./interface";

bot.on(":new_chat_members", ctx => Welcome(ctx));


export const groups = [
    {
        id: GroupID,
        name: "***REMOVED***"
    }
]

const Welcome = async (ctx: Context) => {
    if(ctx === undefined) return;
    if(ctx.message === undefined) return;
    if(ctx.message.from === undefined) return;
    //Check if user is not a bot
    if(ctx.message.from.is_bot === true)
    {
        ctx.reply("Sorry, no bots are currently allowed");
        return ctx.banChatMember(ctx.message.from.id);
    }
    
    const inlineKeyboard = new InlineKeyboard()
    .url("📋 Read the rules", "https://t.me/***REMOVED***").row()
    .text("✅ I accept the rules", "accept").row();

    bot.api.restrictChatMember(ctx.message.chat.id, ctx.message.from.id, {can_send_messages: false, can_send_media_messages: false, can_send_other_messages: false, can_send_polls: false});
    //Check if user has a username
    ctx.reply(`Welcome to the chat ${"@"+ctx.message.from.username || ctx.message.from.first_name}, please make sure to read the rules. You will be able to chat in here once you read them :3\n\n If you have trouble you can use this button right here to accept AFTER you read them ;3\n\nStill having trouble? Send a pm to @Ventox2 ;3`,{reply_to_message_id: ctx.message.message_id, reply_markup: inlineKeyboard});
    //Check if user is not a bot

    await usersWhoNeedToAccept.add(ctx.message.from.id);
    changeList.add(ctx.message.from.id, ctx.message.message_id+1);
};
const changeList = {
    add: async function(userid: number, msgid:number)
    {
        let data = await JSON.parse(fs.readFileSync("./users.JSON", "utf8")) as users[];
        data.push({userid: userid, msgid: msgid});
        fs.writeFileSync("./users.JSON", JSON.stringify(data, null, 4));
        return;
    },
    delete: async function(userid: number)
    {
        let data = await JSON.parse(fs.readFileSync("./users.JSON", "utf8")) as users[];
        data = await data.filter((obj:any) =>  { return obj.userid !== userid; });
        fs.writeFileSync("./users.JSON", JSON.stringify(data, null, 4))
        return;
    },
    get: async function(userid: number)
    {
        let data = await JSON.parse(fs.readFileSync("./users.JSON", "utf8")) as users[];
        data = await data.filter((obj:any) =>  { return obj.userid == userid; });
        return data;
    }
};

const usersWhoNeedToAccept = {
    has: async function(userid: number)
    {
        let _tmp = await JSON.parse(fs.readFileSync("./uwnta.JSON", "utf8")) as number[];
        if(_tmp.includes(userid)) return true;
        return false;
    },
    add: async function(userid: number)
    {
        let data = await JSON.parse(fs.readFileSync("./uwnta.JSON", "utf8")) as number[];
        data.push(userid);
        fs.writeFileSync("./uwnta.JSON", JSON.stringify(data, null, 4));
        return true;
    },
    delete: async function(userid: number)
    {
        let data = await JSON.parse(fs.readFileSync("./uwnta.JSON", "utf8")) as number[];
        data = await data.filter((obj:any) =>  { return obj !== userid; });
        fs.writeFileSync("./uwnta.JSON", JSON.stringify(data, null, 4))
        return;
    },
    getAll:  async () => await JSON.parse(fs.readFileSync("./uwnta.JSON", "utf8")) as number[]
};

bot.callbackQuery("accept", async ctx => {
    if(ctx === undefined) return;
    if(ctx.message === undefined) return;
    if(ctx.message.from === undefined) return;
    

    //Prüfe, ob der Nutzer per Button oder per Befehl akzeptiert hat

    if(ctx.message !== undefined && ctx.callbackQuery === undefined)
    {
        //User hat per Nachricht akzeptiert
        if(await usersWhoNeedToAccept.has(ctx.message.from.id))
        {
            //User war in der Liste
            await usersWhoNeedToAccept.delete(ctx.message.from.id);
            await allow(ctx, false, true);

            changeList.delete(ctx.message.from.id);
        }
        else return false;
    }
    else
    {
        //User hat per CallbackQuery akzeptiert
        if(await usersWhoNeedToAccept.has(ctx.callbackQuery.from.id))
        {
            //User war in der Liste
            await usersWhoNeedToAccept.delete(ctx.callbackQuery.from.id);
            await allow(ctx, false, true);

            changeList.delete(ctx.callbackQuery.from.id);
        }
        else return false;
    }

    const inlineKeyboard = new InlineKeyboard()
    .url("📋 Read the rules", "https://t.me/***REMOVED***").row();
    bot.api.restrictChatMember(ctx.message.chat.id, ctx.message.from.id, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_send_polls: true});
    ctx.editMessageText("✅ Thank you for reading the rules! You are now able to chat\nEnjoy your stay!\n\nYou can always read the rules here, they will be updated from time to time", {reply_markup: inlineKeyboard});    //bot.api.sendMessage(VenID, `${ctx.message.from.first_name} has accepted the rules`);
})


export const allow = async (e: Context, priv: boolean, button: boolean) => {
    const markup = new InlineKeyboard();
    markup.url("📋 Read the rules", "https://t.me/***REMOVED***");
    let _users = await dat("SELECT id from accepted");
    let uid:number = 0, mid:number|undefined, uname:string|undefined, fname:string|undefined;

    if(e.callbackQuery !== undefined)
    {
        uid = e.callbackQuery.from.id;
        mid = e.callbackQuery.message?.message_id as number;
        uname = e.callbackQuery.from.username;
        fname = e.callbackQuery.from.first_name;
    }
    else if(e.message !== undefined)
    {
        if(e.message.from === undefined) return;
        uid = e.message.from.id;
        mid = e.message.message_id;
        uname = e.message.from?.username;
        fname = e.message.from?.first_name;
    }
    let userAccepted = _users.find(f => f.id == uid);

    if(userAccepted === undefined) await dat(`INSERT INTO accepted VALUES("${uname}", "${uid}")`);
    else e.reply("You already accepted the rules, no need to worry :3");
    await getMessageId(uid).then(async msgid => {
        if(typeof msgid == null)
        {
            ReportError("Konnte User nicht freigeben");
            e.reply("There was an error, probably because the welcome message doesn't exist anymore. A report to @Ventox2 got send");
            return false;
        }
        else
        {
            bot.api.restrictChatMember(groups[1].id, uid, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_send_polls: true});
            bot.api.editMessageText(
                groups[1].id, msgid, `✅Thank you ${"@"+uname || fname} for reading the rules! You are now allowed to talk :3 I hope you have fun here ;3\n\nYou can always read the rules here, they will be updated from time to time`, {reply_markup: markup})
              .catch(err => { ReportError(err); e.reply(`Couldn't proceed. Report to the admin was sent`); });
        }
    }).catch(err => { 
        ReportError(err); e.reply(`An error occurred while getting the data: ${err}\n\nThe bot can't alter the welcome message anymore, but the user will still be accepted`);
        bot.api.restrictChatMember(groups[1].id, uid, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_send_polls: true});
        bot.api.sendMessage(groups[1].id, `✅Thank you ${"@"+uname || fname} for reading the rules! You are now allowed to talk :3 I hope you have fun here ;3\n\nYou can always read the rules here, they will be updated from time to time`, {reply_markup: markup})
        .catch(err => { ReportError(err); e.reply(`Couldn't proceed. Report to the admin was sent`); });
 });
};

const getMessageId = async (userid:number) => 
{
    let _tmp = await changeList.get(userid);
    if(_tmp === undefined)
    {
      ReportError("getMessageId gab undefined");
      throw null;
    }
    else if (_tmp.length == 0)
    {
      ReportError("userid war nicht gespeichert in users.JSON");
      throw "The UserID record was not found. The bot didn't record the MessageID and UserID when the user joined";
    }
    else return _tmp[_tmp.length-1].msgid;
}

// @ts-ignore
export const dat = async (Befehl: string): Promise<mysql.RowDataPacket[]> =>
{
    const con = mysql.createConnection({
      host: "***REMOVED***",
      user: "venbot",
      password: "***REMOVED***",
      database: "venbot",
      port: 3306
    });

    con.query(Befehl, (err, result: mysql.RowDataPacket[]) => {
        if(err) throw err;
        return result;
    });
}
