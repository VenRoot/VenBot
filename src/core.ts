import {Context} from "grammy";
import { Banned_User, tinyUser, WarnList } from "./interface";
import fs from "fs";
import { add, differenceInYears } from "date-fns";
import { bot } from ".";
import path from "path";

export const getArgs = (e: Context) => e?.message?.text?.split(" ");

export const or = (
    ...items: Array<{diff: number, unit: string}>
) => items.find(value => value.diff)

/**
 * 
 * @deprecated please use {@link getList} instead
 */
export const getWarnList = () => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "warn.json"), "utf8")) as WarnList[];

/**
 * 
 * @param list 
 * @deprecated please use {@link setList} instead
 */
export const setWarnList = (list: WarnList[]) => fs.writeFileSync(path.join(__dirname, "..", "warn.json"), JSON.stringify(list));

export const getList = (list: "warn" | "banned" | "user"): Banned_User[] | WarnList[] | tinyUser[] =>
{
    let p = path.join(__dirname, "..", list + ".json");
    if(!fs.existsSync(p)) fs.writeFileSync(p, "[]");
    return JSON.parse(fs.readFileSync(p, "utf8"));
}

export const setList = (list: "warn" | "banned" | "user", data: Banned_User[] | WarnList[] | tinyUser[]) => fs.writeFileSync(path.join(__dirname, "..", list + ".json"), JSON.stringify(data));

/**
 * 
 * @param min minimal value
 * @param max maximum value
 * @param exclude array of numbers to exclude 
 * @returns a random number
 */
export const random = (min: number, max: number, exclude?: number[]) => 
{
    if(exclude?.length == max) return exclude[Math.floor(Math.random() * exclude.length)];
    let r = Math.floor(Math.random() * (max - min + 1)) + min;
    while(exclude?.includes(r)) r = Math.floor(Math.random() * (max - min + 1)) + min;
    return r;
}
export const addUser = async (e: Context) => {
    let chat = await e.getChat();
    if(!e.from) return;
    if(chat.type != "supergroup") return;
    
    let list = getList("user") as tinyUser[];
    if(list.find(i => i.userid == e.from!.id && i.groupid == chat.id)) return;
    list.push({userid: e.from.id, groupid: chat.id});
    setList("user", list);
};

export const ParseDate = async(date: string, chat: number) =>
{
    console.log(date,chat);
    if(date === undefined) throw null;
    let found = false;
    validTime.forEach(i => { if (date.endsWith(i)) { found = true; } });
    if(!found) Promise.reject(new Error(`No valid Time. Time may be only ${validTime.join(", ")}!`));
    let time = new Date();

    if(date.endsWith("m")) time = add(time, { minutes: parseInt(date.substring(0, date.length - 1)) });
    if(date.endsWith("h")) time = add(time, { hours: parseInt(date.substring(0, date.length - 1)) });
    if(date.endsWith("d")) time = add(time, { days: parseInt(date.substring(0, date.length - 1)) });
    if(date.endsWith("M")) time = add(time, { months: parseInt(date.substring(0, date.length - 1)) });
    if(date.endsWith("Y")) time = add(time, { years: parseInt(date.substring(0, date.length - 1)) });

    if(differenceInYears(time, new Date()) > 1) bot.api.sendMessage(chat,"⚠️⚠️If user is banned/restricted for more than 366 days or less than 1 minute from the current time they are considered to be banned/restricted forever⚠️⚠️");
    return time;
}

export const UserOrName = (Name: string, Username?: string) => Username ? "@"+Username : Name;

const validTime = 
[
    "m",
    "h",
    "d",
    "M",
    "Y"
]