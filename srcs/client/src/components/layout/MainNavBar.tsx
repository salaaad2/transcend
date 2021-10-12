import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import './MainNavBar.module.css';
import Utils from "../utils/utils";
import { useUser, defaultUser } from '../context/UserAuthContext';
import React from "react";
import { SocketContext } from '../../socket/context';
import { toast } from "react-toastify";

function MainNavBar(props: any) {

    const { user, setUser } = useUser()!;
    let profilelink = "#profile/:" + user.username;
    let avatar = user.avatar;
    const [Avatar, setAvatar] = useState(avatar);
    const socket = React.useContext(SocketContext);
    const isAdmin = user.ismod === true;
    const [Notifications, setNotifications] = useState(false);
    const [FriendRequests, setFriendRequests] = useState<string[]>([]);
    const [Messages, setMessages] = useState<string[]>([]);
    const [NotifToggle, setNotifToggle] = useState(false);
    // let renderVal: number = 0;
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

    function notifyMsg(data: string[]) {
      const Msg = () => (
        <>
        <p>{data[1]} : {data[2]}</p>
        </>
      )
        if (data[1] !== user.username && !user.blocklist.includes(data[1]))
        toast(<Msg/>);
    }

    function acceptRequest(notif: string) {
      axios.post(`/profile/addfriend`,
      {user1: user.username, user2: notif}, 
      { withCredentials: true }).then(() => {
        user.friendlist.push(notif);
        setUser(user);
        let username = user.username;
        socket.emit('accept_friend', {username, notif});
        let NotifTemp = [...FriendRequests];
        NotifTemp.splice(FriendRequests.findIndex(element => {return element === notif}), 1);
        console.log('temp:', NotifTemp);
        setFriendRequests(FriendRequests => {
          return FriendRequests = NotifTemp
        });
        // renderVal++;
      });
    }

    function rejectRequest(notif: string) {
      let username = user.username;
      socket.emit('reject_friend', {username, notif});
      let NotifTemp = [...FriendRequests];
      NotifTemp.splice(FriendRequests.findIndex(element => {return element === notif}), 1);
      setFriendRequests(FriendRequests => {
        return FriendRequests = NotifTemp
      });
      // renderVal++;
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

    function ListMsg(notif: string) {
      idNotif++;
      return (
        <div key={idNotif} className="friendlist">
          <ul className="ul">
            <li>
                <div className="userinfo">{notif}</div>
            </li>
          </ul>
        </div>
      )
    }

    useEffect(() => {
      axios.get(`/authentication`,
      { withCredentials: true }).then((response) => {
        if (response.data && (response.data.friendrequests.length !== 0 || response.data.pv_msg_notifs.length !== 0)) {
          console.log('msglist', response.data.pv_msg_notifs);
          setFriendRequests(response.data.friendrequests);
          setMessages(response.data.pv_msg_notifs);
          setAvatar(response.data.avatar);
          console.log('rq:', response.data.friendrequests);
          setNotifications(true);
        }
      })
    }, [])

    useEffect(() => {
        socket.on('mod_client', (data: string) => {
            if (data === user.username) {
                console.log('you are now site moderator');
                Utils.notifyInfo('You are now moderator. Reload the page to access admin panel');
            }
        })
    })

    /* 100% works I swear*/
    useEffect(() => {
        /* console.log('logout requested by admin'); */
        socket.on('log_out', (data: string) => {
        if (data === user.username) {
          console.log('logout');
          socket.emit('logout', user.username);
          socket.off();
          axios.post(`/authentication/log-out`, {})
          .then((response) => {
              console.log(response.data);
              setUser(defaultUser);
              props.history.push('/login');
          })
        }      })
    })

    useEffect(() => {
      socket.on('notifications', (data: string[]) => {
        if (data) {
          if (data[0] === 'friendrequest') {
            Utils.notifyInfo(data[1]);
            setNotifications(true);
            setFriendRequests(prevState => [...prevState, data[1]]);
          }
          else if (data[0] === 'accept_friend') {
            Utils.notifyInfo(data[1] + ' accepted you as friend');
            user.friendlist.push(data[1]);
            setUser(user);
          }
          else if (data[0] === 'game_request') {
            notifyGame(data);
          }
          else if (data[0] === 'message') {
            setNotifications(true);
            setMessages(prevState => 
              (!prevState.find(element => element === data[1]) ?
              [...prevState, data[1]] : [...prevState]))
            notifyMsg(data);
          }
          else if (data[0] === 'rm_msg') {
            console.log(data[1]);
            setMessages(Messages => {
              let NotifTemp = [...Messages];
              NotifTemp.splice(Messages.findIndex(element => {return element === data[1]}), 1);
              return Messages = NotifTemp;
            });
          }
          else if (data[0] === 'clear_notifs') {
            setNotifications(false);
          }
            else if (data[0] == 'rm_msg') {
                console.log(data[1]);
                setMessages(Messages => {
                    let NotifTemp = [...Messages];
                    NotifTemp.splice(Messages.findIndex(element => {return element == data[1]}), 1);
                    return Messages = NotifTemp;
                });
            }
            else if (data[0] == 'clear_notifs') {
                setNotifications(false);
            }
        }
      })
      return (() => {
        socket.off('notifications');
      })
    })

    useEffect(() => {
      socket.on('start_duel', (data: number) => {
        props.history.push(`/game/:${data}`);
      })
      return(() => {
        socket.off('start_duel');
      })
    })

    // useEffect(() => {
    //   socket.on('receive_message', (data: any) => {
    //     socket.emit('notif_message', [data, true]);
    //   });
    //   return(() => {
    //     socket.off('receive_message');
    //   })
    // }, [])

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
                        <NavDropdown.Item href="#rules">Rules</NavDropdown.Item>
                      </NavDropdown>
                      {(isAdmin) ? <Nav.Link href="#adminpanel">Admin Panel</Nav.Link> : <div></div>}
                      <Nav.Link href="#chat">Chat</Nav.Link>
                      <Nav.Link href="#ladder">Ladder</Nav.Link>
                    </Nav>
                    <Nav.Link href={profilelink}>
                        <img src={Avatar} alt="avatar"
                        style={{border: "solid white 2px"}} width="50" height="50"/>
                    </Nav.Link>
                    <Nav>
                      <NavDropdown title={user.id > 0 ? user.username : "null"} id="profile" >
                        {/* <NavDropdown.Item onClick={() => setToggle(!AvatarToggle)}>Change Avatar</NavDropdown.Item> */}
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
            {/* {AvatarToggle ? <div>
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
              </div> : <></> } */}
              {NotifToggle ?
              <div className="col-2 row-height row-height-notif">
                        {/* <hr/> */}
                        <h5 id='subTitle'>FRIEND REQUESTS</h5>
                        {FriendRequests.map((listvalue) => {
                          return (ListRequests(listvalue))
                        })}
                        <hr/>
                        <h5 id='subTitle'>MESSAGES</h5>
                        {Messages.map((listvalue) => {
                          return (ListMsg(listvalue))
                        })}
                        <a style={{fontSize: 'small', textDecoration: 'none', marginLeft: '4rem'}} href='#chat'>Go to chat</a>
                    </div> : <></>}
            </div>
    )
}

export default withRouter(MainNavBar);
