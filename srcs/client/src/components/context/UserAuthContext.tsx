import React from 'react';
import IUser from '../interface/IUser';


export const defaultUser = {
    id: -1,
    username: "",
    wins: 0,
    losses: 0,
    friendlist: ["", ""],
    blocklist: ["", ""],
    elo: 0,
    status: 'online',
    avatar: "",
    currentChannel: "General",
    chanslist: ["", ""],
    friendrequests: [""],
    theme: 0,
};

type UserContextType = {
    user: IUser;
    setUser: (value: IUser) => void;
};

export const UserContext = React.createContext<UserContextType|undefined>(undefined);

type Props = {
  children: React.ReactNode;
};
export const UserProvider = ({ children }: Props) => {
  const [user, setUser] = React.useState(defaultUser);
  return (
    <UserContext.Provider value={{user, setUser}}>
        {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);
