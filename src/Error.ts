import { Context } from "grammy";
import {bot} from "./index";
import {GroupID, VenID} from "./vars";
import fs from "fs";

process.on('uncaughtException', (err: Context) => {
  ReportError(err);
  process.kill(process.pid, 'SIGINT');
});


export const ReportError = (e: Context|string) =>
{
  console.warn("Error wird geworfen", e);
  console.debug(process.env);
  bot.api.sendMessage(VenID, JSON.stringify(e));
}