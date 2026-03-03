import React, { useState } from 'react';
import { AIHistoryItem } from '../types/quickblox';

interface AnswerAssistTabProps {
    assistantId: string;
    onAnswerAssist: (message: string, history: AIHistoryItem[]) => Promise<{ answer: string }>;
    onLog: (message: string) => void;
}

interface HistoryItemState extends AIHistoryItem {
    id: number;
}

let historyIdCounter = 1;

export const AnswerAssistTab: React.FC<AnswerAssistTabProps> = ({
    assistantId,
    onAnswerAssist,
    onLog,
}) => {
    const [message, setMessage] = useState('Where is my order?');
    const [history, setHistory] = useState<HistoryItemState[]>([
        { id: historyIdCounter++, role: 'user', message: 'Hello' },
    ]);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const addHistoryItem = () => {
        setHistory([
            ...history,
            { id: historyIdCounter++, role: 'user', message: '' },
        ]);
        onLog('Added history item');
    };

    const removeHistoryItem = (id: number) => {
        setHistory(history.filter((item) => item.id !== id));
    };

    const updateHistoryItem = (id: number, field: 'role' | 'message', value: string) => {
        setHistory(
            history.map((item) =>
                item.id === id
                    ? { ...item, [field]: value as 'user' | 'assistant' }
                    : item
            )
        );
    };

    const clearHistory = () => {
        setHistory([]);
        onLog('History cleared');
    };

    const sendAssist = async () => {
        if (!assistantId) {
            onLog('ERROR: Smart Chat Assistant ID is required');
            return;
        }

        const inputMessage = message.trim();
        if (!inputMessage) {
            onLog('ERROR: Please enter a message');
            return;
        }

        // Filter out empty history items
        const validHistory: AIHistoryItem[] = history
            .filter((item) => item.message.trim())
            .map(({ role, message }) => ({ role, message }));

        setIsLoading(true);
        setIsError(false);
        setResponse('Loading...');
        onLog(`Sending to answerAssist: "${inputMessage.substring(0, 30)}..." (history: ${validHistory.length} items)`);

        try {
            const result = await onAnswerAssist(inputMessage, validHistory);
            setResponse(result.answer);
            onLog('Answer received');
        } catch (err) {
            setIsError(true);
            setResponse(`Error: ${err}`);
            onLog(`ERROR: answerAssist failed - ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="section-title">QB.ai.answerAssist()</h3>
            <p className="section-description">
                AI assistant with conversation history support
            </p>

            <div className="form-group">
                <label>Your message</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                />
            </div>

            <div className="form-group">
                <label>Chat History (optional)</label>
                <div className="history-container">
                    {history.map((item) => (
                        <div key={item.id} className="history-item">
                            <select
                                value={item.role}
                                onChange={(e) => updateHistoryItem(item.id, 'role', e.target.value)}
                            >
                                <option value="user">user</option>
                                <option value="assistant">assistant</option>
                            </select>
                            <input
                                type="text"
                                value={item.message}
                                onChange={(e) => updateHistoryItem(item.id, 'message', e.target.value)}
                                placeholder="Message"
                            />
                            <button
                                className="btn-remove"
                                onClick={() => removeHistoryItem(item.id)}
                                title="Remove"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <button className="btn btn-flat" onClick={addHistoryItem}>
                    + Add history item
                </button>
            </div>

            <div className="button-group">
                <button
                    className="btn btn-primary"
                    onClick={sendAssist}
                    disabled={isLoading}
                >
                    Send
                </button>
                <button className="btn btn-flat" onClick={clearHistory}>
                    Clear History
                </button>
            </div>

            <div className="response-section">
                <h4>Answer:</h4>
                <div className={`response-box ${isLoading ? 'loading' : ''} ${isError ? 'error' : ''}`}>
                    {response}
                </div>
            </div>
        </div>
    );
};
