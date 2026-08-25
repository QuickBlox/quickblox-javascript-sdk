import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import QB from 'quickblox';
import {
  DefaultTheme,
  QuickBloxUIKitDesktopLayout,
  QuickBloxUIKitProvider,
  useQbUIKitDataContext,
} from 'quickblox-react-ui-kit';
import type {
  AuthorizationData,
  LoginData,
} from 'quickblox-react-ui-kit';
import { isQBConfigReady, QBConfig } from './QBConfig';
import { SignIn } from './SignIn';

type SessionResult = {
  user_id: number;
  token: string;
};

type ConnectParams = {
  userId: number;
  password: string;
};

const formatError = (error: unknown): string => {
  if (!error) {
    return 'Unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return 'Unexpected error';
  }
};

let isSdkPrepared = false;

const prepareSdk = (): void => {
  window.QB = QB;

  if (isSdkPrepared) {
    return;
  }

  QB.init(
    QBConfig.credentials.appId,
    QBConfig.credentials.authKey,
    QBConfig.credentials.authSecret,
    QBConfig.credentials.accountKey,
    QBConfig.appConfig,
  );

  isSdkPrepared = true;
};

const createUserSession = (loginData: LoginData): Promise<SessionResult> =>
  new Promise((resolve, reject) => {
    QB.createSession(loginData, (error, session) => {
      if (error) {
        reject(error);
        return;
      }

      if (!session) {
        reject(new Error('QuickBlox did not return a user session.'));
        return;
      }

      resolve({
        user_id: session.user_id,
        token: session.token,
      });
    });
  });

const connectToChat = (
  params: ConnectParams,
  login: string,
): Promise<AuthorizationData> =>
  new Promise((resolve, reject) => {
    QB.chat.connect(params, (error: unknown) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        userId: params.userId,
        password: params.password,
        userName: login,
        sessionToken: params.password,
      });
    });
  });

function SetupNotice() {
  return (
    <main className="page-card">
      <h1>QuickBlox React UI Kit Vite demo</h1>
      <p>
        Copy <code>.env.example</code> to <code>.env</code> and add your
        QuickBlox application credentials before signing in.
      </p>
      <pre>{`VITE_QB_APP_ID=...
VITE_QB_AUTH_KEY=...
VITE_QB_AUTH_SECRET=...
VITE_QB_ACCOUNT_KEY=...`}</pre>
      <p className="note">
        This is a demo setup. For production, generate sessions on your backend
        and avoid exposing auth secrets in the client bundle.
      </p>
    </main>
  );
}

function ChatPage({ onLogout }: { onLogout: () => Promise<void> }) {
  const theme = useMemo(() => new DefaultTheme(), []);

  return (
    <main className="chat-page">
      <header className="chat-header">
        <h1>QuickBlox React UI Kit</h1>
        <button onClick={() => void onLogout()} type="button">
          Log out
        </button>
      </header>

      <QuickBloxUIKitDesktopLayout theme={theme} />
    </main>
  );
}

function ChatApp() {
  const qbUIKitContext = useQbUIKitDataContext();
  const navigate = useNavigate();
  const [isUserAuthorized, setUserAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = useCallback(async () => {
    try {
      qbUIKitContext.release();
      QB.chat.disconnect();
      QB.destroySession(() => undefined);
    } finally {
      setUserAuthorized(false);
      navigate('/sign-in');
    }
  }, [navigate, qbUIKitContext]);

  useEffect(() => {
    qbUIKitContext.setSubscribeOnSessionExpiredListener(() => {
      void handleLogout();
    });
  }, [handleLogout, qbUIKitContext]);

  const handleLogin = async (loginData: LoginData) => {
    setErrorMessage('');

    try {
      const session = await createUserSession(loginData);
      const sessionToken = session.token;

      const authData = await connectToChat(
        {
          userId: session.user_id,
          password: sessionToken,
        },
        loginData.login,
      );

      await qbUIKitContext.authorize(authData);
      setUserAuthorized(true);
      navigate('/');
    } catch (error) {
      setUserAuthorized(false);
      setErrorMessage(formatError(error));
    }
  };

  return (
    <Routes>
      <Route
        path="/sign-in"
        element={
          isUserAuthorized ? (
            <Navigate to="/" replace />
          ) : (
            <SignIn errorMessage={errorMessage} onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/"
        element={
          isUserAuthorized ? (
            <ChatPage onLogout={handleLogout} />
          ) : (
            <Navigate to="/sign-in" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  if (!isQBConfigReady) {
    return <SetupNotice />;
  }

  try {
    prepareSdk();
  } catch (error) {
    return (
      <main className="page-card">
        <h1>QuickBlox SDK initialization failed</h1>
        <p className="error">{formatError(error)}</p>
      </main>
    );
  }

  return (
    <QuickBloxUIKitProvider
      accountData={{ ...QBConfig.credentials }}
      loginData={{ login: '', password: '' }}
      maxFileSize={QBConfig.appConfig.maxFileSize}
      qbConfig={{ ...QBConfig }}
    >
      <BrowserRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <ChatApp />
      </BrowserRouter>
    </QuickBloxUIKitProvider>
  );
}
