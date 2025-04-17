import React from 'react';
import qbLogoGray from '../../assets/img/qblogo-grey.svg?url';
import qbLogo from '../../assets/img/qb_logo.svg?url';
import {UserData} from '../../QBHeplers';
import packageJson from '../../../package.json';
import './Auth.scss';


export type FunctionTypeLoginDataToVoid = (data: UserData) => void;

export const nicknameValidate = (nickname: string) =>
    /^(?=[a-zA-Z])[0-9a-zA-Z]{3,20}$/.test(nickname);

export const fullNameValidate = (fullName: string) =>
    /^((?! {2})[0-9a-zA-Z ]){3,20}$/.test(fullName);

export const passwordValidate = (password: string) =>
    password.length > 0;

export const messageValidatorUserName = "The field should contain alphanumeric characters only in a range 3 to 20. The first character must be a letter.";
export const messageValidatorFullName = "The field should contain alphanumeric characters only in a range 3 to 20. The first character must be a letter.";
export const messageValidatorUserPassword = "The field cannot be empty.";


interface AuthProps {
    children?: React.ReactNode
}

function Copyright(props: any) {
    return (
            <span>
                 {'Copyright © '}
                <a href="https://quickblox.com/">
                    QuickBlox
                    <img alt="QuickBlox" src={qbLogoGray} />
                </a>{' '}
                {new Date().getFullYear()}
                {'.'}
            </span>
    );
}

const Auth = ({children} : AuthProps) => {
    return (
        <div className="auth">
            <header>
                <img className="signup-logo-blue" alt="QuickBlox"
                     src={qbLogo}/>
            </header>
            {children ?? children}
            <footer>
                <span>Sample React Chat UIKit DemoApp v.{packageJson.version}</span>
                <br/>
                <span>React Chat UIKit v.{packageJson.dependencies["quickblox-react-ui-kit"]}</span>
                <br/>
                <span>React v.{packageJson.dependencies["react"]}</span>
                <br/>
                <span><Copyright/></span>
            </footer>
        </div>
    );
}

export default Auth;
