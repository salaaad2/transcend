import io from "socket.io-client";
import React from "react";

export const socket = io(`${process.env.REACT_APP_BASE_URL}`);
export const SocketContext = React.createContext< any | undefined>(undefined);
