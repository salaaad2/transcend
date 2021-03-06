import React, { useState } from 'react';
import { useEffect } from 'react';
import MainNavBar from '../components/layout/MainNavBar';
import { SocketContext } from '../socket/context';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router-dom';

function GameLobby(props: any): any {

    const socket = React.useContext(SocketContext);
    const { user } = useUser()!;
    const [isWaiting, setisWaiting] = useState(true);

    if (user.id > 0) {
        socket.emit('login', user.username);
    }
    
    useEffect(() => {
        if (user.id > 0 && user.username.length > 0 && user.status !== "ingame")
        {
            socket.emit('newplayer', user.username);
            socket.on('nb_players', (data: {username:string[], nb: number}) => {
                if (data.nb % 2 === 0 && data.username.includes(user.username)) {
                    socket.emit('game_on', user.username);
                    socket.on('active_players', (player: {playername: string, index: number, id: number}) => {
                        setisWaiting(false);
                        user.status = "ingame";
                        socket.emit('rm_from_lobby', user.username);
                        props.history.push(`/game/:${player.id}`);
                    })
                }
                else
                    setisWaiting(true);
            })
            return (() => {
                socket.emit('player_leave', user.username);
                socket.off('nb_players');
                socket.off('active_players');
            })
        }
    }, [])  // eslint-disable-line react-hooks/exhaustive-deps

    if (user.id > 0 && user.username.length > 0 && user.status !== "ingame")
        return (
            <>
                <MainNavBar />
                {isWaiting ? 
                <div className="waiting-div d-flex align-items-center">
                <div className="spinner-border" style={{width: '3rem', height: '3rem'}} role="status"></div>
                <strong className="waiting">Waiting for opponent...</strong>
              </div> : <></>}
            </>
        )
    else if (user.id > 0 && user.username.length > 0)
        return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
    else
    {
        props.history.push('/login');
        return (<div/>)
    }
}

export default GameLobby;
