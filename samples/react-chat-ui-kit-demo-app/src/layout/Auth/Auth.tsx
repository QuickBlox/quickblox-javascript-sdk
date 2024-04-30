import React from 'react';
import './Auth.scss';
import qbLogoGray from "../../assets/img/qblogo-grey.svg";
import {Grid, Typography} from "@mui/material";
import Link from "@mui/material/Link";
import {UserData} from '../../QBHeplers';
import packageJson from '../../../package.json';

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
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://quickblox.com/">
                QuickBlox <img alt="QuickBlox" src={qbLogoGray} />
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const Auth = ({children} : AuthProps) => {
    return (
        <Grid container
              direction="column"
              justifyContent="center"
              alignItems="center"
        >
            <div className="login__inner">
                <div className="login__top">
                    <a className="login__logo" href="https://quickblox.com/">
                        <img alt="QuickBlox" src="https://quickblox.com/wp-content/themes/QuickbloxTheme2021/img/header-logo.svg" />
                    </a>
                    <h1>QB UIKit React Sample</h1>
                </div>
                {children ?? children}
            </div>
            <div className="login__footer">
                <div className="footer__logo_wrap">
                    <p>Sample React Chat UIKit DemoApp  v.{packageJson.version}</p>
                    <br />
                    <p>React Chat UIKit v.{packageJson.dependencies["quickblox-react-ui-kit"]}</p>
                    <br />
                    <p><Copyright /></p>
                </div>
            </div>
        </Grid>
    );
}

export default Auth;
