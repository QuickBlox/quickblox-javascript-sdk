import { useState, useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QB = require('quickblox/quickblox.min');
import {
    QBConfig,
    QBUser,
    AIGatewayMessage,
    AIGatewayResponse,
    AISummarizeResponse,
    AITranslateResponse,
    AIHistoryItem,
    AIAnswerAssistResponse,
    QBDialog,
    QBDialogListResult,
} from '../types/quickblox';

interface UseQuickBloxReturn {
    isInitialized: boolean;
    userId: number | null;
    error: string | null;
    version: string;
    initAndLogin: (config: QBConfig, user: QBUser) => Promise<number>;
    logout: () => Promise<void>;
    gateway: (assistantId: string, messages: AIGatewayMessage[]) => Promise<AIGatewayResponse>;
    summarize: (assistantId: string, dialogId: string) => Promise<AISummarizeResponse>;
    translate: (assistantId: string, text: string, lang: string) => Promise<AITranslateResponse>;
    answerAssist: (assistantId: string, message: string, history: AIHistoryItem[]) => Promise<AIAnswerAssistResponse>;
    loadDialogs: () => Promise<QBDialog[]>;
}

export function useQuickBlox(): UseQuickBloxReturn {
    const [isInitialized, setIsInitialized] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const initAndLogin = useCallback(async (config: QBConfig, user: QBUser): Promise<number> => {
        return new Promise((resolve, reject) => {
            setError(null);

            // Initialize SDK
            QB.init(config.appId, config.authKey, config.authSecret, config.accountKey, { debug: false });

            // Create session
            const sessionParams = { login: user.login, password: user.password };
            QB.createSession(sessionParams, (err: any, result: any) => {
                if (err) {
                    const errorMsg = JSON.stringify(err);
                    setError(errorMsg);
                    reject(new Error(errorMsg));
                    return;
                }

                setUserId(result.user_id);
                setIsInitialized(true);
                resolve(result.user_id);
            });
        });
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        return new Promise((resolve) => {
            QB.destroySession((err: any) => {
                // Reset state regardless of error
                setIsInitialized(false);
                setUserId(null);
                setError(null);
                resolve();
            });
        });
    }, []);

    const gateway = useCallback(async (
        assistantId: string,
        messages: AIGatewayMessage[]
    ): Promise<AIGatewayResponse> => {
        return new Promise((resolve, reject) => {
            QB.ai.gateway(assistantId, messages, (err: any, res: AIGatewayResponse) => {
                if (err) {
                    reject(new Error(JSON.stringify(err)));
                    return;
                }
                resolve(res);
            });
        });
    }, []);

    const summarize = useCallback(async (
        assistantId: string,
        dialogId: string
    ): Promise<AISummarizeResponse> => {
        return new Promise((resolve, reject) => {
            QB.ai.summarize(assistantId, dialogId, (err: any, res: AISummarizeResponse) => {
                if (err) {
                    reject(new Error(JSON.stringify(err)));
                    return;
                }
                resolve(res);
            });
        });
    }, []);

    const translate = useCallback(async (
        assistantId: string,
        text: string,
        lang: string
    ): Promise<AITranslateResponse> => {
        return new Promise((resolve, reject) => {
            QB.ai.translate(assistantId, text, lang, (err: any, res: AITranslateResponse) => {
                if (err) {
                    reject(new Error(JSON.stringify(err)));
                    return;
                }
                resolve(res);
            });
        });
    }, []);

    const answerAssist = useCallback(async (
        assistantId: string,
        message: string,
        history: AIHistoryItem[]
    ): Promise<AIAnswerAssistResponse> => {
        return new Promise((resolve, reject) => {
            QB.ai.answerAssist(assistantId, message, history, (err: any, res: AIAnswerAssistResponse) => {
                if (err) {
                    reject(new Error(JSON.stringify(err)));
                    return;
                }
                resolve(res);
            });
        });
    }, []);

    const loadDialogs = useCallback(async (): Promise<QBDialog[]> => {
        return new Promise((resolve, reject) => {
            QB.chat.dialog.list(
                { limit: 10, sort_desc: 'updated_at' },
                (err: any, result: QBDialogListResult) => {
                    if (err) {
                        reject(new Error(JSON.stringify(err)));
                        return;
                    }
                    resolve(result.items);
                }
            );
        });
    }, []);

    return {
        isInitialized,
        userId,
        error,
        version: QB.version || 'unknown',
        initAndLogin,
        logout,
        gateway,
        summarize,
        translate,
        answerAssist,
        loadDialogs,
    };
}
