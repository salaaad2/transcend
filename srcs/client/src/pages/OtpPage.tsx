import { FormEvent, useState } from 'react';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import axios from 'axios';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-gridy-sprites';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router-dom';
import React from 'react';
import { useEffect } from 'react';
import { SocketContext } from '../socket/context';
import MainNavBar from '../components/layout/MainNavBar';
import { toDataURL } from 'qrcode';

function OtpPage(props:any) {

    const { user, setUser } = useUser()!;
    const [ data, setData ] = useState("");
    const [ code, setCode ] = useState("");

    useEffect(() => {
        if (!data && user.isOtpEnabled === false)
        {
            axios.post('/2fa/generate', user)
                 .then((res) => {
                     toDataURL(res.data)
                         .then(url => {
                             setData(url);
                         })
                         .catch(err => {
                             alert(err);
                         });
                 })
                 .catch((e) => {
                     alert(e)
                 });
        }
    });

    function submitHandler(e : FormEvent) {
        e.preventDefault()
        axios.post('/2fa/turn-on', {
            user: user,
            otpCode: code,
        })
        .then(() => {
            alert('OTP Enabled');
            user.isOtpEnabled = true;
            props.history.push("/profile/:"+user.username);
        })
        .catch((e) => {
            alert(e.response.data.message);
        });
    }

        if (user.isOtpEnabled === false)
        {
            return (
                <div>
                    <div className='header'>
                        <MainNavBar />
                    </div>
                    <div className="qrcode">
                        <img alt="otp-auth" src={data} />
                    </div>
                    <div className="form">
                        <Form onSubmit={submitHandler}>
                            <div className="textbox">
                                <Form.Group className="mb-3">
                                    <Form.Label>Code</Form.Label>
                                    <Form.Control
                                        autoFocus
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                </Form.Group>
                            </div>
                        </Form>
                    </div>
                </div>
            )
        }
        else
            return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />);
}

export default OtpPage;
