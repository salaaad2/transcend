import { FormEvent, ReactEventHandler, useState } from 'react';
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
import { error } from 'console';

function LoginPage(props: any): any {

    const socket = React.useContext(SocketContext);
    const { user, setUser } = useUser()!;
    const token = 'bd6ff1c4c3e4091081ae555d9885fa7b5a5cb68782cce3890ca445d0afb23dfd';

    function getAvatar() {
      // Utils.intercept401(props);
      return axios.get(`${process.env.REACT_APP_BASE_URL}/avatar`,
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
          console.log('avatar1', str);
          user.avatar = str;
          return axios.post(`${process.env.REACT_APP_BASE_URL}/avatar`,
          data, { withCredentials: true})
          }})
        }

    if (user.id < 0)
      return (
          <div className="Login">
              <Container>
                  <Row>
                      <Col>
                          <Button variant="primary" type="submit" onClick={(e) => {
                              e.preventDefault();
                              axios.post('https://api.intra.42.fr/oauth/authorize', {
                                  headers: {
                                      'Authorization' : 'Bearer ' + token,
                                      'Access-Control-Allow-Origin' : 'https://signin.intra.42.fr, https://api.intra.42.fr',
                                      /* 'access-control-allow-credentials' : true, */
                                  }},{withCredentials: true})
                                   .catch(function(err) {
                                       alert(err.message);
                                   })
                          }}>
                              Login
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
