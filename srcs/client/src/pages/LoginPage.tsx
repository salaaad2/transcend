import { FormEvent, useState } from 'react';
import AuthService from '../services/auth.service'
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import "./Login.css"
import axios from 'axios';
import Utils from '../components/utils/utils'
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-gridy-sprites';
import { SocketContext } from '../socket/context'
import React from 'react';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router';

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

    function validateForm() {
      return username.length > 0 && password.length > 0;
    }

    function submitHandler(event:FormEvent) {
        event.preventDefault();
        console.log('env', process.env.REACT_APP_BASE_URL);

        AuthService.login(username, password).then(
        (response) => {
            setUser(response);
            socket.emit('login', username);
        },
        error => {
            console.log('error');
            setError('Wrong credentials provided');
            }
        );
    }
    if (user.id < 0)
      return (
          <div className="Login">
          <Form onSubmit={submitHandler}>
            <div className="textbox">
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            </div>
            <Container>
              <Row>
                <div style={{color: 'red', paddingBottom: '20px'}}>{error}</div>
              </Row>
              <Row>
                <Col>
            <Button variant="primary" type="submit" disabled={!validateForm()}>
              Login
            </Button>
              </Col>
              <Col>
            <Button href='/#register' variant="link">
              Register
            </Button>
              </Col>
              </Row>
            </Container>
          </Form>
        </div>
      );
    else
        return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />);
}

export default LoginPage;
