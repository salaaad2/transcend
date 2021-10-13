import React, { useEffect } from "react";
import { SocketContext } from "../socket/context";
import { useUser, defaultUser } from '../components/context/UserAuthContext';
import axios from "axios";


function Logout(props: any) {

    const socket = React.useContext(SocketContext);
    const { user, setUser } = useUser()!;

    useEffect(() => {
        if (user.id > 0 && user.username.length > 0)
        {
            axios.post(`/authentication/log-out`, { withCredentials: true})
                 .then(() => {
                     setUser(defaultUser);
                     socket.emit('logout', user.username);
                     socket.off();
                     props.history.push('/login');
                 })
        }
        else
        {
            props.history.push('/login');
        }
    })
    return (<div/>);
}

export default Logout
