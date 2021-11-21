import {Context} from "grammy"
import { bot } from ".";
import { ReportError } from "./Error";
import {} from "."
import { dat } from "./Group";
import {add, differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths, differenceInWeeks, differenceInYears, isBefore} from "date-fns";
import { getArgs, getWarnList, or, ParseDate, setWarnList, UserOrName } from "./core";
import { GroupID } from "./vars";

import fs from "fs";
import { WarnList } from "./interface";

export const Ban = async (e: Context, global: boolean) => 
{
    if(!(await checkAdmin(e).catch(e => ReportError(e)))) return;
    if(e.message === undefined) return null;
    if(e.message.from === undefined) return null;
    if(e.message.reply_to_message === undefined) return null;
    if(e.message.reply_to_message.from === undefined) return null;
    const chat = await e.getChat();
    if(chat.type != "supergroup") return null;

    const user = e.message.reply_to_message.from.username;
    const name = e.message.reply_to_message.from.first_name;
    const userid = e.message.reply_to_message.from.id;
    
    await dat(`INSERT INTO banned_users VALUES("${user}", "${userid}", "${chat.id}")`).catch(i => {ReportError(i); });
    const User = UserOrName(name, user);
    bot.api.sendMessage(userid?.toString() as string, `Hey ${User}, you were banned from ${chat.title}`).catch(i =>  ReportError(i));
}

export const Kick = async (e: Context, global: boolean) =>
{
    if(!(await checkAdmin(e).catch(e => ReportError(e)))) return;
    if(e.message === undefined) return null;
    if(e.message.from === undefined) return null;
    if(e.message.reply_to_message === undefined) return null;
    if(e.message.reply_to_message.from === undefined) return null;
    if(e.message.text === undefined) return null;
    let chat = await e.getChat();
    if(chat.type != "supergroup") return null;

    let date = await ParseDate(e.message.text.split(" ")[1]).catch(i => {ReportError(i);}) as Date;

    const user = e.message.reply_to_message.from.username;
    const name = e.message.reply_to_message.from.first_name;
    const userid = e.message.reply_to_message.from.id;
    bot.api.banChatMember(chat.id, userid, {until_date: parseInt((date.getTime()/1000).toFixed(0))}).catch(i => {ReportError(i);});
    const newDate = new Date();
    const _ = or({diff: differenceInMonths(date, newDate), unit: "months"}, {diff: differenceInWeeks(date, newDate), unit: "weeks"}, {diff: differenceInDays(date, newDate), unit: "days"}, {diff: differenceInHours(date, newDate), unit: "hours"}, {diff: differenceInMinutes(date, newDate), unit: "minutes"});
    const User = UserOrName(name, user)
    bot.api.sendMessage(userid.toString() as string, `Hey ${User}, you were temporarily banned from ${chat.title} for ${_?.diff} ${_?.unit}. `).catch(i =>  ReportError(i));
}

const checkAdmin = async (e: Context) =>
{
    if(e.message === undefined) throw null;
    if(e.message.from === undefined) throw null;
    let Admins = await getAdmins(e).catch(i =>ReportError(i));
    if(Admins === undefined) throw ReportError(e);
    let adminFound = false;
    //console.log("Nachricht von ");console.log(e.update.message.from);
    for (var i = 0; i < Admins.length; i++) {
      //console.log("Admin "+i); console.log(Admins[i].user);

      if((Admins[i].user.id == e.message.from.id))
      {
        //console.log("ER IST ADMIN");
        adminFound = true;
        return true;
      }
    }
    if(!adminFound)
    {
      e.reply("Permission denied", {reply_to_message_id: e.message.message_id}).catch(i => ReportError(i));
      return false;
    }
}

const getAdmins = async (temp1: Context) => 
{
    if(temp1 === undefined) throw null;
    if(temp1.chat === undefined) throw null;
    
    let admins = await bot.api.getChatAdministrators(temp1.chat.id).catch(e => { ReportError(e);});
    return admins;
}

export const Mute = async (e: Context) =>
{
  if(!(await checkAdmin(e).catch(e => ReportError(e)))) return;
  const args = getArgs(e);
  if(args == null) return null;
  if(e.message === undefined) return null;
  if(e.message.text === undefined) return null;
  if(e.message.from === undefined) return null;
  if(e.message.reply_to_message === undefined) return null;
  if(e.message.reply_to_message.from === undefined) return null;
  if(e.chat === undefined) return null;
  if(e.chat.type != "supergroup") return null;
  if(args.length < 2) return e.reply("Please specify a time and a reason");
  if(args.length < 3) return e.reply("Please specify a reason");
  if(e.message?.reply_to_message === undefined) return e.reply("Please reply to a message to mute", {reply_to_message_id: e.message?.message_id});

  let date = await ParseDate(e.message.text.split(" ")[1]).catch(i => {ReportError(i);}) as Date;
  let newDate = new Date();
  bot.api.restrictChatMember(e.chat.id, e.message.reply_to_message.from.id, {can_send_messages: false, can_send_media_messages: false, can_send_other_messages: false, can_add_web_page_previews: false}, {until_date: parseInt((date.getTime()/1000).toFixed(0))}).catch(i => {ReportError(i);});
  const _ = or({diff: differenceInMonths(date, newDate), unit: "months"}, {diff: differenceInWeeks(date, newDate), unit: "weeks"}, {diff: differenceInDays(date, newDate), unit: "days"}, {diff: differenceInHours(date, newDate), unit: "hours"}, {diff: differenceInMinutes(date, newDate), unit: "minutes"});
  if(_ == undefined) return e.reply("Please specify a time");
  e.reply(`Muted ${e.message.reply_to_message.from.first_name} for ${_.diff} ${_.unit}.\n\nThey will be able to speak again at ${date.toLocaleString("de")}`).catch(i => ReportError(i));
};

export const Unmute = async (e: Context) =>
{
  if(!(await checkAdmin(e).catch(e => ReportError(e)))) return;
  const args = getArgs(e);
  if(args == null) return null;
  if(e.message === undefined) return null;
  if(e.message.text === undefined) return null;
  if(e.message.from === undefined) return null;
  if(e.message.reply_to_message === undefined) return e.reply("Please reply to a user to unmute them");
  if(e.message.reply_to_message.from === undefined) return null;
  if(e.chat === undefined) return null;
  if(e.chat.type != "supergroup") return null;

  bot.api.restrictChatMember(e.chat.id, e.message.reply_to_message.from.id, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true}).catch(i => {ReportError(i);});
  const User = UserOrName(e.message.reply_to_message.from.first_name, e.message.reply_to_message.from.username);
  e.reply(`${User} may now speak again!`).catch(i => ReportError(i));
};

export const warn = async (e: Context) =>
{
  if(!(await checkAdmin(e).catch(e => ReportError(e)))) return;
  const args = getArgs(e);
  if(args == null) return null;
  if(e.message === undefined) return null;
  if(e.message.text === undefined) return null;
  if(e.message.from === undefined) return null;
  if(e.message.reply_to_message === undefined) return null;
  if(e.message.reply_to_message.from === undefined) return null;
  if(e.chat === undefined) return null;
  if(e.chat.type != "supergroup") return null;
  if(args.length < 2) return e.reply("Please specify a time and a reason");
  if(args.length < 3) return e.reply("Please specify a reason");
  if(e.message?.reply_to_message === undefined) return e.reply("Please reply to a message to warn", {reply_to_message_id: e.message?.message_id});

  let date = await ParseDate(e.message.text.split(" ")[1]).catch(i => {ReportError(i);}) as Date;
  let newDate = new Date();
  const _ = or({diff: differenceInMonths(date, newDate), unit: "months"}, {diff: differenceInWeeks(date, newDate), unit: "weeks"}, {diff: differenceInDays(date, newDate), unit: "days"}, {diff: differenceInHours(date, newDate), unit: "hours"}, {diff: differenceInMinutes(date, newDate), unit: "minutes"});
  const User = UserOrName(e.message.reply_to_message.from.first_name, e.message.reply_to_message.from.username)
  let warnlist = await getWarnList();
  const userid = e.message.reply_to_message.from.id;
  const Length = await ParseDate(e.message.text);
  const Reason = e.message.text.split(" ").slice(2).join(" ");

  //Check if user is already warned, if so, add a warning to the user, if not, create a new entry
  let found = false;
  for(var i = 0; i < warnlist.length; i++)
  {
    if(warnlist[i].userid == userid)
    {
      warnlist[i].warnings.push({
        Timestamp: date.toISOString(),
        Reason: Reason,
        Length: Length.toISOString(),
        Exprieable: true
      });
      found = true;
      break;
    }
  }
  if(!found) warnlist.push({userid: userid, warnings: [{
    Timestamp: date.toISOString(),
    Reason: Reason,
    Length: Length.toISOString(),
    Exprieable: true
  }], kicks: 0});

  const userwarn = warnlist.filter(i => i.userid == userid)[0];
  //Check how many warnings the user has, if more than 3, ban the user for 2 weeks. If the user reaches 6 warnings, ban the user forever.
  if(userwarn.warnings.length == 3)
  {
    //Der Benutzer hatte 3 Warnungen, wir banen ihn für 2 Wochen
    const date = add(new Date(), {days: 14});
    e.reply(`User ${User} reached 3 Warnings! They will be banned for 2 weeks and be able to join the group again at ${date.toLocaleString("de")} CentralEuropeanTime (UTC+1)!\n\n`);
    bot.api.banChatMember(e.chat.id, userid, {until_date: parseInt((date.getTime()/1000).toFixed(0))}).catch(i => {ReportError(i);});
    userwarn.kicks++;
    userwarn.warnings.forEach(i => {i.Exprieable = false});
    setWarnList(warnlist);
    return;
  }
  if(userwarn.warnings.length == 6)
  {
    //Der Benutzer hatte 6 Warnungen, wir banen ihn für immer
    e.reply(`User ${User} reached 6 Warnings and will be permenantly banned from the group\n\n`);
    bot.api.banChatMember(e.chat.id, userid).catch(i => {ReportError(i);});
    userwarn.kicks++;
    userwarn.warnings.forEach(i => {i.Exprieable = false});
    setWarnList(warnlist);
    return;
  }
  
  if(userwarn.warnings.length == 0) e.reply(`User ${User} recieved their first warning!\n\nThe warning will expire in ${_?.diff} ${_?.unit}!!\n\nReason for the warning: ${Reason}\n\nYou can always check your warnings with /warnings`);
  else e.reply(`User ${User} recieved their ${userwarn.warnings.length}. warning!\n\nThe warning will expire in ${_?.diff} ${_?.unit}!!\n\nReason for the warning: ${Reason}\n\nYou can always check your warnings with /warnings`);
  setWarnList(warnlist);
}

