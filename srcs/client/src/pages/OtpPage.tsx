import { FormEvent, useState } from 'react';
import { Form, Button, Row, Col, Container} from 'react-bootstrap';
import axios from 'axios';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router-dom';
import { useEffect } from 'react';
import MainNavBar from '../components/layout/MainNavBar';
import { toDataURL } from 'qrcode';
import Utils from '../components/utils/utils';
import './OtpPage.css';
function OtpPage(props:any) {

    const { user } = useUser()!;
    const [ data, setData ] = useState("");
    const [ code, setCode ] = useState("");
    const [ error, setError ] = useState("");

    useEffect(() => {
        if (!data && user.isOtpEnabled === false && user.id > 0 && user.username.length > 0)
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

    function validateForm() {
        return code.length === 6;
    }

    function submitHandler(e : FormEvent) {
        e.preventDefault()
        if (user.isOtpEnabled === false && user.id > 0 && user.username.length > 0)
        {
            axios.post('/2fa/turn-on', {
                user: user,
                otpCode: code,
        })
                .then(() => {
                    Utils.notifySuccess('OTP Enabled');
                    user.isOtpEnabled = true;
                    props.history.push("/profile/:"+user.username);
                })
                .catch((e) => {
                    setError(e.response.data.message);
                });
    }
    else
    {
            axios.post('/2fa/turn-off', {
                user: user,
                otpCode: code,
        })
                .then(() => {
                    Utils.notifySuccess('OTP Disabled');
                    user.isOtpEnabled = false;
                    props.history.push("/profile/:"+user.username);
                })
                .catch((e) => {
                    setError(e.response.data.message);
                });
    }
}

    if (user.isOtpEnabled === false && user.id > 0 && user.username.length > 0)
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
                    <Button variant="primary" type="submit" onClick={submitHandler} disabled={!validateForm()}>
                        Sumbit code
                    </Button>
                    <Container>
                        <Row>
                            <div style={{color: 'red', paddingBottom: '20px', paddingLeft: '30%'}}>{error}</div>
                        </Row>
                        <Row>
                            <Col>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        )
    }
    else if (user.id > 0 && user.username.length > 0)
    {
        return (
            <div>
                <MainNavBar />
                <div className='header' >
                    <h2>Two factor authentication page</h2>
                </div>
                <div className="otp-code">
                    <h4>Enter code on your application to remove authenticator</h4>
                    <Form onSubmit={submitHandler}>
                        <Form.Control
                            autoFocus
                            type="text"
                            value={code}
                            placeholder="Enter code"
                            onChange={(e) => setCode(e.target.value)}/>
                    </Form>
                    <Button variant="primary" type="submit" onClick={submitHandler} disabled={!validateForm()}>
                        Sumbit code
                    </Button>
                    <Container>
                        <Row>
                            <div style={{color: 'red', paddingBottom: '20px', paddingLeft: '30%'}}>{error}</div>
                        </Row>
                        <Row>
                            <Col>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        )
    }
    else
        return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
}
export default OtpPage;
