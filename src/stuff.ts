import {Context, InlineKeyboard} from "grammy";
import { LabeledPrice } from "@grammyjs/types";
import {bot} from "./index";

import Crypto from "crypto";

const prices: LabeledPrice[] = [
    {
        amount: 100,
        label: "A little tip"
    },
    {
        amount: 200,
        label: "Spend me a coffee"
    },
    {
        amount: 500,
        label: "Launch for my programming energy"
    }
];

const description =
"Thank you for supporting my bot.\n"
+"It really took some nights to complete all of this\n"
+"and I'm really glad that you're supporting me.\n"
+"My goal is to create a group/channel for people\n"
+"to chat about ***REMOVED*** and furry related topics\n"
+"and to live together in a community of piece.\n";

export const donate = async (ctx: Context) => {
    if(ctx.chat?.type != "private") return ctx.reply("This command can only be used in a private chat.");

    const donate = new InlineKeyboard()
    .pay("Donate now").row()
    .text("Donate now", "donate").row()
    .url("Donate", "https://www.paypal.me/VenPal").row();

    

    ctx.reply("***REMOVED*** is a free bot, but if you want to support the development of this bot, you can donate here:\n\n"
    + "You can donate with PayPal or Telegram.\n\n"
    + "PayPal: https://paypal.me/VenPal\n"
    + "VenBot is a non-profit organization, so donations are not tax-deductible.\n"
    + "If you would like to donate to a charity, please donate to them instead.", {reply_to_message_id: ctx.message?.message_id, reply_markup: donate});
};

bot.callbackQuery("donate", async ctx => {
    await ctx.answerCallbackQuery({
        text: "Donating..."
    });

    ctx.replyWithInvoice("Donation", description, genPayloads(), process.env.PAY_TOKEN as string, "EUR", prices);
});


const genPayloads = (): string => Crypto.randomBytes(128).toString();