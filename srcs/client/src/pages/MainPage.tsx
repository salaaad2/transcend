import './MainPage.css'
import { Redirect } from 'react-router';
import { useUser } from '../components/context/UserAuthContext';
import axios from 'axios';
import { SocketContext } from '../socket/context'
import React from 'react';

function MainPage(props: any) {
    const { user, setUser } = useUser()!;
    const socket = React.useContext(SocketContext);

    async function getUser(): Promise<any> {
        let user: any = null;
        await axios.get('/authentication/logged')
                   .then((res) => {
                       if (res.data)
                       {
                           user.username = res.data.username;
                           user.id = res.data.id;
                           setUser(user);
                           socket.emit('login', user.username);
                       }
                       else
                           user = null;
                       return (user);
                   })
                   .catch(() => {});
        return (user);
    }

    if (user.id > 0)
    {
        /* return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />); */
        return (<div><p>Username {user.username} id {user.id}</p></div>)
    }
    else
    {
        const user: any = getUser();
            /* return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />); */
        if (user != null)
                return (<div><p>Username {user.username} id {user.id}</p></div>)
        else
            return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
    }
}

export default MainPage;
