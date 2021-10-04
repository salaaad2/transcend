import { FormEvent, useState } from 'react';
import { Button, Container, Row, Col, Modal } from 'react-bootstrap';
import axios from 'axios';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-gridy-sprites';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router-dom';
import React from 'react';
import { useEffect } from 'react';
import { SocketContext } from '../socket/context';
import MainNavBar from '../components/layout/MainNavBar';
function OtpPage() {

    const { user, setUser } = useUser()!;
    const socket = React.useContext(SocketContext);
    const [ data, setData ] = useState("");
    const QRCode = require('qrcode.react');

    useEffect(() => {
        if (!data)
        {
            axios.post('/2fa/generate', user)
                 .then((res) => {
                     setData(res.data);
                     console.log(res.data);
                 })
                 .catch((res) => {
                     alert (res);
                 })
        }
    })

    return (
        <div>
            <MainNavBar />
            <QRCode value={data} />
        </div>
    )
}

export default OtpPage;
