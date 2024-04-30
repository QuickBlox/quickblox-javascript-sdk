import React, {useEffect, useState} from 'react';
import {prepareSDK,  createUserAction, logout, createUserSession, connectToChatServer,
    UserCreationStatus, UserData} from './QBHeplers';
import {
    LoginData,
    MainButton,
    useQbUIKitDataContext,
    QuickBloxUIKitDesktopLayout,
    QuickBloxUIKitProvider,
    TypeButton, QBDataContextType,
} from 'quickblox-react-ui-kit';
import './App.scss';
import {QBConfig} from "./QBconfig";
import {Route, Routes, useNavigate} from "react-router-dom";
import Auth from "./layout/Auth/Auth";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";

function App() {
    const qbUIKitContext: QBDataContextType = useQbUIKitDataContext();

    const [isOnline, setIsOnline] = useState<boolean>(
        navigator.onLine
    );

    qbUIKitContext.storage.CONNECTION_REPOSITORY.subscribe((status) => {
        console.log(`Connection status: ${status ? 'CONNECTED' : 'DISCONNECTED'}`);
        if (status) {setIsOnline(true);}
        else {
            setIsOnline(false);
            setErrorMessage('Error! No Connection.');
        }
    });

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isOnline) {
            setErrorMessage('');
        }
    }, [isOnline]);

    const [isUserAuthorized, setUserAuthorized] = React.useState(false);
    const [isSDKInitialized, setSDKInitialized] = React.useState(false);

    const [theme, setTheme] = useState('lightTheme');
    const [errorMessage, setErrorMessage] = useState('');

    const initLoginData: LoginData = {
        login: '',
        password: '',
    };

    const [currentUser, setCurrentUser] = React.useState(initLoginData);
    const navigate = useNavigate();

    const loginHandler = async (data: any): Promise<void> => {
        if (isOnline) {
            setErrorMessage('');
            const loginData: LoginData = {
                login: data.login,
                password: data.password
            }
            setCurrentUser(loginData);
            setTheme(data.nameTheme);
            await loginAction(loginData);
            document.documentElement.setAttribute('data-theme', data.nameTheme);
        } else {
            setErrorMessage('Error! No connection.')
        }
    };

    const createUserHandler = async (data: UserData): Promise<void> => {
        if (isOnline) {
            setErrorMessage('');

            const resultCreateUser = await createUserAction(data);

            logout();
            switch (resultCreateUser) {
                case UserCreationStatus.UserCreated:
                    setUserAuthorized(false);
                    navigate('/sign-in');
                    break;
                case UserCreationStatus.UserExists:
                    setErrorMessage('User already exists');
                    setUserAuthorized(false);
                    navigate('/sign-up');
                    break;
                default:
                    setErrorMessage('Auth Fail');
                    setUserAuthorized(false);
                    navigate('/sign-up');
                    break;
            }
        } else  {
            setErrorMessage('Error! No connection.');
        }
    };

    const logoutUIKitHandler = async () => {
        if (isOnline) {
            qbUIKitContext.release();
            setCurrentUser({login: '', password: ''});
            setUserAuthorized(false);
            document.documentElement.setAttribute('data-theme', 'light');
            navigate('/sign-in');
        } else {
            setErrorMessage('Error! No connection.')
        }
    }

    const loginAction = async (loginData: LoginData): Promise<void> => {
        if (isSDKInitialized && !isUserAuthorized) {
            if (loginData.login.length > 0 && loginData.password.length > 0) {
                await createUserSession(loginData)
                    .then( async resultUserSession => {
                        await connectToChatServer(
                            resultUserSession,
                            currentUser.login)
                                .then( async authData => {
                                    await qbUIKitContext.authorize(authData);
                                    qbUIKitContext.setSubscribeOnSessionExpiredListener(() => {
                                        console.timeLog('call OnSessionExpiredListener ... start')
                                        logoutUIKitHandler();
                                        console.log('OnSessionExpiredListener ... end');
                                    });
                                    setSDKInitialized(true);
                                    setUserAuthorized(true);
                                    document.documentElement.setAttribute('data-theme', theme);
                                    navigate('/');
                                })
                                .catch( errorChatConnection => {
                                    handleError(errorChatConnection);
                                });
                    })
                    .catch( errorUserSession => {
                        handleError(errorUserSession);
                    });
            }
        }
    };

    const handleError = (error: any): void => {
        console.log('error:', JSON.stringify(error));
        const errorToShow = error.message.errors[0] || 'Unexpected error';
        setErrorMessage(errorToShow );
        setUserAuthorized(false);
        navigate('/sign-in');
    };

    useEffect(() => {
        if (isSDKInitialized) {
            if (currentUser
                && currentUser.login.length > 0
                && currentUser.password.length > 0) {
                loginAction(currentUser);
            } else {
                console.log('auth flow has canceled ...');
            }
        }

    }, [isSDKInitialized]);

    useEffect(() => {
        if (!isSDKInitialized) {
            prepareSDK().then(result => {
                setSDKInitialized(true);
                setUserAuthorized(false);
            }).catch(
                e => {
                    console.log('init SDK has error: ', e)
                });
        }
    }, []);


    return (
      <QuickBloxUIKitProvider
          maxFileSize={100 * 1000000}
          accountData={{ ...QBConfig.credentials }}
          loginData={{
              login: currentUser.login,
              password: currentUser.password,
          }}
          qbConfig={{...QBConfig}}
      >
          <div>

              <Routes>
                  <Route
                      path="/" element={
                      isUserAuthorized
                          ?
                              <div>
                                  <div className="main-buttons-wrapper">
                                      <MainButton
                                          typeButton={TypeButton.outlined}
                                          title="Light Theme"
                                          styleBox={{width: "200px", height: "20px"}}
                                          clickHandler = {() => {
                                              document.documentElement.setAttribute('data-theme', 'light');
                                          }}
                                      />
                                      <MainButton
                                          typeButton={TypeButton.defaultDisabled}
                                          title="Dark Theme"
                                          styleBox={{width: "200px", height: "20px"}}
                                          clickHandler = {() => {
                                              document.documentElement.setAttribute('data-theme', 'dark');
                                          }}
                                      />
                                      <MainButton
                                          typeButton={TypeButton.danger}
                                          title="Log Out"
                                          styleBox={{width: "200px", height: "20px"}}
                                          clickHandler = { logoutUIKitHandler }
                                      />
                                  </div>
                                  {/*<QuickBloxUIKitDesktopLayout theme={new CustomTheme()}  />*/}
                                  <QuickBloxUIKitDesktopLayout uikitHeightOffset="32px"/>
                              </div>
                          :
                          <Auth children={<SignIn signInHandler={loginHandler} errorMessage={errorMessage} isOnline={isOnline}/>} />} />
                  <Route path="/sign-in" element={<Auth children={<SignIn signInHandler={loginHandler} errorMessage={errorMessage} isOnline={isOnline}/>} />}/>
                  <Route path="/sign-up" element={<Auth children={<SignUp signUpHandler={createUserHandler} errorMessage={errorMessage} isOnline={isOnline} />} />}/>
              </Routes>
          </div>
      </QuickBloxUIKitProvider>
  );
}

export default App;
