import { FormEvent, useState } from 'react';
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import "./Login.css"
import axios from 'axios';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-gridy-sprites';
import { SocketContext } from '../socket/context'
import React from 'react';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router-dom';

function LoginPage(props: any): any {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const socket = React.useContext(SocketContext);
    const { user, setUser } = useUser()!;

    function getAvatar() {
      // Utils.intercept401(props);
      return axios.get('/avatar',
      { withCredentials: true})
      .then((response) => {
        if (response.data.avatar) {
          user.avatar = response.data.avatar.image;
          console.log('avatar: ', user.avatar);
          return response.data.avatar;
        }
        else {
          let svg = createAvatar(style, {
            seed: username
          });
          let encoded = btoa(svg);
          let str = 'data:image/svg+xml;base64,' + encoded;
          let data = {
            "userid": response.data.id,
            "image": str
          }
          console.log('avatar1', str);
          user.avatar = str;
          return axios.post(`/avatar`,
          data, { withCredentials: true})
          }})
        }

    function makeid(length: number) {
        let result           = '';
        let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }


    if (user.id < 0)
      return (
          <div className="Login">
              <Container>
                  <Row>
                      <Col>
                          <Button variant="primary" type="submit" onClick={(e) => {
                              e.preventDefault();
                              axios.get('/authentication/log-in')
                              .catch(function(err) {
                                  alert(err);
                              });
                          }}>42 Login
                          </Button>
                      </Col>
                  </Row>
              </Container>
          </div>
      );
    else
        return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />);
}

export default LoginPage;
