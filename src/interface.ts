export interface users 
{
    userid: number;
    msgid: number
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