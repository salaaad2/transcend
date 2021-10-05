import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { SocketContext } from "../socket/context";
import { useUser, defaultUser } from '../components/context/UserAuthContext';
import axios from "axios";


function Logout(props: any) {

    const socket = React.useContext(SocketContext);
    const { user, setUser } = useUser()!;

    useEffect(() => {
        if (user.id > 0 && user.username.length > 0)
        {
            socket.emit('logout', user.username);
            socket.off();
            axios.post(`/authentication/log-out`, {})
                 .then((response) => {
                     console.log(response.data);
                     setUser(defaultUser);
                     props.history.push('/login');
                 })
        }
    }, [])

    if (user.id > 0 && user.username.length > 0)
        return (<div/>);
    else
        return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
}

export default Logout
