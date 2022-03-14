import fs from "fs";
import path from "path";
import { user } from "./interface";
import { Groups } from "./vars";

export const getFile = (file: "pending" | "accepted") =>
{
    let p!:string;
    if(file === "pending") p = path.join(__dirname, "..", "pending.json");
    if(file === "accepted") p = path.join(__dirname, "..", "accepted.json");
    if(!fs.existsSync(p)) fs.writeFileSync(p, "[]");
    
    return JSON.parse(fs.readFileSync(p, "utf8")) as user[];
}

export const User = 
{
    get: (id: number, chatid: number, file: "pending" | "accepted") =>
    {
        const users = getFile(file);

        let user = users.find(i => i.userid === id && i.groupid === chatid);
        return user;

    },

    /**
     * 
     * Returns an array with all the groups, the user is in and if he has accepted, if the user is not found, it will return an empty array
     * @param uid
     */
    groups: (uid: number) =>
    {
        const acceptedUsers = getFile("accepted");
        const pendingUsers = getFile("pending");

        //Returns all groups that the user is in and if they are pending or accepted
        let accepted = acceptedUsers.filter(i => i.userid === uid).map(i => ({ groupid: i.groupid, group: i.group, msgid: i.msgid, accepted: true }));
        let pending = pendingUsers.filter(i => i.userid === uid).map(i => ({ groupid: i.groupid, group: i.group, msgid: i.msgid, accepted: false }));

        return [...accepted, ...pending];
    },
    
    set: (id: number, chatid: number, msgid: number, file: "pending" | "accepted") =>
    {
        const users = getFile(file);
        const Group = Groups.find(i => i.id === chatid);
        if(Group === undefined) return null;
        let user = users.find(i => i.userid === id && i.groupid === chatid);
        if(user === undefined)
        {
            //Check if 
            users.push({ userid: id, groupid: chatid, group: Group!.name, msgid: msgid});
            fs.writeFileSync(path.join(__dirname, "..", file + ".json"), JSON.stringify(users));
        }
    },
    remove: (id: number, chatid: number, file: "pending" | "accepted") =>
    {
        const users = getFile(file);
        let user = users.find(i => i.userid === id && i.groupid === chatid);
        if(user === undefined) return null;

        users.splice(users.indexOf(user), 1);
        fs.writeFileSync(path.join(__dirname, "..", file + ".json"), JSON.stringify(users));
    }
}

export default User;