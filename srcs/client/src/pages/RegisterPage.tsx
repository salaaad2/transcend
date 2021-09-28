import { FormEvent, useState } from 'react';
import { Redirect } from 'react-router-dom';
import AuthService from '../services/auth.service';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import "./Login.css"
import { useUser } from '../components/context/UserAuthContext';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-gridy-sprites';

function RegisterPage(props: any) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { user } = useUser()!;

    function validateForm() {
      return username.length > 0 && password.length > 0;
    }

    function submitHandler(event:FormEvent) {
        event.preventDefault();

        let svg = createAvatar(style, {
          seed: username
        });
        let encoded = btoa(svg);
        let str = 'data:image/svg+xml;base64,' + encoded;
        user.avatar = str;

        AuthService.register(username, password, str).then(
        () => {
            props.history.push("/login");
            window.location.reload();
        },
        error => {
              error.toString();
              console.log(error.response.data.message);
              setError(error.response.data.message);
            }
        );
    }

    if (user.id < 0)
        return (
            <div className="Login">
            <Form onSubmit={submitHandler}>
              <div className="textbox">
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              </div>
              <Container>
              <Row>
                  <div style={{color: 'red', paddingBottom: '20px'}}>{error}</div>
                </Row>
                <Row>
                  <Col>
              <Button variant="primary" type="submit" disabled={!validateForm()}>
                Register
              </Button>
                </Col>
                <Col>
              <Button href='/#login' variant="link">
                Login
              </Button>
                </Col>
                </Row>
              </Container>
            </Form>
          </div>
        );
    else
      return(<Redirect to={{ pathname: "/", state: { from: props.location } }} />);
}

export default RegisterPage;
