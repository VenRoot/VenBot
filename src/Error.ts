import { Context } from "grammy";
import {bot} from "./index";
import {VenID} from "./vars.js";
import fs from "fs";

process.on('uncaughtException', (err: Context) => {
  ReportError(err);
  process.kill(process.pid, 'SIGINT');
});


export const ReportError = (e: Context|string) =>
{
  console.warn("Error wird geworfen", e);
  bot.api.sendMessage(VenID, JSON.stringify(e));
}