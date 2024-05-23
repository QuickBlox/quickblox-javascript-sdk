import {AuthorizationData, LoginData, stringifyError} from "quickblox-react-ui-kit";
import QB, {QBUser} from "quickblox/quickblox";
import {QBConfig as QBConf} from "./QBconfig";

export type UserData = {
    login: string;
    password: string;
    fullName?: string;
};

export type ParamsConnect = {
    userId: number;
    password: string;
};

export enum UserCreationStatus {
    UserSessionCreationError = -3,
    AppSessionCreationError = -2,
    UserCreationError = -1,
    UserCreated = 0,
    UserExists = 1,
}

export const prepareSDK = async (): Promise<void> => {
    // check if we have installed SDK
    if ((window as any).QB === undefined) {
        if (QB !== undefined) {
            (window as any).QB = QB;
        } else {
            let QBLib = require('quickblox/quickblox.min');
            (window as any).QB = QBLib;
        }
    }

    const APPLICATION_ID = QBConf.credentials.appId;
    const AUTH_KEY = QBConf.credentials.authKey;
    const AUTH_SECRET = QBConf.credentials.authSecret;
    const ACCOUNT_KEY = QBConf.credentials.accountKey;
    const CONFIG = QBConf.appConfig ;

    QB.init(APPLICATION_ID, AUTH_KEY, AUTH_SECRET, ACCOUNT_KEY, CONFIG);

};

export const createUser = (user: QBUserExtended): Promise<QBUser> => {
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
                reject(createErr);
            } else {
                resolve(createRes);
            }
        });
    });
};

export const createUserSession = async (loginData: LoginData): Promise<ParamsConnect> => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
        QB.createSession(loginData, async (errorCreateSession: any, session: any) => {
            if (errorCreateSession) {
                reject(errorCreateSession)
            } else {
                const userId: number = session.user_id;
                const password: string = session.token;
                const paramsConnect: ParamsConnect = { userId, password };
                resolve(paramsConnect);
            }
        });
    });
};

export const createAppSession = ():Promise<any> => {
    const QBLib = (window as any).QB;
    return new Promise((resolve, reject) => {
        QBLib.createSession((sessionErr: any, sessionRes: any) => {
            if (sessionErr) {
                reject(sessionErr);
            } else {
                resolve(sessionRes);
            }
        });
    });
};

export const connectToChatServer = async (paramsConnect: ParamsConnect, userLogin: string): Promise<AuthorizationData> => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
        QB.chat.connect(paramsConnect, async (errorConnect: any, resultConnect: any) => {
            if (errorConnect) {
                reject(errorConnect);
            } else {
                const authData: AuthorizationData = {
                    userId: paramsConnect.userId,
                    password: paramsConnect.password,
                    userName: userLogin,
                    sessionToken: paramsConnect.password
                };
                resolve(authData);
            }
        });
    });
};

export const canLogin = async (user: QBUserExtended) => {
    const QBLib = (window as any).QB;
    return new Promise((resolve, reject) => {
        QBLib.login(user, (loginErr: any, loginRes: any) => {
            if (loginErr) {
                reject(loginErr);
            } else {
                resolve(loginRes);
            }
        });
    });
}

export const logout = () => {
    const QBLib = (window as any).QB;
    QBLib.chat.disconnect();
    QBLib.destroySession(() => null);
}
export type QBUserExtended = QBUser & {password?: string};
const isUserExist = async (user: QBUserExtended): Promise<boolean> => {
    let userExists = true;
    await canLogin(user).catch(() => {
        userExists = false;
    });
    return userExists;
}

export  const qbDefaultUser: QBUserExtended = {
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

export const createUserAction = async (data: UserData): Promise<UserCreationStatus> => {
    let resultCreateUserAction: UserCreationStatus  = UserCreationStatus.UserCreated;
    createAppSession().then(async () => {
        const user: QBUserExtended = qbDefaultUser;
        user.login = data.login;
        user.full_name = data.fullName || '';
        user.password = data.password;

        const userExists: boolean = await isUserExist(user);

        if (userExists) {
            resultCreateUserAction = UserCreationStatus.UserExists;
        }else{
            createUser(user)
                .then((createRes) => {
                    resultCreateUserAction = UserCreationStatus.UserCreated;
                })
                .catch((createErr) => {
                    console.log(stringifyError(createErr));
                    resultCreateUserAction = UserCreationStatus.UserCreationError;
                });
        }
    }).catch((reason)=>{
        console.log(stringifyError(reason));
        resultCreateUserAction = UserCreationStatus.AppSessionCreationError;
    });

    return resultCreateUserAction;
};

