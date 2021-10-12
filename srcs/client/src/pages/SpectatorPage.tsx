import { useEffect, useState } from 'react';
import MainNavBar from '../components/layout/MainNavBar';
import './LadderPage.css'
import { SocketContext } from '../socket/context'
import React from 'react';
import { useUser } from '../components/context/UserAuthContext';

interface IMatch {
    id: number;
    Player1: string,
    Player2: string,
    P1Score: string,
    P2Score: string
}

function SpectatorPage(props: any): any {

    const [Matches, setMatches] = useState<IMatch[]>([])
    let idTab = 0;
    const socket = React.useContext(SocketContext);
    const { user } = useUser()!;

	function ListEveryone(match: any) {
        idTab++;
        return (
                <tr key={idTab}>
                    <th scope='row'>
                        <p>{match.id}</p>
                    </th>
                    <td><p>{match.Player1}</p></td>
                    <td><p>{match.Player2}</p></td>
                    <td><p>{match.P1Score} - {match.P2Score}</p></td>
                    <td><a href={'#game/:' + match.id}>Watch</a></td>
                </tr>
        )
    }

    useEffect(() => {
        if (user.id > 0 && user.username.length > 0)
        {
            socket.emit('login', user.username);
            socket.emit('get_games');
            socket.on('live', (data: any) => {
                setMatches([]);
                console.log(data);
                for (let i in data) {
                    if (data[i].ingame === true) {
                        console.log(data[i]);
                        let match: IMatch = {
                            id: data[i].id,
                            Player1: data[i].player1,
                            Player2: data[i].player2,
                            P1Score: data[i].p1score,
                            P2Score: data[i].p2score
                        };
                        setMatches([...Matches, match]);
                    }
                }
            })
            return (() => {
                socket.off('live');
                setMatches([]);
            })
        }
    }, [])  // eslint-disable-line react-hooks/exhaustive-deps

    if (user.id > 0 && user.username.length > 0) {
        return (
            <div>
                <MainNavBar />
                <div className="px-4 py-3 mt-2">
                    <h3 style={{padding: '12px'}} className="mb-0 text-white text-center bg-dark">Live Games</h3>
                    <table id="ladderList" className="table table-striped bg-dark text-white"><thead>
                        <tr>
                            <th scope="col">Room #</th>
                            <th scope="col">Player 1</th>
                            <th scope="col">Player 2</th>
                            <th scope="col">Score</th>
                            <th scope="col">Live</th>
                        </tr>                        
                        {Matches.map((listvalue) => {
                            return (ListEveryone(listvalue))
                        })}
                    </thead></table>
                </div>
            </div>
        )
    }
    else {
        props.history.push('/login');
        return(<div></div>);
    }
}

export default SpectatorPage;
