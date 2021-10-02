import { FormEvent, useState } from 'react';
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import "./Login.css"
import axios from 'axios';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-gridy-sprites';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router-dom';

function LoginPage(props: any): any {

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
            seed: user.username
          });
          let encoded = btoa(svg);
          let str = 'data:image/svg+xml;base64,' + encoded;
          let data = {
            "userid": response.data.id,
            "image": str
          }
          user.avatar = str;
          return axios.post(`/avatar`,
          data, { withCredentials: true})
          }})
        }

    if (user.id < 0)
    {
        return (
            <div className="Login">
                <Container>
                    <Row>
                        <Col>
                            <Button variant="primary" type="submit" onClick={() => {
                                window.location.href = 'http://localhost:3000/authentication/log-in';
                            }}>42 Login
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
    else
        return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />);
}

export default LoginPage;
