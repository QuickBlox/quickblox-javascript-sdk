import React, {useEffect, useState} from 'react';
// @ts-ignore
import * as QB from "quickblox/quickblox";


import {
    LoginData,
    QuickBloxUIKitProvider,
    qbDataContext,
    RemoteDataSource,
    useQBConnection, stringifyError, MainButton, TypeButton, QuickBloxUIKitDesktopLayout,
} from 'quickblox-react-ui-kit';
import './App.scss';
import {QBConfig} from "./QBconfig";
import {Route, Routes, useNavigate} from "react-router-dom";
import CustomTheme from './assets/CustomTheme/CustomTheme';
import Auth, {UserData} from "./layout/Auth/Auth";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";

function App() {
    const currentContext = React.useContext(qbDataContext);
    const remoteDataSource: RemoteDataSource =
        currentContext.storage.REMOTE_DATA_SOURCE;
    const { connectionRepository } = useQBConnection();
    const [authorized, setAuthorized] = useState(false);
    const [theme, setTheme] = useState('lightTheme');
    const [errorMessage, setErrorMessage] = useState('');

    const initLoginData: LoginData = {
        userName: '',
        password: '',
    };

    const [currentUser, setCurrentUser] = React.useState(initLoginData);
    const navigate = useNavigate();

    const createUser = (user: QBUser): Promise<QBUser> => {
        const QBLib = (window as any).QB;
        return new Promise((resolve, reject) => {
            const userLoginData = {
                login: user.login,
                password: user.password,
                full_name: user.full_name,
                custom_data:
                    user.custom_data ||
                    'You could store in this field any string value or null',
            };

            QBLib.users.create(userLoginData, (createErr: any, createRes: any) => {
                if (createErr) {
                    console.log(
                        'UserService',
                        'createUser()',
                        `User creation Error :  ${JSON.stringify(createErr)}`,
                    );
                    reject(createErr);
                } else {
                    console.log(
                        'UserService',
                        'createUser()',
                        `User Creation successfully`,
                    );
                    resolve(createRes);
                }
            });
        });
    }

    const loginHandler = async (data: any): Promise<void> => {
        setErrorMessage('');
        const loginData: LoginData = {
            userName: data.userName,
            password: data.password
        }
        setCurrentUser(loginData);
        setTheme(data.nameTheme);
    };

    function createSession():Promise<any> {
        const QBS = (window as any).QB;
        return new Promise((resolve, reject) => {
            QBS.createSession((sessionErr: any, sessionRes: any) => {
                if (sessionErr) {
                    reject(sessionErr);
                } else {
                    resolve(sessionRes);
                }
            });
        });
    }

    async function canLogin(user: QBUser) {
        const QBS = (window as any).QB;
        return new Promise((resolve, reject) => {
            QBS.login(user, (loginErr: any, loginRes: any) => {
                if (loginErr) {
                    reject(loginErr);
                } else {
                    resolve(loginRes);
                }
            });
        });
    }

    function logOutActions() {
        const QBS = (window as any).QB;
        QBS.chat.disconnect();
        QBS.destroySession(() => null);
    }

    const createUserHandler = async (data: UserData): Promise<void> => {
        setErrorMessage('');
        createSession().then(async () => {

            const user: QBUser = {
                id: 0,
                full_name: '',
                email: '',
                login: '',
                phone: '',
                website: '',
                created_at: '',
                updated_at: '',
                last_request_at: '',
                external_user_id: null,
                facebook_id: null,
                blob_id: null,
                custom_data: null,
                age_over16: false,
                allow_statistics_analysis: false,
                allow_sales_activities: false,
                parents_contacts: '',
                user_tags: null
            };
            user.login = data.userName;
            user.full_name = data.fullName || '';
            user.password = data.password;
            let userExists = true;
                await canLogin(user).catch(()=>{
                    userExists = false;
                });
            if (userExists) {
                logOutActions();
                setErrorMessage('User already exists');
                setAuthorized(false);
                navigate('/sign-up');
            }else{
                createUser(user)
                    .then((createRes) => {
                        logOutActions();
                        setAuthorized(false);
                        navigate('/sign-in');
                    })
                    .catch((createErr) => {
                        setErrorMessage('Auth Fail');
                        setAuthorized(false);
                        navigate('/sign-up');
                    });
            }
        }).catch((reason)=>{
            console.log(stringifyError(reason))
        })
    };

    const logoutUIKitHandler = async () => {
        console.log('call logoutUIKitHandler ... start');
        currentContext.storage.SYNC_DIALOGS_USE_CASE.release();
        connectionRepository.stopKeepAlive();
        await remoteDataSource.disconnectAndLogoutUser();
        await currentContext.storage.LOCAL_DATA_SOURCE.clearAll();
        console.log('call logoutUIKitHandler ... middle');
        setCurrentUser({userName: '', password: ''});
        setAuthorized(false);
        document.documentElement.setAttribute('data-theme', 'light');
        navigate('/sign-in');
        console.log('call logoutUIKitHandler ... end');
    }

    const loginAction = async (): Promise<void> => {
        if (currentUser.userName.length > 0 && currentUser.password.length > 0)
        {
            remoteDataSource.loginWithUser(currentUser).then(async () => {
                if (!remoteDataSource.authProcessed)
                {
                    setErrorMessage('Error in username or password');
                    setAuthorized(false);
                    navigate('/sign-in');
                    return;
                }
                remoteDataSource.setAuthProcessedSuccessed();
                await connectionRepository.initializeStates();
                if (!connectionRepository.needInit) {
                    connectionRepository.keepALiveChatConnection();
                }
                await currentContext.storage.SYNC_DIALOGS_USE_CASE.execute(() => {
                    console.log('sync dialogs has started');
                }).catch(() => {
                    console.log('sync dialogs has exception');
                });
                console.log('set subscribeOnSessionExpiredListener');
                currentContext.storage.REMOTE_DATA_SOURCE.subscribeOnSessionExpiredListener(() => {
                    console.timeLog('call OnSessionExpiredListener ... start')
                    logoutUIKitHandler();
                    console.log('OnSessionExpiredListener ... end');
                })

                setAuthorized(true);
                document.documentElement.setAttribute('data-theme', theme);
                navigate('/');
            }).catch((loginErr)=>{
                setErrorMessage(loginErr);
                setAuthorized(false);
                navigate('/sign-in');
            });
        }
    };

    const prepareSDK = async (): Promise<void> => {
        if ((window as any).QB === undefined){
            if (QB !== undefined){
                (window as any).QB = QB;
            }else{
                let QBLib = require('quickblox/quickblox.min');
                (window as any).QB = QBLib;
            }
        }

        RemoteDataSource.initSDK(
            {
                appIdOrToken: QBConfig.credentials.appId,
                authKeyOrAppId: QBConfig.credentials.authKey,
                authSecret: QBConfig.credentials.authSecret,
                accountKey: QBConfig.credentials.accountKey,
                config: QBConfig.appConfig,
            }
        );
        remoteDataSource.setInitSDKSuccessed();

        QB.chat.onSessionExpiredListener = (error: any) => {
            if (error) {
                console.log('onSessionExprideListener - error: ',  error);
            } else {
                console.log('onSessionExprideListener - Ok');
                console.log('call  QB.chat.onSessionExpiredListener  ... start');
                logoutUIKitHandler();
                console.log(' QB.chat.onSessionExpiredListener  ... end');
            }
        };

    };


    useEffect(() => {
        if (currentUser && currentUser.userName.length > 0 && currentUser.password.length > 0) {
            loginAction().then(() => {
            }).catch(()=>{
                setAuthorized(false);
                navigate('/sign-in');
            });
        } else {
            setAuthorized(false);
            navigate('/sign-in');
        }
    }, [currentUser]);

    useEffect(() => {
        prepareSDK().catch();
    }, []);


    return (
      <QuickBloxUIKitProvider
          maxFileSize={100 * 1000000}
          accountData={{ ...QBConfig.credentials, sessionToken: '' }}
          loginData={{
              userName: currentUser.userName,
              password: currentUser.password,
          }}
      >
          <div className="App">

              <Routes>
                  <Route
                      path="/" element={
                      authorized
                          ?
                          <div>
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
                                  <QuickBloxUIKitDesktopLayout   />
                              </div>
                          </div>
                          :
                          <Auth children={<SignIn signInHandler={loginHandler} errorMessage={errorMessage}/>} />} />
                  <Route path="/sign-in" element={<Auth children={<SignIn signInHandler={loginHandler} errorMessage={errorMessage}/>} />}/>
                  <Route path="/sign-up" element={<Auth children={<SignUp signUpHandler={createUserHandler} errorMessage={errorMessage} />} />}/>
              </Routes>
          </div>
      </QuickBloxUIKitProvider>
  );
}

export default App;
