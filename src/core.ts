import {Context} from "grammy";
import { WarnList } from "./interface";
import fs from "fs";
import { add, differenceInYears } from "date-fns";
import { bot } from ".";
import { GroupID } from "./vars.js";
import path from "path";

export const getArgs = (e: Context) => {
    if(e.message === undefined) return null;
    if(e.message.text === undefined) return null;
    
    
    return e.message.text.split(" ");
}

export const or = (
    ...items: Array<{diff: unknown, unit: string}>
) => items.find(value => value.diff)

export const getWarnList = async () => await JSON.parse(fs.readFileSync(path.join(__dirname, "..", "warn.JSON"), "utf8")) as WarnList[];
export const setWarnList = (list: WarnList[]) => fs.writeFileSync(path.join(__dirname, "..", "warn.JSON"), JSON.stringify(list));

export const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const ParseDate = async (date: string) =>
{
    if(date === undefined) throw null;
    let found = false;
    validTime.forEach(i => { if(date.endsWith(i))  { found = true; } });
    if(!found) throw `No valid Time. Time may be only ${validTime.join(", ")}!`;
    let time = new Date();

    if(date.endsWith("m")) time = add(time, { minutes: parseInt(date.substring(0, date.length - 1)) });
    if(date.endsWith("h")) time = add(time, { hours: parseInt(date.substring(0, date.length - 1)) });
    if(date.endsWith("d")) time = add(time, { days: parseInt(date.substring(0, date.length - 1)) });
    if(date.endsWith("M")) time = add(time, { months: parseInt(date.substring(0, date.length - 1)) });
    if(date.endsWith("Y")) time = add(time, { years: parseInt(date.substring(0, date.length - 1)) });

    if(differenceInYears(time, new Date()) > 1) bot.api.sendMessage(GroupID,"⚠️⚠️If user is banned/restricted for more than 366 days or less than 30 seconds from the current time they are considered to be banned/restricted forever⚠️⚠️");
    return time;
}

export const UserOrName = (Name: string, Username?: string) => Username === undefined ? Name : "@"+Username;

const validTime = 
[
    "m",
    "h",
    "d",
    "M",
    "Y"
]