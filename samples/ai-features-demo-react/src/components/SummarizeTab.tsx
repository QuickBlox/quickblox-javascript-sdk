import React, { useState } from 'react';
import { QBDialog } from '../types/quickblox';

interface SummarizeTabProps {
    assistantId: string;
    onSummarize: (dialogId: string) => Promise<{ summary: string }>;
    onLoadDialogs: () => Promise<QBDialog[]>;
    onLog: (message: string) => void;
}

export const SummarizeTab: React.FC<SummarizeTabProps> = ({
    assistantId,
    onSummarize,
    onLoadDialogs,
    onLog,
}) => {
    const [dialogId, setDialogId] = useState('');
    const [dialogs, setDialogs] = useState<QBDialog[]>([]);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDialogs, setIsLoadingDialogs] = useState(false);
    const [isError, setIsError] = useState(false);

    const loadDialogs = async () => {
        setIsLoadingDialogs(true);
        onLog('Loading dialogs...');

        try {
            const items = await onLoadDialogs();
            setDialogs(items);
            onLog(`Loaded ${items.length} dialogs`);
        } catch (err) {
            onLog(`ERROR: Failed to load dialogs - ${err}`);
            setDialogs([]);
        } finally {
            setIsLoadingDialogs(false);
        }
    };

    const selectDialog = (id: string) => {
        setDialogId(id);
        onLog(`Selected dialog: ${id}`);
    };

    const summarize = async () => {
        if (!assistantId) {
            onLog('ERROR: Smart Chat Assistant ID is required');
            return;
        }

        const id = dialogId.trim();
        if (!id) {
            onLog('ERROR: Please enter or select a Dialog ID');
            return;
        }

        setIsLoading(true);
        setIsError(false);
        setResponse('Loading...');
        onLog(`Summarizing dialog: ${id}`);

        try {
            const result = await onSummarize(id);
            setResponse(result.summary);
            onLog('Summary received');
        } catch (err) {
            setIsError(true);
            setResponse(`Error: ${err}`);
            onLog(`ERROR: Summarize failed - ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="section-title">QB.ai.summarize()</h3>
            <p className="section-description">
                Generate dialog summary (up to 1000 recent messages)
            </p>

            <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                    <label>Dialog ID</label>
                    <input
                        type="text"
                        value={dialogId}
                        onChange={(e) => setDialogId(e.target.value)}
                        placeholder="Enter Dialog ID"
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        className="btn btn-primary"
                        onClick={loadDialogs}
                        disabled={isLoadingDialogs}
                    >
                        {isLoadingDialogs ? 'Loading...' : 'Load My Dialogs'}
                    </button>
                </div>
            </div>

            {dialogs.length > 0 && (
                <ul className="dialog-list">
                    {dialogs.map((dialog) => (
                        <li key={dialog._id} className="dialog-item">
                            <a href="#" onClick={(e) => { e.preventDefault(); selectDialog(dialog._id); }}>
                                {dialog.name || `Dialog ${dialog._id.substring(0, 8)}`}
                            </a>
                            <span className="unread">
                                ({dialog.unread_messages_count || 0} unread)
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <button
                className="btn btn-primary mt-10"
                onClick={summarize}
                disabled={isLoading}
            >
                Summarize Dialog
            </button>

            <div className="response-section">
                <h4>Summary:</h4>
                <div className={`response-box ${isLoading ? 'loading' : ''} ${isError ? 'error' : ''}`}>
                    {response}
                </div>
            </div>
        </div>
    );
};
