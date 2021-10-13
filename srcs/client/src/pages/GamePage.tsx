import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import MainNavBar from '../components/layout/MainNavBar';
import { SocketContext } from '../socket/context';
import { useUser } from '../components/context/UserAuthContext';
import { useParams } from 'react-router-dom';
import darktheme from '../media/images/dark-theme.jpg'
import whitetheme from '../media/images/white-theme.jpg'
import greentheme from '../media/images/green-theme.jpg'
import purpletheme from '../media/images/purple-theme.jpg'
import defaultball from '../media/images/default-ball.png'
import darkball from '../media/images/dark-ball.png'
import natureball from '../media/images/nature-ball.png'
import funkyball from '../media/images/funky-ball.png'
import defaultpad from '../media/images/default-pad.png'
import darkpad from '../media/images/dark-pad.png'
import naturepad from '../media/images/nature-pad.png'
import funkypad from '../media/images/funky-pad.png'
import powerspeed from '../media/images/power-speed.png'
import powerball from '../media/images/power-ball.png'
import powerpad from '../media/images/power-pad.png'
import './GamePage.css'


function GamePage(props: any): any {

    const socket = React.useContext(SocketContext);
    const { user } = useUser()!;
    const param: any = useParams();
    const room: number = param.room.substring(1);
    const [Players, setPlayers] = useState(["", ""]);
    const [Role, setRole] = useState("");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [Scores, setScores] = useState([0, 0])
    const [End, setEnd] = useState(false);
    const [Spectators, setSpectators] = useState<string[]>([]);
    const [Avatars, setAvatars] = useState<string[]>([]);
    let idTab = 0;

    let canvasColor = [
        ['black', 'white', 'defaultball', 'defaultpad'],
        ['white', 'dark', 'darkball', 'darkpad'],
        ['blue', 'green', 'natureball', 'naturepad'],
        ['yellow', 'purple', 'funkyball', 'funkypad']
      ]

    function ListSpectators(spectator: string) {
        idTab++;
        return (<li key={idTab}><div className="col userinfo">{spectator}</div></li>)
    }

    useEffect(() => {
        if (user.id > 0 && user.username.length > 0)
        {
            let canvas = canvasRef.current;
            canvas!.width = canvas!.clientWidth;
            canvas!.height = canvas!.clientHeight;
            let ctx = canvas!.getContext("2d");
            ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
            let w = canvas!.width;
            let h = canvas!.height;
            socket.emit('game_info', room);
            let img = document.getElementById(canvasColor[user.theme][1]) as CanvasImageSource
            let ball = document.getElementById(canvasColor[user.theme][2]) as CanvasImageSource
            let pad = document.getElementById(canvasColor[user.theme][3]) as CanvasImageSource
            let powerSpeed = document.getElementById('powerspeed') as CanvasImageSource
            let powerBall = document.getElementById('powerball') as CanvasImageSource
            let powerPad = document.getElementById('powerpad') as CanvasImageSource
            socket.on('game', (data: any) => {
                if (!data.countdown)
                {
                    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
                    ctx!.drawImage(img, 0, 0, w, h);
                    ctx!.fillStyle = canvasColor[user.theme][0];
                    ctx!.beginPath();
                    ctx!.drawImage(ball,
                                   data.bp.x * (w/100) - (data.pw.type === -1 ? (w/100) : (w/50)),
                                   data.bp.y * (h/100) - (data.pw.type === -1 ? (w/100) : (w/50)),
                                   (data.pw.type === -1 ? (w/50) : (w/25)),
                                   (data.pw.type === -1 ? (w/50) : (w/25)));
                    ctx!.beginPath();
                    ctx!.drawImage((data.pw.type === 0 ? powerSpeed : data.pw.type === 1 ? powerBall : powerPad),
                                   data.pw.x * (w/100) - (w/20), data.pw.y * (h/100) - (w/20), w/10, w/10);
                    ctx!.stroke();
                    ctx!.fillStyle = canvasColor[user.theme][0];
                    ctx!.drawImage(pad, w/100, data.p1 * (h/100), w/40, h/5  * (data.pw.type === -21 ? 3/2 : 1));
                    ctx!.drawImage(pad, w - w/40 - w/100, data.p2 * (h/100), w/40, h/5  * (data.pw.type === -22 ? 3/2 : 1));
                }
                else if (data.countdown > 0)
                {
                    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
                    ctx!.drawImage(img, 0, 0, w, h);
                    ctx!.fillStyle = canvasColor[user.theme][0];
                    ctx!.beginPath();
                    ctx!.drawImage(ball, data.bp.x * (w/100) - (w/50), data.bp.y * (h/100) - (w/50), w/25, w/25);
                    ctx!.fill();
                    ctx!.stroke();
                    ctx!.drawImage(pad, w/100, data.p1 * (h/100), w/40, h/5);
                    ctx!.drawImage(pad, w - w/40 - w/100, data.p2 * (h/100), w/40, h/5);
                    setScores([data.p1score, data.p2score]);
                    if (!data.start) {
                        ctx!.font = '48px serif';
                        ctx!.fillText(`${Math.trunc(data.countdown / 50) + 1}`, w/2 - w/50, h/3);
                    }
                    if (data.end || (data.p1score >= 5 || data.p2score >= 5)) {
                        setEnd(true);
                        ctx!.font = '24px serif';
                        ctx!.fillText((data.p1score === 5 ? `${Players[0]} WIN` : `${Players[1]} WIN`), w/2 - w/50, h/3);
                        setTimeout(() => {props.history.push(`/profile/:${user.username}`)}, 2000);
                    }
                }
                else
                {
                    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
                    ctx!.font = '12px serif';
                    ctx!.fillText('opponent left : forfait win\nRedirecting to profile...', w/2, h/2);
                    setTimeout(() => {props.history.push(`/profile/:${user.username}`)}, 2000);
                }
            })
            return (() => {
                // socket.emit('stop_info', room);
                socket.off('game');
                socket.emit('quit_game', [user.username, room]);
                user.status = "online";
            })
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (user.id > 0 && user.username.length > 0)
        {
            socket.emit('game_start', {username: user.username, room: room});
            socket.on('role', (data: {players: string[], role: string, avatars: string[]}) => {
                setPlayers(data.players);
                setAvatars(data.avatars);
                setRole(data.role);
            })
            return(() => {
                socket.off('role');
            })
        }
    }, [room, socket, user.username]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (user.id > 0 && user.username.length > 0)
        {
            let keyState: any;
            const handleKey = (e: any) => {

                if (Role === 'player1' ||
                    Role === 'player2') {
                    keyState = e.key;
                }
            }
            const handleKeyup = (e: any) => {
                if (Role === 'player1' ||
                    Role === 'player2') {
                    if (keyState === e.key) {
                        socket.emit('keyup', {key: e.key, role: Role, room: room});
                        keyState = null;
                    }
                }
            }

            window.addEventListener("keydown", handleKey);
            window.addEventListener("keyup", handleKeyup);
            let interval = setInterval(() => {
                socket.emit('send_key', {key: keyState, role: Role, room: room})
            }, 10);
            return(() => {
                window.removeEventListener("keydown", handleKey);
                window.removeEventListener("keyup", handleKeyup);
                clearInterval(interval);
            })
        }
    }, [Players, Role, room, socket]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (user.id > 0 && user.username.length > 0)
        {
            socket.emit('get_spectators', room);
            socket.on('spectators', (data: string[]) => {
                setSpectators([]);
                for (let i in data) {
                    setSpectators([...Spectators, data[i]]);
                }
            })
            return (() => {
                socket.off('spectators');
            })
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (user.id && user.username.length > 0) {
        return (<div>
            <MainNavBar/>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-2 row-height">
                        <hr/>
                        <h5 id='subTitle'>PLAYERS</h5>
                        <table id="playerList" className="table table-striped table-dark"><thead>
                            <tr>
                                <td style={{borderWidth: '1px'}}>
                                    <img src={Avatars[0]} alt="avatar1" width="30" height="30"/>
                                    <span style={{marginLeft: '12px'}}>{Players[0]}</span>
                                </td>
                                <td style={{borderWidth: '1px'}}><p style={{marginBottom: '0.3rem'}}><strong>{Scores[0]}</strong></p></td>
                            </tr>
                            <tr>
                                <td style={{borderWidth: '1px'}}>
                                    <img src={Avatars[1]} alt="avatar2" width="30" height="30"/>
                                    <span style={{marginLeft: '12px'}}>{Players[1]}</span>
                                </td>
                                <td style={{borderWidth: '1px'}}><p style={{marginBottom: '0.3rem'}}><strong>{Scores[1]}</strong></p></td>
                            </tr>
                        </thead></table>
                        <hr/>
                        <h5 id='subTitle'>VIEWERS</h5>
                        <div className="friendlist">
                            <ul className="ul">
                            {Spectators.map((listvalue) => {
                                return (ListSpectators(listvalue))
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className="col-10 row-game">
                        {!End ? <canvas id="bgCanvas" ref={canvasRef}></canvas> : 
                            <div className="waiting-div d-flex align-items-center">
                                {Scores[0] === 5 ? 
                                    <><img src={Avatars[0]} alt="avatar1" width="120" height="120"/>
                                    <p className="waiting">{Players[0]} WIN</p></> :
                                    <><img src={Avatars[1]} alt="avatar2" width="120" height="120"/>
                                    <p className="waiting">{Players[1]} WIN</p></>}
                            </div>
                        }
                    </div>
                </div>
            </div>
            <img alt="theme" id="white" src={whitetheme} style={{display:"none"}}></img>
            <img alt="theme" id="dark" src={darktheme} style={{display:"none"}}></img>
            <img alt="theme" id="green" src={greentheme} style={{display:"none"}}></img>
            <img alt="theme" id="purple" src={purpletheme} style={{display:"none"}}></img>
            <img alt="ball" id="defaultball" src={defaultball} style={{display:"none"}}></img>
            <img alt="ball" id="darkball" src={darkball} style={{display:"none"}}></img>
            <img alt="ball" id="natureball" src={natureball} style={{display:"none"}}></img>
            <img alt="ball" id="funkyball" src={funkyball} style={{display:"none"}}></img>
            <img alt="pad" id="defaultpad" src={defaultpad} style={{display:"none"}}></img>
            <img alt="pad" id="darkpad" src={darkpad} style={{display:"none"}}></img>
            <img alt="pad" id="naturepad" src={naturepad} style={{display:"none"}}></img>
            <img alt="pad" id="funkypad" src={funkypad} style={{display:"none"}}></img>
            <img alt="power" id="powerspeed" src={powerspeed} style={{display:"none"}}></img>
            <img alt="power" id="powerball" src={powerball} style={{display:"none"}}></img>
            <img alt="power" id="powerpad" src={powerpad} style={{display:"none"}}></img>
        </div>)
    }
    else {
        props.history.push('/login');
        return (<div/>);
    }
}

export default GamePage;
