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
import './OtpPage.css';
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
        if (user.isOtpEnabled === false)
        {
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
    else
    {
            axios.post('/2fa/turn-off', {
                user: user,
                otpCode: code,
        })
                .then(() => {
                    alert('OTP Disabled');
                    user.isOtpEnabled = false;
                    props.history.push("/profile/:"+user.username);
                })
                .catch((e) => {
                    alert(e.response.data.message);
                });
    }
}

    if (user.isOtpEnabled === false)
    {
        return (
            <div>
                <MainNavBar />
                <div className='header' >
                    <h2>Two factor authentication page</h2>
                </div>
                <div className="qrcode">
                    <img alt="otp-auth" src={data} width="300"/>
                </div>
                <div className="otp-instructions">
                    <h4>Instructions :</h4>
                    <li>
                        <ul>1 - Download google authenticator</ul>
                        <ul>2 - Scan the QRCode</ul>
                        <ul>3 - Enter the code on the application</ul>
                        <ul>4 - Your account is protected !</ul>
                    </li>
                </div>
                <div className="otp-code">
                    <Form onSubmit={submitHandler}>
                        <Form.Control
                            autoFocus
                            type="text"
                            value={code}
                            placeholder="Enter code"
                            onChange={(e) => setCode(e.target.value)}/>
                    </Form>
                    <Button variant="primary" type="submit" onClick={submitHandler}>
                        Sumbit code
                    </Button>
                </div>
            </div>
        )
    }
    else
    {
        return (
            <div>
                <MainNavBar />
                <div className='header' >
                    <h2>Two factor authentication page</h2>
                </div>
                <div className="otp-code">
                    <h4>Enter on your application to remove authenticator</h4>
                    <Form onSubmit={submitHandler}>
                        <Form.Control
                            autoFocus
                            type="text"
                            value={code}
                            placeholder="Enter code"
                            onChange={(e) => setCode(e.target.value)}/>
                    </Form>
                    <Button variant="primary" type="submit" onClick={submitHandler}>
                        Sumbit code
                    </Button>
                </div>
            </div>
        )
    }
}
export default OtpPage;
