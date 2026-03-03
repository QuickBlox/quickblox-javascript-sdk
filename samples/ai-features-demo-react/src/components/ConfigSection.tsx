import React, { useState } from 'react';
import { QBConfig, QBUser } from '../types/quickblox';
import {
    DEFAULT_CONFIG,
    DEFAULT_USER,
    DEFAULT_SMART_CHAT_ASSISTANT_ID,
} from '../config';

interface ConfigSectionProps {
    isInitialized: boolean;
    userId: number | null;
    onLogin: (config: QBConfig, user: QBUser, assistantId: string) => Promise<void>;
    onLogout: () => Promise<void>;
    onLog: (message: string) => void;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
    isInitialized,
    userId,
    onLogin,
    onLogout,
    onLog,
}) => {
    const [config, setConfig] = useState<QBConfig>(DEFAULT_CONFIG);
    const [user, setUser] = useState<QBUser>(DEFAULT_USER);
    const [assistantId, setAssistantId] = useState(DEFAULT_SMART_CHAT_ASSISTANT_ID);
    const [status, setStatus] = useState<{ text: string; isError: boolean } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!config.appId || !config.authKey || !config.authSecret || !config.accountKey) {
            setStatus({ text: 'Please fill all credentials', isError: true });
            return;
        }

        if (!user.login || !user.password) {
            setStatus({ text: 'Please fill user credentials', isError: true });
            return;
        }

        setIsLoading(true);
        setStatus({ text: 'Initializing...', isError: false });
        onLog('Initializing QuickBlox SDK...');

        try {
            await onLogin(config, user, assistantId);
            setStatus({ text: `Logged in (User ID: ${userId})`, isError: false });
        } catch (err) {
            setStatus({ text: 'Login failed', isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsLoading(true);
        onLog('Logging out...');

        try {
            await onLogout();
            setStatus({ text: 'Logged out', isError: false });
        } catch (err) {
            // Still show logged out
            setStatus({ text: 'Logged out', isError: false });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Configuration</h2>
            </div>
            <div className="card-content">
                <div className="form-row">
                    <div className="form-group">
                        <label>App ID</label>
                        <input
                            type="text"
                            value={config.appId || ''}
                            onChange={(e) => setConfig({ ...config, appId: parseInt(e.target.value) || 0 })}
                            disabled={isInitialized}
                        />
                    </div>
                    <div className="form-group">
                        <label>Auth Key</label>
                        <input
                            type="text"
                            value={config.authKey}
                            onChange={(e) => setConfig({ ...config, authKey: e.target.value })}
                            disabled={isInitialized}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Auth Secret</label>
                        <input
                            type="text"
                            value={config.authSecret}
                            onChange={(e) => setConfig({ ...config, authSecret: e.target.value })}
                            disabled={isInitialized}
                        />
                    </div>
                    <div className="form-group">
                        <label>Account Key</label>
                        <input
                            type="text"
                            value={config.accountKey}
                            onChange={(e) => setConfig({ ...config, accountKey: e.target.value })}
                            disabled={isInitialized}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>User Login</label>
                        <input
                            type="text"
                            value={user.login}
                            onChange={(e) => setUser({ ...user, login: e.target.value })}
                            disabled={isInitialized}
                        />
                    </div>
                    <div className="form-group">
                        <label>User Password</label>
                        <input
                            type="password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            disabled={isInitialized}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Smart Chat Assistant ID</label>
                        <input
                            type="text"
                            value={assistantId}
                            onChange={(e) => setAssistantId(e.target.value)}
                            disabled={isInitialized}
                        />
                    </div>
                </div>

                <div className="button-group">
                    <button
                        className="btn btn-primary"
                        onClick={handleLogin}
                        disabled={isInitialized || isLoading}
                    >
                        Initialize & Login
                    </button>

                    {isInitialized && (
                        <button
                            className="btn btn-danger"
                            onClick={handleLogout}
                            disabled={isLoading}
                        >
                            Logout
                        </button>
                    )}

                    {status && (
                        <span className={`status ${status.isError ? 'error' : 'success'}`}>
                            {status.text}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
