import './MainPage.css'
import { Redirect } from 'react-router';
import { useUser } from '../components/context/UserAuthContext';
import { useEffect, useState } from 'react';
import { Form, Col, Row, Container, Button } from 'react-bootstrap';
import { SocketContext } from '../socket/context';
import React from 'react';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-gridy-sprites';

function MainPage(props: any) {

    const { user, setUser } = useUser()!;
    const [ username, setUsername ] = useState('');
    const [ error, setError ] = useState('')
    const socket = React.useContext(SocketContext)

    function validateForm() {
        return username.length > 2;
    }

    async function submitHandler(e:any) {
        e.preventDefault();
        let svg = createAvatar(style, {
            seed: username
        });
        let encoded = btoa(svg);
        let str = 'data:image/svg+xml;base64,' + encoded;
        user.avatar = str;
        socket.emit('request_set_username', {
            username: username,
            realname: user.realname,
            avatar: str,
        });
    }

    useEffect(() => {
        socket.on('send_username_set', (data:any) => {
        if (data.realname === user.realname)
        {
            user.username = data.username;
            user.currentChannel = "";
            setUser(user);
            socket.emit('login', data.username);
            props.history.push('/');
        }
        });
        socket.on('send_error', (err:string) => {
            setError(err);
        });
        return(() => {
            socket.removeAllListeners('send_error');
            socket.removeAllListeners('send_username_set');
        })
    })

    if (user.id > 0)
    {
        if (user.username.length === 0)
        {
            return (
                <div>
                    <Form onSubmit={submitHandler}>
                        <div className="textbox">
                            <Form.Control
                                autoFocus
                                type="text"
                                value={username}
                                placeholder="Username"
                                onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="submit-btn">
                            <Button variant="primary" type="submit" disabled={!validateForm()}>
                                Submit
                            </Button>
                        </div>
                        <Container>
                            <Row>
                                <div style={{color: 'red', paddingBottom: '20px', paddingLeft: '30%'}}>{error}</div>
                            </Row>
                            <Row>
                                <Col>
                                </Col>
                            </Row>
                        </Container>
                    </Form>
                </div>
            )

        }
        else
        {
            return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />);
        }
    }
    else
    {
        return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
    }
}

export default MainPage;
