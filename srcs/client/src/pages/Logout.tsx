import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { SocketContext } from "../socket/context";
import { useUser, defaultUser } from '../components/context/UserAuthContext';
import axios from "axios";


function Logout(props: any) {

    const socket = React.useContext(SocketContext);
    const { user, setUser } = useUser()!;

    useEffect(() => {
        console.log('logout');
        socket.emit('logout', user.username);
        socket.off();
        axios.post(`${process.env.REACT_APP_BASE_URL}/authentication/log-out`, {})
        .then((response) => {
            console.log(response.data);
            setUser(defaultUser);
            props.history.push('/login');
        })
    }, [])

    return (<div/>);
}

export default Logout
