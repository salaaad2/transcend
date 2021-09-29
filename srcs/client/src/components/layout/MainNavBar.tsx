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

function MainNavBar(props: any) {

    const [File, SetFile] = useState([]);
    const [AvatarToggle, setToggle] = useState(false);
    const { user, setUser } = useUser()!;
    let profilelink = "#profile/:" + user.username;
    let avatar = user.avatar;
    const [Avatar, setAvatar] = useState(avatar);
    const socket = React.useContext(SocketContext);
    const [Notifications, setNotifications] = useState(false);

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
          console.log('use4');
          console.log(response.data.friendrequests);
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
          }
          else if (data[0] == 'accept_friend') {
            console.log(data);
            Utils.notifyInfo(data[1] + 'accepted you as friend');
            user.friendlist.push(data[1]);
            setUser(user);
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
                      <Nav.Link onClick={() => {props.history.push('/')}} className='notif-btn'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-bell-fill" viewBox="0 0 16 16">
                              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
                            </svg>
                            {Notifications ? <span className="notif"></span> : <div></div>}</Nav.Link>
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
              </div> : <div></div> }
            </div>
    )
}

export default withRouter(MainNavBar);
