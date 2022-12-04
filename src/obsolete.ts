import fs from "fs";
import path from "path";
import { users } from "./interface";

/**
 * @deprecated please use {@link User} instead
 */
export const changeList = {
    add: async function(userid: number, msgid:number)
    {
        let data = await JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "users.json"), "utf8")) as users[];
        data.push({userid: userid, msgid: msgid});
        fs.writeFileSync(path.join(__dirname, "..", "data", "users.json"), JSON.stringify(data, null, 4));
        return;
    },
    delete: async function(userid: number)
    {
        let data = await JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "users.json"), "utf8")) as users[];
        data = await data.filter((obj:any) =>  { return obj.userid !== userid; });
        fs.writeFileSync(path.join(__dirname, "..", "data", "users.json"), JSON.stringify(data, null, 4))
        return;
    },
    get: function(userid: number)
    {
        let data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "users.json"), "utf8")) as users[];
        data = data.filter((obj:any) =>  { return obj.userid == userid; });
        return data;
    }
};

export const usersWhoNeedToAccept = {
    has: (userid: number) =>
    {
        let _tmp = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "uwnta.json"), "utf8")) as number[];
        if(_tmp.includes(userid)) return true;
        return false;
    },
    add: (userid: number) => 
    {
        let data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "uwnta.json"), "utf8")) as number[];
        data.push(userid);
        fs.writeFileSync(path.join(__dirname, "..", "data", "uwnta.json"), JSON.stringify(data, null, 4));
        return true;
    },
    delete: (userid: number) =>
    {
        let data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "uwnta.json"), "utf8")) as number[];
        data = data.filter((obj:any) =>  { return obj !== userid; });
        fs.writeFileSync(path.join(__dirname, "..", "data", "uwnta.json"), JSON.stringify(data, null, 4))
        return;
    },
    getAll: () => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "uwnta.json"), "utf8")) as number[]
};