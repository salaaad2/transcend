import axios from "axios";
import { useEffect, useState } from "react";
import { Badge, Button, ButtonGroup, Container, Dropdown, DropdownButton, Form, Nav, Navbar, NavDropdown, SplitButton } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import './MainNavBar.module.css';
import Utils from "../utils/utils";
import { useUser } from '../context/UserAuthContext';
import React from "react";
import { SocketContext } from '../../socket/context';
import { AlignType } from "react-bootstrap/esm/DropdownMenu";
import { setupMaster } from "cluster";
import { SportsHockeyRounded } from "@material-ui/icons";
import { toast } from "react-toastify";

function MainNavBar(props: any) {

    const [File, SetFile] = useState([]);
    const [AvatarToggle, setToggle] = useState(false);
    const { user, setUser } = useUser()!;
    let profilelink = "#profile/:" + user.username;
    let avatar = user.avatar;
    const [Avatar, setAvatar] = useState(avatar);
    const socket = React.useContext(SocketContext);
    const [Notifications, setNotifications] = useState(false);
    const [FriendRequests, setFriendRequests] = useState<string[]>([]);
    const [GameRequests, setGameRequests] = useState<string[]>([]);
    const [NotifToggle, setNotifToggle] = useState(false);
    let renderVal: number = 0;
    let idNotif: number = 0;

    function acceptGame(data: string[]) {
      console.log('accept' + data[1]);
      socket.emit('newplayer2', [user.username, data[1], data[2], data[3]]);
    }

    function rejectGame() {
      console.log('reject');
    }

    function notifyGame(data: string[]) {
      const Msg = () => (
        <>
        <p>{data[1]} invited you for a game</p>
        <svg onClick={() => acceptGame(data)} color="green" id="valid-request" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
        </svg>
        <svg onClick={() => rejectGame()} color="red" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>
      </>
      )
      toast(<Msg />, {
        className:"dark-toast",
        autoClose:false,

  });
    }

    function acceptRequest(notif: string) {
      axios.post(`/authentication/addfriend`,
      {user1: user.username, user2: notif}, 
      { withCredentials: true }).then(() => {
        user.friendlist.push(notif);
        setUser(user);
        let username = user.username;
        socket.emit('accept_friend', {username, notif});
        let NotifTemp = [...FriendRequests];
        NotifTemp.splice(FriendRequests.findIndex(element => {return element == notif}), 1);
        console.log('temp:', NotifTemp);
        setFriendRequests(FriendRequests => {
          return FriendRequests = NotifTemp
        });
        renderVal++;
      });
    }

    function rejectRequest(notif: string) {
      let username = user.username;
      socket.emit('reject_friend', {username, notif});
      let NotifTemp = [...FriendRequests];
      NotifTemp.splice(FriendRequests.findIndex(element => {return element == notif}), 1);
      setFriendRequests(FriendRequests => {
        return FriendRequests = NotifTemp
      });
      renderVal++;
    }

    function ListRequests(notif: string) {
      idNotif++;
      console.log(notif);
      return (
        <div key={idNotif} className="friendlist">
        <ul className="ul">
            <li>
              <div className="userinfo">{notif}</div>
            <svg onClick={(e) => acceptRequest(notif)} color="green" id="valid-request" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            <svg onClick={(e) => rejectRequest(notif)} color="red" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
            </li>
        </ul>
        </div>
      )
    }

    function getBase64(file: any) {
      return new Promise(resolve => {

        let baseURL: any = "";
        let reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
          baseURL = reader.result;
          resolve(baseURL);
        };
      });
    };

    function uploadAvatar(e: any) {
      e.preventDefault();

      var file = (File[0] as File);

      if (typeof File[0] === "undefined")
      {
        alert("You must choose a file");
        return ;
      }
      if (file.size > 200000)
      {
        alert("File must be < 200ko");
        return ;
      }
      getBase64(File[0]).then(result => {
      var res = JSON.stringify(result);
      res = res.substring(1, res.length - 1);
      setAvatar(res);
      user.avatar = res;
      return axios.post(`/authentication/update_avatar`,
      {data: res}, { withCredentials: true })
      })
      console.log('ok');
    }

    useEffect(() => {
      console.log('use2');
      axios.get(`/authentication`,
      { withCredentials: true }).then((response) => {
        console.log('use3');
        if (response.data && response.data.friendrequests.length != 0) {
          setFriendRequests(response.data.friendrequests);
          console.log('use4');
          console.log('rq:', response.data.friendrequests);
          setNotifications(true);
        }
      })
    }, [])

    useEffect(() => {
      console.log('info');
      socket.on('notifications', (data: string[]) => {
        console.log('data');
        if (data) {
          if (data[0] == 'friendrequest') {
            console.log(data);
            Utils.notifyInfo(data[1]);
            setNotifications(true);
            let NotifTemp = [...FriendRequests];
            NotifTemp.push(data[1]);
            setFriendRequests(FriendRequests => {
              return FriendRequests = NotifTemp
            });
          }
          else if (data[0] == 'accept_friend') {
            console.log(data);
            Utils.notifyInfo(data[1] + 'accepted you as friend');
            user.friendlist.push(data[1]);
            setUser(user);
          }
          else if (data[0] == 'game_request') {
            notifyGame(data);
          }
          else if (data[0] == 'clear_notifs') {
            setNotifications(false);
          }
        }
      })
      return (() => {
        socket.off('notifications');
      })
    }, [])

    useEffect(() => {
      socket.on('start_duel', (data: number) => {
        props.history.push(`/game/:${data}`);
      })
      return(() => {
        socket.off('start_duel');
      })
    })

    return (
            <div>
            <Navbar bg="dark" variant="dark">
                <Container>
                  <Navbar.Brand>OVERKILL PONG</Navbar.Brand>
                  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                  <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                      <Nav.Link href={profilelink}>Profile</Nav.Link>
                      {/* <Nav.Link href="#game">Game</Nav.Link> */}
                      <NavDropdown title="Game" id='game'>
                        <NavDropdown.Item href="#game">Play</NavDropdown.Item>
                        <NavDropdown.Item href="#spectator">Watch</NavDropdown.Item>
                      </NavDropdown>
                      <Nav.Link href="#chat/:General">Chat</Nav.Link>
                      <Nav.Link href="#ladder">Ladder</Nav.Link>
                    </Nav>
                    <Nav.Link href={profilelink}>
                        <img src={Avatar} alt="avatar"
                        style={{border: "solid white 2px"}} width="50" height="50"/>
                    </Nav.Link>
                    <Nav>
                      <NavDropdown title={user.id > 0 ? user.username : "null"} id="profile" >
                        <NavDropdown.Item onClick={() => setToggle(!AvatarToggle)}>Change Avatar</NavDropdown.Item>
                        <NavDropdown.Item href="#logout">Logout</NavDropdown.Item>
                      </NavDropdown>
                      <Nav.Link onClick={() => setNotifToggle(!NotifToggle)} className='notif-btn'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-bell-fill" viewBox="0 0 16 16">
                              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
                            </svg>
                            {Notifications ? <span className="notif"></span> : <></>}</Nav.Link>
                    </Nav>
                  </Navbar.Collapse>
                </Container>
            </Navbar>
            {AvatarToggle ? <div>
            <Form inline onSubmit={uploadAvatar} style={{paddingTop: "3px"}}>
              <Form.Control 
                type='file'
                onChange={(e: any) =>{SetFile(e.target.files)}}
                accept="image/*,.pdf"
              />
              <Button variant="secondary" style={{marginBottom: "3px"}}
              size="sm" type="submit">Upload</Button>
              <span>  Maximum size 200ko</span>
              </Form>
              </div> : <></> }
              {NotifToggle ?
              <div className="col-2 row-height row-height-notif">
                        {/* <hr/> */}
                        <h5 id='subTitle'>FRIEND REQUESTS</h5>
                        {FriendRequests.map((listvalue) => {
                          return (ListRequests(listvalue))
                        })}
                        <hr/>
                        <h5 id='subTitle'>MESSAGES</h5>
                    </div> : <></>}
            </div>
    )
}

export default withRouter(MainNavBar);
