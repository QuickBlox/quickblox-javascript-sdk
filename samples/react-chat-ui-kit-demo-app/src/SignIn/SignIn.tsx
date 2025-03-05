import React, {useEffect, useState} from "react";
import {Button, TextField, CheckBox} from 'quickblox-react-ui-kit';
import {Link} from "react-router-dom";

import {
    FunctionTypeLoginDataToVoid,
    messageValidatorUserName, messageValidatorUserPassword,
    nicknameValidate,
    passwordValidate
} from "../layout/Auth/Auth";

import './SignIn.scss';

type LoginProps = {
    signInHandler?: FunctionTypeLoginDataToVoid;
    errorMessage?: string;
    isOnline: boolean
};

const SignIn: React.FC<LoginProps> = ({signInHandler, errorMessage, isOnline}: LoginProps) => {
    document.title = 'Login';
    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [validInputValues, setValidInputValues] = useState(false);
    const [theme, setTheme] = useState('light');
    const [validValue, setValidValue] = useState(
        {
            userName: {isTouched: false, isNotValid: true},
            userPassword: {isTouched: false, isNotValid: true}
        }
    );

    useEffect(() => {
        setValidInputValues(
            !validValue.userName.isNotValid && validValue.userName.isTouched
            &&
            !validValue.userPassword.isNotValid && validValue.userPassword.isTouched
        );
    }, [validValue]);

    useEffect(() => {

    }, [userName]);


    const submitForm = (event: React.SyntheticEvent) => {
        console.log('click', event)
        event.preventDefault();
        const data = {
            login: userName,
            password: userPassword,
            nameTheme: theme
        };

        console.log('data', data)

        if (signInHandler) {
            signInHandler(data);
        }
    };

    return (
        <div className="container">
            <form className="login-form" onSubmit={submitForm}>
                <div className="login-form-title">
                    <h3>QB UIKit React Sample</h3>
                    <h2>Sign In</h2>
                    <p>Don't have an account?
                        <Link to='/sign-up'>
                            {" Sign Up"}
                        </Link>
                    </p>
                </div>
                <div className="login-form-content">
                    <TextField
                        type="text"
                        onChange={(e) => {
                            setUserName(e);
                            const validValueUserName = {...validValue.userName};
                            validValueUserName.isNotValid = !nicknameValidate(e);
                            setValidValue({...validValue, userName: validValueUserName})
                        }}
                        onFocus={() => setValidValue({
                            ...validValue,
                            userName: {...validValue.userName, isTouched: true}
                        })}
                        value={userName}
                        placeholder="User name"
                        id="userName"
                    />
                    {
                        validValue.userName.isTouched && validValue.userName.isNotValid
                            ?
                            <p className="error">{messageValidatorUserName}</p>
                            :
                            null
                    }

                    <TextField
                        type="password"
                        onChange={(e) => {
                            setUserPassword(e);
                            const validValueUserPassword = {...validValue.userPassword};
                            validValueUserPassword.isNotValid = !passwordValidate(e);
                            setValidValue({...validValue, userPassword: validValueUserPassword})
                        }}
                        onFocus={() => setValidValue({
                            ...validValue,
                            userPassword: {...validValue.userPassword, isTouched: true}
                        })}
                        value={userPassword}
                        placeholder="Password"
                        id="userPassword"
                    />

                    {
                        validValue.userPassword.isTouched && validValue.userPassword.isNotValid
                            ?
                            <p className="error">{messageValidatorUserPassword}</p>
                            :
                            null
                    }

                    <div className="theme-switch">
                        <label>Theme:</label>
                        <CheckBox
                            disabled={false}
                            checked={theme === "light"}
                            onChange={() => setTheme("light")}
                        />
                        <span>Light</span>
                        <CheckBox
                            disabled={false}
                            checked={theme === "dark"}
                            onChange={() => setTheme("dark")}
                        />
                        <span>Dark</span>
                    </div>

                </div>
                <div className="login-form-btn">
                    <Button
                        title="Sign In"
                        type="submit"
                        disabled={!validInputValues || !isOnline}>
                        Sign In
                    </Button>
                    {errorMessage || !isOnline
                        ?
                        <p className="error">
                            {errorMessage}
                        </p>
                        :
                        null
                    }
                </div>
            </form>
        </div>
    );
}

export default SignIn;
