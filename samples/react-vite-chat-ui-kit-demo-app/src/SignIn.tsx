import type { FormEvent } from 'react';
import { useState } from 'react';
import type { LoginData } from 'quickblox-react-ui-kit';

type SignInProps = {
  errorMessage: string;
  onLogin: (loginData: LoginData) => Promise<void>;
};

export function SignIn({ errorMessage, onLogin }: SignInProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onLogin({ login, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-card">
      <h1>Sign in to QuickBlox chat</h1>
      <p>Use an existing QuickBlox user login and password.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Login
          <input
            autoComplete="username"
            onChange={(event) => setLogin(event.target.value)}
            required
            type="text"
            value={login}
          />
        </label>

        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}
    </main>
  );
}
