import React from 'react';
import { useEffect } from 'react';
import { SocketContext } from "../socket/context";
import { useUser, defaultUser } from '../components/context/UserAuthContext';
import axios from 'axios';
import { Redirect } from 'react-router-dom';


function LogoutPage(props: any):any {

    const socket = React.useContext(SocketContext);
    const { user, setUser } = useUser()!;

    useEffect(() => {
        if (user.id > 0 && user.username.length > 0)
        {
            axios.post('/authentication/log-out', { withCredentials: true})
                 .then(() => {
                     socket.emit('logout', user.username);
                     setUser(defaultUser);
                     socket.off();
                 })
        }
    })
    return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
}

export default LogoutPage;
