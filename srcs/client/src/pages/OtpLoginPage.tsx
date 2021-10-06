import { FormEvent, useState } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
import { useUser } from '../components/context/UserAuthContext';
import "./OtpLoginPage.css";

function OtpLoginPage(props: any) {

    const { user } = useUser()!;
    const [ code, setCode ] = useState("");
    const [ error, setError ] = useState("");


    function submitHandler(e : FormEvent) {
        e.preventDefault()
        axios.post('/2fa/authenticate', {
            user: user,
            otpCode: code,
        })
        .then(() => {
            props.history.push('/');
        })
        .catch((err) => {
            setError(err.response.data.message)
        });
    }


    function validateForm() {
        return code.length === 6;
    }

    return (
        <div>
            <h4>Enter code displayed on your application</h4>
            <Form onSubmit={submitHandler}>
                <div className="otp-code">
                    <Form.Control
                        autoFocus
                        type="text"
                        value={code}
                        placeholder="Code"
                        onChange={(e) => setCode(e.target.value)} />
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

export default OtpLoginPage;
