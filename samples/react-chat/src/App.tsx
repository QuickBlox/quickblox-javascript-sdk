import React, {useEffect, useState} from 'react';
// @ts-ignore
import * as QB from "quickblox/quickblox";


import {
    LoginData,
    QuickBloxUIKitProvider,
    qbDataContext,
    RemoteDataSource,
    useQBConnection, stringifyError, MainButton, TypeButton, QuickBloxUIKitDesktopLayout,
} from 'quickblox-react-ui-kit'
import './App.scss';
import {QBConfig} from "./QBconfig";
import {Route, Routes, useNavigate} from "react-router-dom";
import Login from "./Login/Login";
import Desktop from "./layout/Desktop/Desktop";

function App() {
    const currentContext = React.useContext(qbDataContext);
    const remoteDataSource: RemoteDataSource =
        currentContext.storage.REMOTE_DATA_SOURCE;
    const { connectionRepository } = useQBConnection();
    const [authorized, setAuthorized] = useState(false);
    const [theme, setTheme] = useState('lightTheme');

    const initLoginData: LoginData = {
        userName: '',
        password: '',
    };

    const [currentUser, setCurrentUser] = React.useState(initLoginData);

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

            // QBLib.users.create(userLoginData, (createErr, createRes) => {
            //     if (createErr) {
            //         console.log(
            //             'UserService',
            //             'createUser()',
            //             `User creation Error :  ${JSON.stringify(createErr)}`,
            //         );
            //         reject(createErr);
            //     } else {
            //         console.log(
            //             'UserService',
            //             'createUser()',
            //             `User Creation successfully`,
            //         );
            //         resolve(createRes);
            //     }
            // });
        });
    }

    const loginHandler = async (data: any): Promise<void> => {
        const loginData: LoginData = {
            userName: data.userName,
            password: data.password
        }
        setCurrentUser(loginData);
        setTheme(data.nameTheme);
        console.log(`call login actions: ${JSON.stringify(data)}`);
    };

    const logoutHandler = async () => {
        console.log('call logout...');
        currentContext.storage.SYNC_DIALOGS_USE_CASE.release();
        connectionRepository.stopKeepAlive();
        await remoteDataSource.disconnectAndLogoutUser();
        await currentContext.storage.LOCAL_DATA_SOURCE.clearAll();

        setCurrentUser({userName: '', password: ''});
        setAuthorized(false);
        document.documentElement.setAttribute('data-theme', 'light');
        navigate('/login');
    }

    const loginAction = async (): Promise<void> => {
        console.log('HAVE USER: ', JSON.stringify(currentUser));
        if (currentUser.userName.length > 0 && currentUser.password.length > 0)
        {
            console.log('start loginAction actions with data:', currentUser);
            remoteDataSource.loginWithUser(currentUser).then(async () => {
                remoteDataSource.setAuthProcessedSuccessed();
                await connectionRepository.initializeStates();
                console.log(
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    `3. after repo initialize, need init ${connectionRepository.needInit}`,
                );
                if (!connectionRepository.needInit) {
                    connectionRepository.keepALiveChatConnection();
                }
                await currentContext.storage.SYNC_DIALOGS_USE_CASE.execute(() => {
                    console.log('SYNC_DIALOGS_USE_CASE_MOCK.execute');
                }).catch(() => {
                    console.log('EXCEPTION SYNC_DIALOGS_USE_CASE_MOCK.execute');
                });
                currentContext.storage.REMOTE_DATA_SOURCE.subscribeOnSessionExpiredListener(() => {
                    logoutHandler();
                })

                setAuthorized(true);
                document.documentElement.setAttribute('data-theme', theme);
                navigate('/');
            }).catch((loginErr)=>{
                console.log(stringifyError((loginErr)));

                if (loginErr.status === undefined || loginErr.status !== 401) {
                    /** Login failed, trying to create account */
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
                    user.login = initLoginData.userName;
                    user.full_name = initLoginData.userName;
                    user.password = 'quickblox';

                    createUser(user)
                        .then((createRes) => {
                            console.log(
                                'UserService',
                                'login() createUser',
                                `create user success : ${createRes}`,
                            );
                            // Re login
                            remoteDataSource.loginWithUser(currentUser).then(async () => {
                                remoteDataSource.setAuthProcessedSuccessed();
                                await connectionRepository.initializeStates();
                                console.log(
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    `3. after repo initialize, need init ${connectionRepository.needInit}`,
                                );
                                if (!connectionRepository.needInit) {
                                    connectionRepository.keepALiveChatConnection();
                                }
                                await currentContext.storage.SYNC_DIALOGS_USE_CASE.execute(() => {
                                    console.log('SYNC_DIALOGS_USE_CASE_MOCK.execute');
                                }).catch(() => {
                                    console.log('EXCEPTION SYNC_DIALOGS_USE_CASE_MOCK.execute');
                                });
                                currentContext.storage.REMOTE_DATA_SOURCE.subscribeOnSessionExpiredListener(() => {
                                    logoutHandler();
                                })

                                setAuthorized(true);
                                document.documentElement.setAttribute('data-theme', theme);
                                navigate('/');
                            })
                        })
                        .catch((createErr) => {
                            console.log('Error create user: ', createErr);
                            setAuthorized(false);
                            navigate('/login');
                        });
                }
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
            }
        );
        remoteDataSource.setInitSDKSuccessed();

    };

    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && currentUser.userName.length > 0 && currentUser.password.length > 0) {
            loginAction().catch(()=>{
                setAuthorized(false);
                navigate('/login');
            });
        } else {
            setAuthorized(false);
            navigate('/login');
        }
    }, [currentUser]);

    useEffect(() => {
        console.log('0. APP INIT');
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
          <div className="App">
              <Routes>
                  {
                      authorized
                        ?
                        <Route
                            path="/"
                            element={
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
                                          clickHandler = {logoutHandler}
                                        />
                                    </div>
                                    <QuickBloxUIKitDesktopLayout />
                                    {/*<Desktop />*/}
                                </div>
                            }
                        />
                        :
                        <Route
                          path="/login"
                          element={<Login loginHandler={loginHandler} />}
                        />

                  }
              </Routes>
          </div>
          </div>

      </QuickBloxUIKitProvider>
  );
}

export default App;
