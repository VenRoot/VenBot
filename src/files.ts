import fs from "fs";
import path from "path";
import { bot } from ".";
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

export const setFile = (file: "pending" | "accepted", data: user[]) => fs.writeFileSync(path.join(__dirname, "..", file + ".json"), JSON.stringify(data, null, 4));

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
        if(Group === undefined) {console.error("No group"); return null; }
        let user = users.find(i => i.userid === id && i.groupid === chatid);
        if(user)
        {
            // Remove the user from the pending list
            const index = users.indexOf(user);
            if(index > -1) users.splice(index, 1);
            
            //Try to remove the old welcome message
            bot.api.deleteMessage(chatid, user.msgid).catch(e => console.error(e));
            

            users.push({ userid: id, groupid: chatid, group: Group!.name, msgid: msgid});
            setFile(file, users);
        }
        if(user === undefined)
        {
            //Check if 
            users.push({ userid: id, groupid: chatid, group: Group!.name, msgid: msgid});
            setFile(file, users);
        }
    },
    remove: (id: number, chatid: number, file: "pending" | "accepted") =>
    {
        const users = getFile(file);
        let user = users.find(i => i.userid === id && i.groupid === chatid);
        if(user === undefined) return null;

        users.splice(users.indexOf(user), 1);
        setFile(file, users);
    }
}

export default User;