import React, { useState, useCallback } from 'react';
import { useQuickBlox } from './hooks/useQuickBlox';
import {
    ConfigSection,
    GatewayTab,
    SummarizeTab,
    TranslateTab,
    AnswerAssistTab,
    LogsPanel,
} from './components';
import { QBConfig, QBUser } from './types/quickblox';
import './styles/App.css';

type TabName = 'gateway' | 'summarize' | 'translate' | 'assist';

const TABS: { id: TabName; label: string }[] = [
    { id: 'gateway', label: 'Gateway' },
    { id: 'summarize', label: 'Summarize' },
    { id: 'translate', label: 'Translate' },
    { id: 'assist', label: 'Answer Assist' },
];

export const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>('gateway');
    const [logs, setLogs] = useState<string[]>(['Page loaded. Enter credentials and click "Initialize & Login"']);
    const [assistantId, setAssistantId] = useState('');

    const {
        isInitialized,
        userId,
        version,
        initAndLogin,
        logout,
        gateway,
        summarize,
        translate,
        answerAssist,
        loadDialogs,
    } = useQuickBlox();

    const log = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        setLogs((prev) => [logEntry, ...prev]);
        console.log(message);
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    const handleLogin = useCallback(async (config: QBConfig, user: QBUser, smartChatAssistantId: string) => {
        log('Initializing QuickBlox SDK...');

        const userId = await initAndLogin(config, user);
        log(`QB.init() completed. Version: ${version}`);
        log(`Session created. User ID: ${userId}`);

        setAssistantId(smartChatAssistantId);
    }, [initAndLogin, log, version]);

    const handleLogout = useCallback(async () => {
        await logout();
        log('Session destroyed successfully');
        log('Ready to login again');
        setAssistantId('');
    }, [logout, log]);

    const handleGateway = useCallback(async (messages: any[]) => {
        return gateway(assistantId, messages);
    }, [gateway, assistantId]);

    const handleSummarize = useCallback(async (dialogId: string) => {
        return summarize(assistantId, dialogId);
    }, [summarize, assistantId]);

    const handleTranslate = useCallback(async (text: string, lang: string) => {
        return translate(assistantId, text, lang);
    }, [translate, assistantId]);

    const handleAnswerAssist = useCallback(async (message: string, history: any[]) => {
        return answerAssist(assistantId, message, history);
    }, [answerAssist, assistantId]);

    return (
        <div className="container">
            <h1>QuickBlox AI Features Demo</h1>
            <p className="subtitle">React 19 + TypeScript | All AI methods: gateway, summarize, translate, answerAssist</p>

            <ConfigSection
                isInitialized={isInitialized}
                userId={userId}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onLog={log}
            />

            {isInitialized && (
                <div className="card">
                    <div className="tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="tab-content">
                        <div className={`tab-panel ${activeTab === 'gateway' ? 'active' : ''}`}>
                            <GatewayTab
                                assistantId={assistantId}
                                onGateway={handleGateway}
                                onLog={log}
                            />
                        </div>

                        <div className={`tab-panel ${activeTab === 'summarize' ? 'active' : ''}`}>
                            <SummarizeTab
                                assistantId={assistantId}
                                onSummarize={handleSummarize}
                                onLoadDialogs={loadDialogs}
                                onLog={log}
                            />
                        </div>

                        <div className={`tab-panel ${activeTab === 'translate' ? 'active' : ''}`}>
                            <TranslateTab
                                assistantId={assistantId}
                                onTranslate={handleTranslate}
                                onLog={log}
                            />
                        </div>

                        <div className={`tab-panel ${activeTab === 'assist' ? 'active' : ''}`}>
                            <AnswerAssistTab
                                assistantId={assistantId}
                                onAnswerAssist={handleAnswerAssist}
                                onLog={log}
                            />
                        </div>
                    </div>
                </div>
            )}

            <LogsPanel logs={logs} onClear={clearLogs} />
        </div>
    );
};
