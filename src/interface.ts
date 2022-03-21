import { TGroups } from "./vars";


/**
 * @deprecated please use {@link user} instead
 */
export interface users 
{
    userid: number;
    msgid: number
}

export interface user
{
    userid: number;
    msgid: number;
    groupid: number;
    group: TGroups
}

export interface Banned_User
{
    userid: number;
    username?: string;
    Name: string;
    Reason?: string;
    Date: string;
    Message_ID?: number;
}

export interface WarnList
{
    userid: number;
    warnings: {
        Timestamp: string,
        Length: string,
        Reason: string,
        Exprieable: boolean
    }[];
    kicks: number;
}

export interface MuteList
{
    userid: number;
    
}