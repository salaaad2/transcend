interface IUser {
    id: number;
    username: string;
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
    theme: number;
}

export default IUser;
