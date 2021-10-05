import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import MainNavBar from "../components/layout/MainNavBar";
import authHeader from "../services/auth-header";
import Utils from "../components/utils/utils"
import './ProfileDetailPage.css'
import orImage from '../media/images/or.png'
import argentImage from '../media/images/argent.png'
import bronzeImage from '../media/images/bronze.png'
import darktheme from '../media/images/dark-theme.png'
import whitetheme from '../media/images/white-theme.jpg'
import greentheme from '../media/images/green-theme.jpg'
import purpletheme from '../media/images/purple-theme.jpg'
import defaultball from '../media/images/default-ball.png'
import darkball from '../media/images/dark-ball.png'
import natureball from '../media/images/nature-ball.png'
import funkyball from '../media/images/funky-ball.png'
import defaultpad from '../media/images/default-pad.jpeg'
import darkpad from '../media/images/dark-pad.jpeg'
import naturepad from '../media/images/nature-pad.jpeg'
import funkypad from '../media/images/funky-pad.jpeg'
import { SocketContext } from '../socket/context'
import React from "react";
import { defaultUser, useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router';
import { Button, Col, Container, Form, FormCheck, Modal, Row } from "react-bootstrap";
import Avatars from "@dicebear/avatars";

interface IUser2 {
  id: number,
  username: string,
  wins: number,
  losses: number,
  avatar: string,
  matches: {id: number, username: string, opponent: string, points: number, o_points: number}[],
  friendlist: string[],
  current: {id: number, username: string, friendlist: string[], blocklist: string, wins: number, losses: number},
  elo: number,
  rank: number,
  status: string,
}

interface IStatus {
	[username: string]: string
}

function ProfilePage(props: any) {

  const [newUser, setnewUser] = useState<IUser2>();
  const [IsFriend, setIsFriend] = useState("no");
  const [IsBlocked, setIsBlocked] = useState(false);
  const [Matches, setMatches] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState(0);
  const [Edit, setEdit] = useState(false);
  const [DisplayName, setDisplayName] = useState("");
  const [Avatar, setAvatar] = useState("");
  const socket = React.useContext(SocketContext);
  const { user } = useUser()!;
  const param: any = useParams();
  const [File, SetFile] = useState([]);
  const [Canvas, setCanvas] = useState<string[]>([]);
  const [Friends, setFriends] = useState([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [Status, setStatus] = useState<IStatus>({});
  const [Notifications, setNotifications] = useState<string[]>([]);
  const [modalShow, setModalShow] = useState(false);
  const [otpBox, setOtpBox] = useState(false);
  const [PowerUps, setPowerUps] = useState(false);
  const [Speed, setSpeed] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  let username: string = param.username.substring(1);
  let idMatches = 0;
  var idNotif = 0;
  var renderVal = 0;
  let canvasColor = [
    ['black', 'white', '0', 'defaultball', 'defaultpad'],
    ['white', 'dark', '1', 'darkball', 'darkpad'],
    ['blue', 'green', '2', 'natureball', 'naturepad'],
    ['yellow', 'purple', '3', 'funkyball', 'funkypad']
  ]

  function ListItem(friends: any) {
      renderVal++;
      return (
          <tr key={friends.username}>
            <td>
              <img src={friends.avatar} width='30px' height='30px' alt=""></img>
              <a href={'#profile/:' + friends.username}>{friends.username}</a>
            </td>
            <td>
            {username == user.username ?
              <p className="status-friendslist"><span className={Status[friends.username] == 'online' ? "status green"
              : Status[friends.username] == 'offline' ? 'status orange' : 'status blue'}>
              </span>{Status[friends.username]}</p> : <></>}
            </td>
          </tr>
      )
    }


	function ListMatches(matches: any) {
    let opponent = (matches.username === username ? true : false);
    let result: string;
    idMatches++;
    if (opponent){
      result = (matches.points > matches.o_points ? "Victory" : "Defeat");
    }
    else {
      result = (matches.points > matches.o_points ? "Defeat" : "Victory");
    }
		return (
      <tr key={idMatches}>
        <th scope='row'>{idMatches}</th>
        <td>
          <a href={'#profile/:' + (opponent ? matches.opponent : matches.username)}>{(opponent ? matches.opponent : matches.username)}</a>
        </td>
        <td>
        <span style={{color: (result === "Defeat" ? 'red' : 'green')}}>{result}</span>
        </td>
        <td>
          {(opponent ? matches.points : matches.o_points)} - {(opponent ? matches.o_points : matches.points)}
        </td>
      </tr>
		)
	}

  useEffect(() => {
    if (!canvasRef.current)
      return;
    let canvas = canvasRef.current!
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    let img = document.getElementById(Canvas[1]) as CanvasImageSource
    let ball = document.getElementById(Canvas[3]) as CanvasImageSource
    let pad = document.getElementById(Canvas[4]) as CanvasImageSource
    ctx!.drawImage(img, 0, 0, w, h);
    // ctx!.fillStyle = Canvas[1];
    // ctx!.fillRect(0, 0, w, h);
    ctx!.fillStyle = Canvas[0];
    ctx!.beginPath();
    ctx!.drawImage(ball, w/2 , h/2, w/25, w/25);
    // ctx!.arc(w/2 , h/2, w/50, 0, 2 * Math.PI);
    ctx!.stroke();
    ctx!.drawImage(pad, w/100, 5 * (h/100), w/40, h/5);
    // ctx!.fillRect(w/100, 5 * (h/100), w/40, h/5);
    ctx!.drawImage(pad, w - w/40 - w/100, 10 * (h/100), w/40, h/5);
    // ctx!.fillRect(w - w/40 - w/100, 10 * (h/100), w/40, h/5);

  }, [Canvas])

  useEffect(() => {
      if (user.id > 0 && user.username.length > 0)
      {
          axios.post(`/profile/profile2`, {username: username}, { withCredentials: true })
               .then((response) => {
                   if (response.data) {
                       setMatches(response.data.ret.matches);
                       if (response.data.ret.friendrequests.find((element: string) => {return element === user.username}))
                           setIsFriend("pending");
                       else if (response.data.ret.current.friendlist.find((element: string) => {return (element === username)}))
                           setIsFriend("yes");
                       setIsBlocked(false);
                       setStatus(Status => ({...Status, [response.data.ret.username]: response.data.ret.status}));
                       setnewUser(response.data.ret);
                       if (response.data.ret.username == user.username)
                           setNotifications(response.data.ret.friendrequests)
                       if (response.data.ret.current.blocklist.find((element: string) => {return (element === response.data.ret.username)}))
                           setIsBlocked(true);
                       setLoading(false);
                       setCanvas(canvasColor[user.theme]);
               }})
               .catch((error) => {
                   if (error.response.status == 401)
                       props.history.push('/logout')
                   else if (error.response.status == 404)
                       props.history.push('/profile/:' + user.username);
                   setLoading(false);
               })
          axios.post('/profile/friends', {username: username},
                     { withCredentials: true})
               .then((response) => {
                   if (response.data) {
                       setFriends(response.data);
                       if (user.username == username) {
                           for (let i = 0 ; i < response.data.length ; i++) {
                               setStatus(Status => ({...Status, [response.data[i].username]: response.data[i].status}))
                           }
                       }
                   }
               })
          return () => {
              setMatches([]);
              setIsFriend("");
              setIsBlocked(false);
              setnewUser(undefined);
              setError(0);
          }
      }
  }, [username, renderVal]);

  useEffect(() => {
		socket.on('status', (data: any) => {
      console.log(data);
      setStatus(Status => ({...Status, [data.username]: data.status}))
    })
    return(() => {
      socket.off('status');
    })
	},[])

  function addAsFriend() {
    socket.emit('addfriend', username);
    setIsFriend("pending");
  }

  function Unfriend() {
    axios.post(`/profile/delfriend`,
    {user1: username, user2: user.username}, 
    { withCredentials: true })
    .then((response) => {
      setIsFriend("no");
    })
  }

  function Block() {
    axios.post(`/profile/block`,
    {username: username}, 
    { withCredentials: true })
    .then((response) => {
      setIsBlocked(true);
    })
  }

  function Unblock() {
    axios.post(`/profile/unblock`,
    {username: username}, 
    { withCredentials: true })
    .then((response) => {
      setIsBlocked(false);
    })
  }

  function ToggleEdit() {
    setEdit(!Edit);
  }

  function SaveProfile(e: any) {
    e.preventDefault();
    var file = (File[0] as File);
    var avatar: boolean = true;

    if (typeof File[0] === "undefined")
      avatar = false;
    if (file && file.size > 200000)
    {
      alert("File must be < 200ko");
      return ;
    }
    if (avatar) {
      Utils.getBase64(File[0])!.then(result => {
        var res = JSON.stringify(result);
        res = res.substring(1, res.length - 1);
        setAvatar(res);
        user.avatar = res;
        console.log('display', DisplayName);
        return axios.post(`/profile/update_profile`,
        [user.realname, res, user.theme, DisplayName], { withCredentials: true })
        })
        .catch((e) => {
          console.log('error', e.response.data.message);
          setErrorMessage(e.response.data.message);
        })
        .then(() => {
          if (DisplayName.length)
            user.username = DisplayName;
          setTimeout(() => {props.history.push('/')}, 200);
        })
    }
    else {
      return axios.post(`/profile/update_profile`,
        [user.realname, "", user.theme, DisplayName], { withCredentials: true }).then(() => {
        if (DisplayName.length)
          user.username = DisplayName;
      setTimeout(() => {props.history.push('/')}, 200);
    })
    .catch((e) => {
      console.log('error', e.response.data.message);
      setErrorMessage(e.response.data.message);
    })
  }
}

  function setCanvasColors(e: any) {
    if (e.target.value == 0) {
      setCanvas(canvasColor[0]);
      // user.theme = 0;
    }
    else if (e.target.value == 1) {
      setCanvas(canvasColor[1]);
      // user.theme = 1;
    }
    else if (e.target.value == 2) {
      setCanvas(canvasColor[2]);
      // user.theme = 2;
    }
    else if (e.target.value == 3) {
      setCanvas(canvasColor[3]);
      // user.theme = 3;
    }
  }

  function gameRequest(e: any) {
    e.preventDefault();
    
    socket.emit('gamerequest', [username, PowerUps, Speed]);
  }

  if (Error === 401)
    return (<div/>);
  else if (Loading)
    return (<MainNavBar />)
  else if (user.id > 0 && user.username.length > 0) {
      return (
          <div>
              <MainNavBar />
              {newUser ? 
              <div className="container-fluid">
              <div className="row py-4 px-4">
                  <div className="col mx-auto">
                      <div className="bg-dark shadow rounded overflow-hidden">
                          <div className="px-4 pt-0 pb-5">
                              <div className="row media align-items-center profile-head">
                                  <div className="profile mr-3 col-4">
                                      <img src={newUser.avatar} alt="..." width="180" className="rounded mb-2 img-thumbnail"/>
                                  </div>
                                  <div className="col-8 text-white">
                                      <h2 className="mt-0 mb-0">{newUser.username + ' '}
                                      {newUser.rank === 1 ? <img src={orImage} height="40" width="40" /> : ""}
                                      {newUser.rank === 2 ? <img src={argentImage} height="40" width="40" ></img> : ""}
                                      {newUser.rank === 3 ? <img src={bronzeImage} height="40" width="40" ></img> : ""}
                                      </h2>
                                      <p className="mb-4">Rank #{newUser.rank} ({newUser.elo})</p>
                                  </div>
                              </div>
                          </div>
                          <div className="bg-light p-4 d-flex justify-content-center text-center">
                              <ul className="list-inline mb-0 col-12">
                                  <li className="list-inline-item col-2">
                                      <h5 className="font-weight-bold mb-0 d-block">{newUser.wins}</h5><small className="text-muted"> <i className="fas fa-image mr-1"></i>Wins</small>
                                  </li>
                                  <li className="list-inline-item col-2">
                                      <h5 className="font-weight-bold mb-0 d-block">{newUser.losses}</h5><small className="text-muted"> <i className="fas fa-image mr-1"></i>Losses</small>
                                  </li>
                                  <li className="list-inline-item col-2">
                                      <h5 className="font-weight-bold mb-0 d-block">{newUser.wins + newUser.losses}</h5><small className="text-muted"> <i className="fas fa-user mr-1"></i>Total</small>
                                  </li>
                                  <li className="list-inline-item col-2">
                                      <h5 className="font-weight-bold mb-0 d-block">{(newUser.wins+newUser.losses) ? Math.round((newUser.wins/(newUser.wins+newUser.losses))*100) : 0}%</h5><small className="text-muted"> <i className="fas fa-user mr-1"></i>Ratio</small>
                                  </li>
                              </ul>
                          </div>
                          <div className="row">
                            <div className="col-6 px-4 py-3">
                                <h5 className="mb-0 text-white text-center">Last Games</h5>
                                <table id="matchList" className="table table-striped table-dark"><thead>
                                <tr><td/><td/><td/><td/></tr>
                                    <tr>
                                      <th scope="col">#</th>
                                      <th scope="col">Opponent</th>
                                      <th scope="col">Result</th>
                                      <th scope="col">Score</th>
                                    </tr>
                                    {Matches.map((listvalue) => {
                                      return (ListMatches(listvalue))
                                    })}
                                  </thead></table>
                                  {newUser && !newUser.matches.length ? <p id='nomatch'>No Match</p> : ""}
                                  <h5 className="mb-0 text-white text-center">Friendlist</h5>
                                  <table id="matchList" className="table table-striped table-dark"><thead>
                                      <tr><td/><td/></tr>
                                      {Friends.map((listvalue) => {
                                        return (ListItem(listvalue))
                                      })}
                                  </thead></table>
                                  {Friends && !Friends.length ? <p id='nomatch'>No Friends</p> : ""}
                            </div>
                            {newUser.username !== user.username ?
                            <div className="col-6 px-4 py-3">
                              <div className="row btn-profil">
                                {IsFriend == "no" ? <button id="marge" type="button" onClick={addAsFriend} className="btn btn-primary">Send Friend Request</button> 
                                : IsFriend == "pending" ? <button id="marge" type="button" className="btn btn-outline-primary" disabled>Invitation pending...</button> :
                                <button id="marge" type="button" onClick={Unfriend} className="btn btn-outline-primary">Unfriend {newUser.username}</button>}
                                {!IsBlocked ? <button id="marge" type="button" onClick={Block} className="btn btn-danger">Block</button> 
                                : <button id="marge" type="button" onClick={Unblock} className="btn btn-outline-danger">Unblock {newUser.username}</button>}
                                <button id="marge" type="button" className="btn btn-primary" onClick={() => setModalShow(!modalShow)}>Send Game Request</button>
                                {modalShow ?
                                <Form onSubmit={gameRequest} className="text-white">
                                  <Container>
                                  <Row>
                                  <Form.Label>Game Speed</Form.Label>
                                  <Col>
                                  <Form.Check
                                    type="radio"
                                    label="x0.5"
                                    name="formHorizontalRadios"
                                    id="formHorizontalRadios1"
                                    onClick={() => setSpeed(0.5)}
                                  />
                                  </Col>
                                  <Col>
                                  <Form.Check
                                    type="radio"
                                    label="x1"
                                    name="formHorizontalRadios"
                                    id="formHorizontalRadios2"
                                    onClick={() => setSpeed(1)}
                                    defaultChecked
                                  />
                                  </Col>
                                  <Col>
                                  <Form.Check
                                    type="radio"
                                    label="x2"
                                    name="formHorizontalRadios"
                                    id="formHorizontalRadios3"
                                    onClick={() => setSpeed(2)}
                                  />
                                  </Col>
                                  </Row>
                                  <Col>
                                  <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Power-ups"
                                    onClick={() => {setPowerUps(!PowerUps); console.log(PowerUps);}}
                                  />
                                  </Col>
                                  <Row>
                                  <Col>
                                  <Button type="submit" className="btn btn-secondary" disabled={Status[username] != 'online' ? true : false}>Send</Button>
                                  </Col>
                                  <Col>
                                  <div style={{color: 'red', paddingBottom: '20px'}}>{Status[username] != 'online' ? "User is offline/in a game" : ""}</div>
                                  </Col>
                                  </Row>
                                  </Container>
                                </Form>
                                : <></>}
                                <button type="button" className="btn btn-primary">Send Message</button>
                              </div>
                            </div> 
                            : <div className="col-6 px-4 py-3">
                            <div className="text-white">
                                <Form onSubmit={SaveProfile}>
                                <div className="row"><div className="col-6">
                                    <Form.Label>Display Name</Form.Label>
                                    <Form.Control id="marge" size="sm" type="text" placeholder="Display name"
                                      autoFocus
                                      value={DisplayName}
                                      onChange={(e) => setDisplayName(e.target.value)} />
                                    <div className="row">
                                      <Form.Label>Upload Avatar</Form.Label>
                                      <Form.Control 
                                        type='file'
                                        onChange={(e: any) =>{SetFile(e.target.files)}}
                                        accept="image/*,.pdf"
                                      />
                                      <Form.Text id="marge" className="text-muted">
                                        Maximum size 200ko
                                      </Form.Text>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <Form.Label>Select Theme</Form.Label>
                                    <Form.Control defaultValue={user.theme} as="select" aria-label="Default select example" onChange={(e: any) => setCanvasColors(e)}>
                                      <option value="0">Default</option>
                                      <option value="1">Dark</option>
                                      <option value="2">Nature</option>
                                      <option value="3">Funky</option>
                                    </Form.Control>
                                    <canvas ref={canvasRef}></canvas>
                                  </div></div>
                                  <div className="btn-profil"><Button type="submit" className="btn btn-secondary">Save</Button>
                                      <Button className='btn' onClick={(e) => {
                                          e.preventDefault();
                                          props.history.push('/profile/:' + user.username + '/otp');
                                      }}>2fa settings</Button>
                                  </div>
                                  <div style={{color: 'red'}}>{errorMessage}</div>
                                </Form></div></div>}
                                <img id="white" src={whitetheme} style={{display:"none"}}></img>
                                <img id="dark" src={darktheme} style={{display:"none"}}></img>
                                <img id="green" src={greentheme} style={{display:"none"}}></img>
                                <img id="purple" src={purpletheme} style={{display:"none"}}></img>
                                <img id="defaultball" src={defaultball} style={{display:"none"}}></img>
                                <img id="darkball" src={darkball} style={{display:"none"}}></img>
                                <img id="natureball" src={natureball} style={{display:"none"}}></img>
                                <img id="funkyball" src={funkyball} style={{display:"none"}}></img>
                                <img id="defaultpad" src={defaultpad} style={{display:"none"}}></img>
                                <img id="darkpad" src={darkpad} style={{display:"none"}}></img>
                                <img id="naturepad" src={naturepad} style={{display:"none"}}></img>
                                <img id="funkypad" src={funkypad} style={{display:"none"}}></img>
                          </div>
                      </div>
                  </div>
              </div></div> : <div></div>}
          </div> 
      )
  }
  else {
    props.history.push('/login');
    return(<div/>);
  }
}

export default ProfilePage;
