import './SignIn.scss';
import React, {useEffect, useState} from "react";
import {Link as RouterLink} from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Button,
    CssBaseline, FormControl, FormControlLabel, FormLabel,
    Grid,
    Paper, Radio, RadioGroup,
    TextField,
    Typography
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
    FunctionTypeLoginDataToVoid,
    messageValidatorUserName, messageValidatorUserPassword,
    nicknameValidate,
    passwordValidate
} from "../layout/Auth/Auth";

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
    const [stateTheme, setStateTheme] = useState({theme: 'light'});
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

    const onChangeThemeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        event.persist();
        const {id} = event.target;
        setStateTheme(prev => ({...prev, theme: id}))
    };

    const submitForm = (event: React.SyntheticEvent) => {
        event.preventDefault();
        const data = {
            login: userName,
            password: userPassword,
            nameTheme: stateTheme.theme
        };

        if (signInHandler) {
            signInHandler(data);
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
                        <LockOutlinedIcon/>
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
                        <FormControl>
                            <FormLabel id="demo-row-radio-buttons-group-label">Theme</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                            >
                                <FormControlLabel value="light" control={
                                    <Radio
                                        id="light"
                                        name="theme"
                                        checked={stateTheme.theme === 'light'}
                                        onChange={onChangeThemeHandler}/>}
                                                  label="Light"/>
                                <FormControlLabel value="dark" control={
                                    <Radio
                                        id="dark"
                                        name="theme"
                                        checked={stateTheme.theme === 'dark'}
                                        onChange={onChangeThemeHandler}/>}
                                                  label="Dark"/>
                            </RadioGroup>
                        </FormControl>
                        {/*Alert*/}
                        <Button
                            size='small'
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                            disabled={!validInputValues || !isOnline}
                        >
                            Sign In
                        </Button>
                        <Grid container
                              direction="row"
                              justifyContent="center"
                              alignItems="center"
                        >
                            <RouterLink to='/sign-up'>
                                {"Sign Up"}
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

export default SignIn;
