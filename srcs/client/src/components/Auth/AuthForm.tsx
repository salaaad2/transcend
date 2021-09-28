import classes from './AuthForm.module.css';
import { FormEvent, useRef } from 'react';
import AuthService from '../../services/auth.service'

function AuthForm (props: any) {

    const usernameInputRef = useRef<HTMLInputElement | null>(null);
    const passwordInputRef = useRef<HTMLInputElement | null>(null);

    function submitHandler(event:FormEvent) {
        event.preventDefault();

        let enteredUsername;
        let enteredPassword;

        if (usernameInputRef.current?.value)
            enteredUsername = usernameInputRef.current.value;
        if (passwordInputRef.current?.value)
            enteredPassword = passwordInputRef.current.value;

        const authData= {
            username: enteredUsername,
            password: enteredPassword,
        };
        AuthService.login(enteredUsername, enteredPassword);
        props.onAuth(authData);
    }

    return (
            <form className={classes.form} onSubmit={submitHandler}>
                <div className="username">
                    <label htmlFor="username" />
            <input type="text"
                        placeholder="Login"
                        id="username"
                        name="username"
                        ref={usernameInputRef}
                        required/>
                </div>
                <div className="password">
                    <label htmlFor="password" />
                    <input type="password"
                        placeholder="Password"
                        id="password"
                        name="password"
                        ref={passwordInputRef}
                        required/>
                </div>
                <div className="button">
                    <button type='submit'>Submit</button>
                </div>
            </form>
    )
}

export default AuthForm;
