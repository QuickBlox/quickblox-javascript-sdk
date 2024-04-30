import './SignUp.scss';
import React, {useEffect, useState} from "react";
import {Link as RouterLink} from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Button,
    CssBaseline,
    Grid,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import AppRegistrationOutlinedIcon from '@mui/icons-material/AppRegistrationOutlined';
import {
    fullNameValidate,
    FunctionTypeLoginDataToVoid, messageValidatorFullName,
    messageValidatorUserName, messageValidatorUserPassword,
    nicknameValidate,
    passwordValidate
} from "../layout/Auth/Auth";
import {UserData} from "../QBHeplers";

type SignUpProps = {
    signUpHandler?: FunctionTypeLoginDataToVoid;
    errorMessage?: string;
    isOnline: boolean;
};

const SignUp: React.FC<SignUpProps> = ({signUpHandler, errorMessage, isOnline}: SignUpProps) => {
    document.title = 'Login';
    const [userName, setUserName] = useState('');
    const [fullName, setFullName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [validInputValues, setValidInputValues] = useState(false);
    const [validValue, setValidValue] = useState(
        {
            userName: {isTouched: false, isNotValid: true},
            fullName: {isTouched: false, isNotValid: true},
            userPassword: {isTouched: false, isNotValid: true}
        }
    );


    useEffect( ()=> {
        setValidInputValues(
            !validValue.userName.isNotValid && validValue.userName.isTouched
            &&
            !validValue.fullName.isNotValid && validValue.fullName.isTouched
            &&
            !validValue.userPassword.isNotValid && validValue.userPassword.isTouched
        );
    }, [validValue]);


    const submitForm = (event: React.SyntheticEvent) => {
        event.preventDefault();
        const data: UserData = {
            login: userName,
            password: userPassword,
            fullName: fullName,
        };

        if (signUpHandler) {
            signUpHandler(data);
        }
    };

    return (
        <Grid container component="main">
            <CssBaseline/>
            <Grid item xs={12} sm={12} md={12} component={Paper} elevation={6} square>
                <Box
                    sx={{
                        my: 2,
                        mx: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                        <AppRegistrationOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Member sign in
                    </Typography>
                    <Box component="form" onSubmit={submitForm} sx={{mt: 1}}>
                        <TextField
                            size='small'
                            margin="normal"
                            required
                            fullWidth
                            id="userName"
                            label="User Name"
                            name="userName"
                            value={userName}
                            onChange={(e) => {
                                setUserName(e.target.value);
                                const validValueUserName = {...validValue.userName};
                                validValueUserName.isNotValid = !nicknameValidate(e.target.value);
                                setValidValue({...validValue, userName: validValueUserName})
                            }}
                            onFocus={() => setValidValue({
                                ...validValue,
                                userName: {...validValue.userName, isTouched: true}
                            })}
                            autoComplete="off"
                            helperText={
                                validValue.userName.isTouched && validValue.userName.isNotValid
                                    ?
                                    messageValidatorUserName
                                    :
                                    null
                            }
                        />
                        <TextField
                            size='small'
                            margin="normal"
                            required
                            fullWidth
                            id="fullName"
                            label="Full Name"
                            name="fullName"
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                                const validValueFullName = {...validValue.fullName};
                                validValueFullName.isNotValid = !fullNameValidate(e.target.value);
                                setValidValue({...validValue, fullName: validValueFullName})
                            }}
                            onFocus={() => setValidValue({
                                ...validValue,
                                fullName: {...validValue.fullName, isTouched: true}
                            })}
                            autoComplete="off"
                            helperText={
                                validValue.fullName.isTouched && validValue.fullName.isNotValid
                                    ?
                                    messageValidatorFullName
                                    :
                                    null
                            }
                        />
                        <TextField
                            value={userPassword}
                            onChange={(e) => {
                                setUserPassword(e.target.value);
                                const validValueUserPassword = {...validValue.userPassword};
                                validValueUserPassword.isNotValid = !passwordValidate(e.target.value);
                                setValidValue({...validValue, userPassword: validValueUserPassword})
                            }}
                            onFocus={() => setValidValue({
                                ...validValue,
                                userPassword: {...validValue.userPassword, isTouched: true}
                            })}
                            size='small'
                            margin="normal"
                            required
                            fullWidth
                            name="userPassword"
                            label="Password"
                            type="password"
                            id="userPassword"
                            autoComplete="off"
                            helperText={
                                validValue.userPassword.isTouched && validValue.userPassword.isNotValid
                                    ?
                                    messageValidatorUserPassword
                                    :
                                    null
                            }
                        />
                        <Button
                            size='small'
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                            disabled={!validInputValues || !isOnline}
                        >
                            Sign Up
                        </Button>
                        <Grid container
                              direction="row"
                              justifyContent="center"
                              alignItems="center"
                        >
                            <RouterLink to='/sign-in'>
                                {"Sign In"}
                            </RouterLink>
                        </Grid>
                        {errorMessage || !isOnline
                            ?
                            <Grid container
                                  direction="row"
                                  justifyContent="center"
                                  alignItems="center"
                            >
                                <Alert severity="error">{!isOnline ? 'No connection.' : errorMessage}</Alert>
                            </Grid>
                            :
                            null
                        }
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}

export default SignUp;
