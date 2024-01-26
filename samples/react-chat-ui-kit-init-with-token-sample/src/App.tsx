import React, {useEffect, useState} from 'react';

// @ts-ignore
import QB from "quickblox/quickblox";
import {
  QuickBloxUIKitProvider,
  QuickBloxUIKitDesktopLayout, LoginData, AuthorizationData,
  QBDataContextType,
  useQbUIKitDataContext
} from 'quickblox-react-ui-kit';
import {QBConfig as QBConf} from './QBconfig';
import './App.css';

function App() {

  const currentUser: LoginData = {
    login: 'USER1',
    password: 'YOU_USER1_PASSWORD',
  };

  const qbUIKitContext: QBDataContextType = useQbUIKitDataContext();

  const [isUserAuthorized, setUserAuthorized] = React.useState(false);
  const [isSDKInitialized, setSDKInitialized] = React.useState(false);
  const [token, setToken] = useState<string>('');
    const createUserSession =  function() {

        const QuickBlox = require('quickblox/quickblox.min').QuickBlox;
        const QBOther = new QuickBlox();

        const APPLICATION_ID = QBConf.credentials.appId;
        const AUTH_KEY = QBConf.credentials.authKey;
        const AUTH_SECRET = QBConf.credentials.authSecret;
        const ACCOUNT_KEY = QBConf.credentials.accountKey;
        const CONFIG = QBConf.appConfig;

        QBOther.init(APPLICATION_ID, AUTH_KEY, AUTH_SECRET, ACCOUNT_KEY, CONFIG);


        const userRequiredParams = {
            'login': 'USER2_FOR_WORK',
            'password': 'YOU_USER2_PASSWORD'
        };

        return new Promise(function(resolve, reject) {
            console.log('Create User Session QB.createSession, params ', JSON.stringify(userRequiredParams));
            QBOther.createSession(userRequiredParams, function (error: any, result: any) {
                if (error) {
                    console.log('createUserSession error in QB.createSession', JSON.stringify(error));
                    reject(error);
                } else {
                    console.log('createUserSession ok in QB.createSession', JSON.stringify(result));
                    resolve(result);
                }
            });
        });
    };

    useEffect(() => {
        createUserSession().then((userData: any)=>{
            setToken(userData.token);
        }).catch(reason =>{
            console.log(reason);
        });

    }, []);

    useEffect(() => {
        if (token && !isSDKInitialized){
            // check if we have installed SDK
            if ((window as any).QB === undefined) {
                if (QB !== undefined) {
                    (window as any).QB = QB;
                } else {
                    let QBLib = require('quickblox/quickblox.min');
                    (window as any).QB = QBLib;
                }
            }
            //
            const sessionToken = token;
            const APPLICATION_ID = QBConf.credentials.appId;
            // const AUTH_KEY = QBConfig.credentials.authKey;
            // const AUTH_SECRET = QBConfig.credentials.authSecret;
            const ACCOUNT_KEY = QBConf.credentials.accountKey;
            const CONFIG = QBConf.appConfig;

            QB.initWithAppId(APPLICATION_ID, ACCOUNT_KEY, CONFIG);
            console.log('QB version: ', QB.version, 'QB build: ', QB.buildNumber);

            console.log('Get session....');

            QB.startSessionWithToken(sessionToken, function(err: any, sessionData: any){
                if (err){
                    console.log('Error startSessionWithToken');
                } else {
                    const userId: number = sessionData.session.user_id;
                    const password: string = sessionData.session.token;
                    const paramsConnect = { userId, password };

                    QB.chat.connect(paramsConnect, async function (errorConnect: any, resultConnect: any) {
                        if (errorConnect) {
                            console.log('Can not connect to chat server: ', errorConnect);
                        } else {
                            const authData: AuthorizationData = {
                                userId: userId,
                                password: password,
                                userName: currentUser.login,
                                sessionToken: sessionData.session.token
                            };
                            await qbUIKitContext.authorize(authData);
                            setSDKInitialized(true);
                            setUserAuthorized(true);
                        }
                    });
                }
            });
        }

    }, [token]);


  return (
      <div>
        <QuickBloxUIKitProvider
            maxFileSize={100 * 1000000}
            accountData={{ ...QBConf.credentials }}
            loginData={{
              login: currentUser.login,
              password: currentUser.password,
            }}
            qbConfig={{... QBConf}}
        >
          <div className="App">
            {
              // React states indicating the ability to render UI
              isSDKInitialized && isUserAuthorized
                  ?
                  <QuickBloxUIKitDesktopLayout uikitHeightOffset={"32px"} />
                  :
                  <div>wait while SDK is initializing...</div>
            }
          </div>
        </QuickBloxUIKitProvider>
      </div>
  );
}

export default App;
