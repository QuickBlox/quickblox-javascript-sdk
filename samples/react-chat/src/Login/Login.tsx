import React, {useEffect, useState} from 'react';
import './Login.scss';
import qbLogoGray from '../assets/img/qblogo-grey.svg';
import { MainButton, TypeButton } from 'quickblox-react-ui-kit';

export type UserData = {
    userName: string;
    password: string;
    fullName?: string;
};

export type FunctionTypeLoginDataToVoid = (data: UserData) => void;

type LoginProps = {
    loginHandler?: FunctionTypeLoginDataToVoid;
};

const Login: React.FC<LoginProps> = ({ loginHandler }: LoginProps) => {
    const messageValidatorUserName = "The field should contain alphanumeric characters only in a range 3 to 20. The first character must be a letter.";
    const messageValidatorUserPassword = "The field cannot be empty.";

    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [validInputValue, setValidInputValue] = useState(false);
    const [stateTheme, setStateTheme] = useState({ theme: 'light'});


    useEffect( ()=> {
        if (
            (userName.length >= 3 && userName.length <= 20)
            && (userPassword.length >= 9)
        ) {
            setValidInputValue(true);
        }
        else {
            setValidInputValue(false);
        }

    }, [userName, userPassword]);

    const submitForm = () => {
        const data = {
            userName: userName,
            password: userPassword,
            nameTheme: stateTheme.theme
        };

        console.log('data: ', data);

        if (loginHandler) {
            loginHandler(data);
        }
    };

    const onChangeThemeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        event.persist();
        const { id, value } = event.target;
        setStateTheme(prev => ({...prev, theme: id}))
    };

    return(
        <div className="login__wrapper">
            <div className="login__container">
                <div className="login__inner">
                    <div className="login__top">
                        <a className="login__logo" href="https://quickblox.com/">
                            <img alt="QuickBlox" src="https://quickblox.com/wp-content/themes/QuickbloxTheme2021/img/header-logo.svg" />
                        </a>

                        <h1>QB UIKit React Sample</h1>

                        <h3>Please enter Username and password</h3>
                    </div>
                    <form className="login__form" >
                        <div className="login_form__row">
                            <input
                                value = {userName}
                                onChange={(e) => setUserName(e.target.value) }
                                required
                                title={messageValidatorUserName}
                                type="text"
                                placeholder="User name"
                            />
                        </div>
                        <div className="login_form__row">
                            <input
                                value = {userPassword}
                                onChange={(e) => setUserPassword(e.target.value) }
                                required
                                title={messageValidatorUserPassword}
                                type="password"
                                placeholder="Password"
                            />
                        </div>
                        <div className='login_form__row-rbtn'>
                            <input
                                value="light"
                                type="radio"
                                id="light"
                                name="theme"
                                checked={stateTheme.theme === 'light'}
                                onChange={onChangeThemeHandler}
                            />
                            <label htmlFor="lightTheme">Light Theme</label> <br/>

                            <input
                              value="dark"
                              type="radio"
                              id="dark"
                              name="theme"
                              checked={stateTheme.theme === 'dark'}
                              onChange={onChangeThemeHandler}
                            />
                            <label htmlFor="darkTheme" style={{color: '#202F3E'}}>Dark Theme</label> <br/>
                            <br />
                        </div>
                        <div className="login__button_wrap">
                            <MainButton
                                title="Login"
                                typeButton={TypeButton.outlined}
                                disabled={!validInputValue}
                                clickHandler = {submitForm}
                                styleBox={{width: "304px"}}
                            />
                        </div>
                    </form>
                </div>
                <div className="login__footer">
                    <div className="footer__logo_wrap">
                        <a className="footer__logo" href="https://quickblox.com/">
                            <img alt="QuickBlox" src={qbLogoGray} />
                        </a>
                        <p>by QuickBlox</p>
                    </div>
                    <span className="footer__version">v. 0.1.0</span>
                </div>
            </div>
        </div>
        )}

export default Login;
