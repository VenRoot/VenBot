import { getWarnList, UserOrName } from "./core";
import {Context, InlineKeyboard} from "grammy";
import { ReportError } from "./Error";
import { bot, log } from ".";
import { GroupName } from "./vars";

export const Warnings = async (e: Context) =>
{
  if(e.message === undefined) return null;
  if(e.message.from === undefined) return null;
  let User = UserOrName(e.message.from.first_name, e.message.from.username);

  let text = `Warnings for ${User}: \n\n`;

  const warnlist = await getWarnList();
  const userwarn_ = warnlist.filter(i => i.userid == e.message?.from?.id)
  if(userwarn_.length == 0) return e.reply(`You have no warnings!`);
  const userwarn = userwarn_[0];
  if(userwarn.warnings.length == 0) return e.reply(`${User} has no warnings, keep it up like that ;3`, {reply_to_message_id: e.message?.message_id});
  else userwarn.warnings.forEach(i => {
    

    if(i.Exprieable && new Date(i.Length).getTime() < new Date().getTime())
    {
      text += `<s>${i.Timestamp}: ${i.Reason}</s>\n\n`;
    }
    else text += `${i.Timestamp}: ${i.Reason}\nWill expire: ${i.Length}\n\n`;
  });

  e.reply(text, {parse_mode: "HTML", reply_to_message_id: e.message?.message_id});
  return;
};

export const Report = async (e: Context) => 
{
    if(e.message === undefined) return null;
    if(e.message.from === undefined) return null;

    
    if(e.message.reply_to_message === undefined)
    {
        return e.reply("Please reply to another message with /report to report it").catch(i => ReportError(i));
    }
    if(e.message.reply_to_message.from == undefined) return null;
    //console.log(e);
    let chat = await e.getChat();
    if(chat.type != "supergroup") return e.reply("You can't report a message in a private chat!");
    let text = `INCOMING USER REPORT!\n\n`;
    text += `Chat: ${chat.title}\n`;
    text += `Requester:\n`;
    text += `User: ${e.message.from.first_name} ${e.message.from.last_name}\n`;
    if(e.message.from.username !== undefined) text += `Username: @${e.message.from.username}\n`;
    text += `User ID: ${e.message.from.id}\n`;

    text += `Reported User:\n`;
    text += `User: ${e.message.reply_to_message.from.first_name} ${e.message.reply_to_message.from.last_name}\n`;
    if(e.message.reply_to_message.from.username !== undefined) text += `Username: @${e.message.reply_to_message.from.username}\n`;
    text += `User ID: ${e.message.reply_to_message.from.id}\n`;
    text += `Message ID: ${e.message.reply_to_message.message_id}\n`;
    text += `Message: ${e.message.reply_to_message.text}\n`;

    const inlineKeyboard = new InlineKeyboard()
    .url("Go to message", `https://t.me/${GroupName}/${e.message.message_id}`).row();

    // let text = `REPORT!\n User: @${e.message.from.username} | ${e.update.message.from.id}\n\nREPORTED USER\n\nUSERNAME: @${e.update.message.reply_to_message.from.username}\nID: ${e.update.message.reply_to_message.from.id}\nMESSAGE:${e.update.message.reply_to_message.text}\n\nSee the message here: https://t.me/c/${chat.id.toString().slice(4)}/${e.message.message_id}`;
    //     let text = `@${e.update.message.from.username} with the User ID ${e.update.message.from.id} reported following message by @${e.update.message.reply_to_message.from.username} with the ID ${e.update.message.reply_to_message.from.id} who posted following message: ${e.update.message.reply_to_message.text
    // }`;
  //bot.telegram.sendMessage(e.message.from.first_name, "Hallo");
  let Admins = (await e.getChatAdministrators()).filter(i => i.user.is_bot == false);

  log(Admins);
  log(await e.getChatAdministrators());
  for (var i = 0; i < Admins.length; i++) {
    
    bot.api.sendMessage(Admins[i].user.id, text, {reply_markup: inlineKeyboard}).catch(i => ReportError(i));
    bot.api.forwardMessage(Admins[i].user.id, chat.id, e.message.message_id).catch(i => ReportError(i));
  }
  if(Admins.length == 0) return e.reply("No admins in this chat!");
  e.reply("A report to the admins was sent successfully!");
  return true;
}


export const getList = async (e: Context) =>
{

};