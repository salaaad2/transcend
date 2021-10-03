import React, { useState } from 'react';
import { useEffect } from 'react';
import MainNavBar from '../components/layout/MainNavBar';
import { SocketContext } from '../socket/context';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect  }from 'react-router';

function GameLobby(props: any): any {

    const socket = React.useContext(SocketContext);
    const { user, setUser } = useUser()!;
    const [isWaiting, setisWaiting] = useState(true);

    if (user.id > 0) {
        socket.emit('login', user.username);
    }
    
    useEffect(() => {
        socket.emit('newplayer', user.username);
        socket.on('nb_players', (nb: number) => {
            console.log(nb);
        if (nb % 2 === 0) {
            socket.emit('game_on', user.username);
            socket.on('active_players', (player: {playername: string, index: number, id: number}) => {
                setisWaiting(false);
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
    }, [])

    if (user.id > 0)
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
    else
    {
        props.history.push('/login');
        return (<div/>)
    }
}

export default GameLobby;
