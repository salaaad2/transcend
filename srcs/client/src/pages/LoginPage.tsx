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
import OAuth2Login from 'react-simple-oauth2-login';

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
              <OAuth2Login
                  authorizationUrl="https://api.intra.42.fr"
                  responseType="token"
                  clientId="bd6ff1c4c3e4091081ae555d9885fa7b5a5cb68782cce3890ca445d0afb23dfd"
                  redirectUri="http://localhost:4000/"
                  />,
          </div>
      );
    else
        return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />);
}

export default LoginPage;
