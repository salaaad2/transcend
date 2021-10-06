interface IUser {
    id: number;
    username: string;
    realname: string;
    wins: number;
    losses: number;
    friendlist: string[];
    blocklist: string[];
    elo: number;
    status: string;
    avatar: string;
    currentChannel: string;
    chanslist: string[];
    friendrequests: string[];
    pv_msg_notifs: string[];
    theme: number;
    isOtpEnabled: boolean;
}

export default IUser;
