import { Context, InlineKeyboard } from "grammy";
import {BetaBotName, BotName, Communities, Groups, OwnerAt, RulesURL} from "./vars";
import {bot, log} from "./index";
import { ReportError } from "./Error";

import mariadb from "mariadb";
import { UserOrName } from "./core";
import { getFile, setFile, User } from "./files.js";
import { changeList, usersWhoNeedToAccept } from "./obsolete.js";

export const Welcome = async (ctx: Context) => {
    if(ctx === undefined) return log(-1);
    if(ctx.message === undefined) return log(-2);
    if(ctx.message.from === undefined) return log(-3);
    const chat = await ctx.getChat();
    if(chat.type == "private") return Welcome2(ctx);
    if(chat.type !== "supergroup") return;
    //Check if user is not a bot
    if(ctx.message.from.is_bot === true)
    {
        ctx.reply("Sorry, no bots are currently allowed");
        return ctx.banChatMember(ctx.message.from.id);
    }
    
    const user = User.get(ctx.message.from.id, chat.id, "accepted");
    if(user) return ctx.reply(`You already accepted the rules, welcome back ${UserOrName(ctx.message.from.first_name, ctx.message.from.username)} :p`);
    
    const inlineKeyboard = new InlineKeyboard()
    .url("📋 Read the rules", `https://t.me/${process.env.PRODUCTION == "TRUE" ? BotName : BetaBotName}`).row();

    const group = Groups.find(x => x.id == chat.id);
    if(!group) return ctx.reply("This group is not registered in the database, please contact the bot owner");
    let specialtext = "";
    if(group.specialRules)
    {
        inlineKeyboard.url("📋 Read the special rules", group.specialRules);
        specialtext = `\n\nOh, it seems that this chat has some special rules/notices, please read them! \n`;
    }

    inlineKeyboard.text("✅ I accept the rules", "accept").row();

    bot.api.restrictChatMember(chat.id, ctx.message.from.id, {can_send_messages: false, can_send_media_messages: false, can_send_other_messages: false, can_send_polls: false});
    //Check if user has a username
    const message = await ctx.reply(`Welcome to the ${chat.title} chat ${UserOrName(ctx.message.from.first_name, ctx.message.from.username)}, please make sure to read the rules. You will be able to chat in here once you read them :3\n\n If you have trouble you can use this button right here to accept AFTER you read them\n\nStill having trouble? Send a pm to ${OwnerAt} ;3`+specialtext,{reply_to_message_id: ctx.message.message_id, reply_markup: inlineKeyboard});
    User.set(ctx.message.from.id, chat.id, message.message_id, "pending");
};


export const Welcome2 = async(ctx: Context) => {
    //This method is called when the user "starts" the bot from private
    if(ctx === undefined) return log(-1);
    if(ctx.message === undefined) return log(-2);
    if(ctx.message.from === undefined) return log(-3);
    const chat = await ctx.getChat();
    const pending = getFile("pending").find(x => x.userid == chat.id);
    if(!pending)
    {
        // const accepted = getFile("accepted").find(x => x.userid == chat.id);
        // if(accepted) return ctx.reply(`You already accepted the rules, welcome back to ${accepted.group} ${UserOrName(ctx.message.from.first_name, ctx.message.from.username)} :p`);
        // return ctx.reply(`Hmm, it seems like you haven't joined any group...`);

        return ctx.reply("You are not on a pending list. Either you haven't joined any group or you already accepted the rules");
    }

    const x = Groups.find(x => x.id == pending.groupid);
    if(!x) return ctx.reply(`Hmm, it seems like you haven't joined any group...`);

    const accepted = getFile("accepted").find(x => x.userid == chat.id);
    if(accepted) 
    {
        //Remove the user from the pending list
        const pending2 = getFile("pending");
        const index = pending2.findIndex(x => x.userid == chat.id);
        if(index !== -1) pending2.splice(index, 1);
        setFile("pending", pending2);
        
        return ctx.reply(`You already accepted the rules, welcome back, ${UserOrName(ctx.message.from.first_name, ctx.message.from.username)} :p`);
    }

    const inlineKeyboard = new InlineKeyboard()
        .url("📋 Read the rules", `${RulesURL}`).row()

        if(x.specialRules)
        {
            inlineKeyboard.url("📋 Read the special rules", `${x.specialRules}`).row();
            ctx.reply("Oh, it seems that this chat has some special rules/notices, please read them!");
        }
        inlineKeyboard.text("✅ I accept the rules", "accept").row();
        ctx.reply(`Welcome to ${pending.group}, ${UserOrName(ctx.message.from.first_name, ctx.message.from.username)}, it seems you are new here. Nice to meet you! Before I can let you talk in the group, you have to accept the rules! :p`, {reply_markup: inlineKeyboard});
    
};

/**
 * Bots sollten nicht chatten dürfen, es sei denn, sie sind Admins
 * Channels und Gruppen dürfen nicht chatten, es sei denn, sie sind in der Communities Liste
 */
export const checkMsg = async (ctx: Context) =>{
    if(ctx?.message?.from == undefined) return;
    const chat = await ctx.getChat();
    if(chat.type !== "supergroup") return;

    let user = ctx.message.from;
    let member = await ctx.getChatMember(user.id);
    if(member.status !== "administrator" && member.status !== "creator") return;

    
    let currentChat = Communities.find(x => x.id == chat.id)
    if(currentChat) return;
    let Groups = Communities.find(x => x.id == user.id);
    if(Groups != undefined) return;
    if(!t.getTimeout()) ctx.reply("Sending messages as a non-user is currently not allowed");
    ctx.deleteMessage().catch(() => {

    } )
} 


const t ={
    timeout: false,
    //Make a set method for this
    getTimeout() {
        if(this.timeout) return true;
        this.timeout = true;
        return false;
    } 
}

setInterval(() =>t.timeout = false, 1000 * 60 * 5);

export const Goodbye = async(ctx: Context) =>
{
    if(ctx === undefined) return log(-1);
    if(ctx.message === undefined) return log(-2);
    if(ctx.message.from === undefined) return log(-3);
    const chat = await ctx.getChat();

    let _user = User.get(ctx.message.from.id, chat.id, "pending");
    if(_user)
    {
        //User 
        User.remove(_user.userid, _user.groupid, "pending");
        ctx.deleteMessage().catch();
        bot.api.deleteMessage(chat.id, _user.msgid).catch(() => {
            bot.api.editMessageText(chat.id, _user!.msgid, `${UserOrName(ctx!.message!.from!.first_name, ctx!.message!.from!.username)} joined and left`).catch(() => {});
        });
        return;
    }
    const user = User.get(ctx.message.from.id, chat.id, "accepted");
    if(!user) return;
    //User.remove(user.userid, chat.id, "accepted");

    bot.api.deleteMessage(chat.id, user.msgid).catch(() => {
        bot.api.editMessageText(chat.id, user.msgid, `${UserOrName(ctx!.message!.from!.first_name, ctx!.message!.from!.username)} has left the group`).catch(() => {});
    });
    
    ctx.deleteMessage();
    ctx.reply(`${UserOrName(ctx.message.from.first_name, ctx.message.from.username)} has left our group, sorry to see you go`);
};

bot.callbackQuery("accept", async ctx => {
    console.debug("accept");
    if(ctx === undefined) return log(-1);
    

    //Prüfe, ob der Nutzer per Button oder per Befehl akzeptiert hat

    if(ctx.message !== undefined && ctx.callbackQuery === undefined)
    {
        if(ctx.message.from === undefined) return log("message.from.username war in accept nicht definiert");
        //User hat per Nachricht akzeptiert
        allow(ctx, false, true);
        // if(await usersWhoNeedToAccept.has(ctx.message.from.id))
        // {
        //     //User war in der Liste
        //     log(`User ${ctx.message.from.id} ist berechtigt, hat aber die Regeln akzeptiert`);
        //     await usersWhoNeedToAccept.delete(ctx.message.from.id);
        //     await allow(ctx, false, true);

        //     changeList.delete(ctx.message.from.id);
        // }
        // else {
        //     log(`User ${ctx.message.from.id} ist nicht drin, hat die Regeln akzeptiert`);
        //     return false;
        // }
    }
    else
    {
        log(`Callback`);
        allow(ctx, false, true);
        // const user = User.get(ctx.callbackQuery.from.id, ctx.callbackQuery. "pending");
        // //User hat per CallbackQuery akzeptiert
        // if(await usersWhoNeedToAccept.has(ctx.callbackQuery.from.id))
        // {

        //     log(`User ${ctx.callbackQuery.from.id} ist berechtigt, hat aber die Regeln akzeptiert`);
        //     //User war in der Liste
        //     await usersWhoNeedToAccept.delete(ctx.callbackQuery.from.id);
        //     await allow(ctx, false, true);

        //     changeList.delete(ctx.callbackQuery.from.id);
        // }
        // else
        // {
        //     log(`User ${ctx.callbackQuery.from.id} ist nicht drin, hat die Regeln akzeptiert`);
        //     return false;
        // }
    }
    // const chat = await ctx.getChat();
    // const inlineKeyboard = new InlineKeyboard()
    // .url("📋 Read the rules", `https://t.me/${BotName}`).row();
    // const uname = ctx.callbackQuery.from.username;
    // const fname = ctx.callbackQuery.from.first_name;
    // bot.api.restrictChatMember(chat.id, ctx?.message?.from?.id || ctx.callbackQuery.from.id, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_send_polls: true});
    // ctx.editMessageText(`✅ Thank you ${uname ? `@${uname}` : fname} for reading the rules! You are now able to chat\nEnjoy your stay!\n\nYou can always read the rules here, they will be updated from time to time`, {reply_markup: inlineKeyboard});    //bot.api.sendMessage(VenID, `${ctx.message.from.first_name} has accepted the rules`);
})


export const allow = async (e: Context, priv: boolean, button: boolean) => {
    const markup = new InlineKeyboard();
    markup.url("📋 Read the rules", `https://t.me/${bot.botInfo.username}`);
    if(e.from === undefined) return log(-1);
    // let _users = await dat("SELECT id from accepted") as number[];
    const chat = await e.getChat();
    if(chat.type !== "supergroup")
    {
        //We need to find out which supergroup the user is in
        // So get all supergroups which the user hasn't accepted yet
        let groups = User.groups(e.from!.id).filter(g => g.accepted === false);
        console.table(groups);
        groups.forEach(g => {
            let error:{
                raw: any,
                message: string
            }[] = [];
            try
            {
                bot.api.restrictChatMember(g.groupid, e.from!.id, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_send_polls: true}).catch(err => {
                    console.error(1);
                    error.push({raw: err, message: "I couldn't allow the user to chat in the group"});
                })
                bot.api.editMessageText(
                    g.groupid, g.msgid, `✅Thank you ${UserOrName(e.from!.first_name, e.from!.username)} for reading the rules! You are now allowed to talk :3 I hope you have fun here ;3\n\nYou can always read the rules here, they will be updated from time to time`, {reply_markup: markup}).catch(err => {
                        console.error(2);
                        error?.push({raw: err, message: "I couldn't edit the message"});
                    })
                
                bot.api.sendMessage(e.from!.id, `✅Hey ${UserOrName(e.from!.first_name, e.from!.username)}! You are now allowed to talk in the group ${g.group}`).catch(err => {
                    console.error(3);
                    error?.push({raw: err, message: "I couldn't send a message to you. Did you block me?"});
                })
                User.remove(e.from!.id, g.groupid, "pending");
                User.set(e.from!.id, g.groupid, g.msgid, "accepted");
            }
            catch(err)
            {
                ReportError(JSON.stringify(err));
                e.reply(`I am sorry ${UserOrName(e.from!.first_name, e.from!.username)}, but I am unable to allow you to talk in the group ${g.group} \n
                There could be multiple reasons: \n
                1. You are not in the group\n
                2. I am unable to send you a message\n
                3. I am unable to edit the message\n
                \n
                . A report to ${OwnerAt} has been sent.\n\n
                
                Here is a more detailed error message: \n
                ${JSON.stringify(error.map(a => a.message))}`);
            }
        });
        return;
    }
    

    let uid:number = 0, mid:number|undefined, uname:string|undefined, fname:string|undefined;

    if(e.callbackQuery !== undefined)
    {
        log("callbackQuery");
        log(e.callbackQuery.from);
        uid = e.callbackQuery.from.id;
        mid = e.callbackQuery.message?.message_id as number;
        uname = e.callbackQuery.from.username;
        fname = e.callbackQuery.from.first_name;
    }
    else if(e.message !== undefined)
    {
        log("message");
        log(e.message.from);
        if(e.message.from === undefined) return;
        uid = e.message.from.id;
        mid = e.message.message_id;
        uname = e.message.from?.username;
        fname = e.message.from?.first_name;
    }
    const _user = User.get(uid, chat.id, "pending");
    if(!_user) return;
    if(_user.userid === uid)
    {
        //User is permitted, accept the user
        bot.api.restrictChatMember(_user.groupid, uid, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_send_polls: true}).catch(err => {ReportError(JSON.stringify(err))});
        bot.api.editMessageText(_user.groupid, _user.msgid, `✅Thank you ${UserOrName(fname!, uname)} for reading the rules! You are now allowed to talk :3 I hope you have fun here ;3\n\nYou can always read the rules here, they will be updated from time to time`, {reply_markup: markup}).catch(err => {ReportError(JSON.stringify(err))});
        User.remove(_user.userid, _user.groupid, "pending");
        User.set(_user.userid, _user.groupid, _user.msgid, "accepted");

    }
    
    // if(userAccepted === undefined) await dat(`INSERT INTO accepted VALUES("${uname}", "${uid}")`);
    // else e.reply("You already accepted the rules, no need to worry :3");
    // getMessageId(uid).then(msgid => {
    //     if(typeof msgid == null)
    //     {
    //         ReportError("Konnte User nicht freigeben");
    //         e.reply("There was an error, probably because the welcome message doesn't exist anymore. A report to ${OwnerAt} got send");
    //         return false;
    //     }
    //     else
    //     {
    //         bot.api.restrictChatMember(groups[1].id, uid, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_send_polls: true});
    //         bot.api.editMessageText(
    //             groups[1].id, msgid, `✅Thank you ${uname ? `@${uname}` : fname} for reading the rules! You are now allowed to talk :3 I hope you have fun here ;3\n\nYou can always read the rules here, they will be updated from time to time`, {reply_markup: markup})
    //           .catch(err => { ReportError(err); e.reply(`Couldn't proceed. Report to the admin was sent`); });
    //     }
    // }).catch(err => { 
    //     ReportError(err); e.reply(`An error occurred while getting the data: ${err}\n\nThe bot can't alter the welcome message anymore, but the user will still be accepted`);
    //     bot.api.restrictChatMember(groups[1].id, uid, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_send_polls: true});
    //     bot.api.sendMessage(groups[1].id, `✅Thank you ${uname ? `@${uname}` : fname} for reading the rules! You are now allowed to talk :3 I hope you have fun here ;3\n\nYou can always read the rules here, they will be updated from time to time`, {reply_markup: markup})
    //     .catch(err => { ReportError(err); e.reply(`Couldn't proceed. Report to the admin was sent`); });
//  });
};

/**
 * @deprecated please use JSON
 * @param Befehl 
 * @param params 
 * @returns any
 */
export const dat = async (Befehl: string, params?: any[]) =>
{
    let con;
    try
    {
        const pool = mariadb.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWD,
            database: process.env.DB_DB
        });
    
        con = await pool.getConnection();
        let result = await con.query(Befehl, params);
        await pool.end();
        return result as any[];
    }
    catch(err)
    {
        ReportError(JSON.stringify(err));
        throw err;
    }
    finally {
        if(con) con.release();
    }
}

export const Rules = async (e: Context) => {
    const inlineKeyboard = new InlineKeyboard()
    .url("📋 Read the rules", `https://t.me/${bot.botInfo.username}`).row();
    e.reply(`Please read the following help here: ${RulesURL}`, {reply_to_message_id: e.message?.message_id, reply_markup: inlineKeyboard}).catch(err => ReportError(err));
};