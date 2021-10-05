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
import React from 'react';
import { useEffect } from 'react';
import { SocketContext } from '../socket/context';

function LoginPage(props: any): any {

    const { user, setUser } = useUser()!;
    const socket = React.useContext(SocketContext);


    useEffect(() => {
        axios.get('/authentication/logged')
             .then((res:any) => {
                 setUser(res.data);
             })
             .catch((err) => {
             });
    })

    if (user.id < 0)
    {
        return (
            <div className="Login">
                <Container>
                    <Row>
                        <Col>
                            <Button variant="primary" type="submit" onClick={() => {
                                window.location.href = `http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/authentication/log-in`;
                            }}>42 Login
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
    else
        return (<Redirect to={{ pathname: "/", state: { from: props.location} }} />);
}

export default LoginPage;
