import { FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import { useUser } from '../components/context/UserAuthContext';

function OtpLoginPage(props: any) {

    const { user } = useUser()!;
    const [ code, setCode ] = useState("");


    function submitHandler(e : FormEvent) {
        e.preventDefault()
        axios.post('/2fa/authenticate', {
            user: user,
            otpCode: code,
        })
        .then(() => {
            props.history.push('/');
        })
        .catch(() => {
            alert('WRONG CODE');
        });
    }
    return (
        <div>
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

export default OtpLoginPage;
